#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const PRIMARY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000;
const OSV_BATCH_SIZE = 100;

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function runCommand(command, args) {
  const result = spawnSync(command, args, {
    encoding: "utf-8",
  });

  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    error: result.error,
  };
}

function toCombinedOutput(result) {
  return `${result.stdout}\n${result.stderr}`.trim();
}

function tryParseJson(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

function isTransientErrorMessage(text) {
  return /\b(5\d\d|EAI_AGAIN|ECONNRESET|ENOTFOUND|ETIMEDOUT|ECONNREFUSED)\b|Internal Server Error|Service Unavailable|Bad Gateway|fetch failed|socket hang up|upstream/i.test(
    text,
  );
}

function classifyPnpmAudit(result) {
  if (result.error) {
    const message = String(result.error.message || result.error);
    if (isTransientErrorMessage(message)) {
      return { kind: "transient", reason: message };
    }
    return { kind: "unavailable", reason: message };
  }

  const combined = toCombinedOutput(result);
  const parsed = tryParseJson(result.stdout) ?? tryParseJson(combined);

  if (parsed?.metadata?.vulnerabilities) {
    const vulnerabilities = parsed.metadata.vulnerabilities;
    const high = Number(vulnerabilities.high ?? 0);
    const critical = Number(vulnerabilities.critical ?? 0);

    if (high + critical > 0) {
      return {
        kind: "vulnerable",
        reason: `high=${high.toString()} critical=${critical.toString()}`,
      };
    }

    if (result.status === 0) {
      return { kind: "clean", reason: "No high/critical vulnerabilities." };
    }
  }

  if (result.status === 0) {
    return { kind: "clean", reason: "Audit completed successfully." };
  }

  if (isTransientErrorMessage(combined)) {
    return {
      kind: "transient",
      reason: combined || "Transient audit endpoint failure.",
    };
  }

  return {
    kind: "unavailable",
    reason:
      combined || `pnpm audit exited with code ${result.status.toString()}`,
  };
}

function collectPackagesFromNode(node, packages) {
  const dependencies =
    node && typeof node === "object" ? node.dependencies : null;
  if (!dependencies || typeof dependencies !== "object") {
    return;
  }

  for (const [name, dependency] of Object.entries(dependencies)) {
    if (!dependency || typeof dependency !== "object") {
      continue;
    }

    const version =
      typeof dependency.version === "string" ? dependency.version : "";
    if (version) {
      packages.add(`${name}@${version}`);
    }

    collectPackagesFromNode(dependency, packages);
  }
}

function parsePackageRef(ref) {
  const atIndex = ref.lastIndexOf("@");
  if (atIndex <= 0 || atIndex >= ref.length - 1) {
    return null;
  }

  return {
    name: ref.slice(0, atIndex),
    version: ref.slice(atIndex + 1),
  };
}

async function runOsvFallback() {
  console.log(
    "Primary scanner unavailable after retries. Running OSV fallback scanner.",
  );

  const listResult = runCommand("pnpm", [
    "list",
    "--prod",
    "--depth",
    "Infinity",
    "--json",
  ]);
  if (listResult.status !== 0) {
    throw new Error(
      `Failed to enumerate production dependencies:\n${toCombinedOutput(listResult)}`,
    );
  }

  const parsedList = tryParseJson(listResult.stdout);
  if (!Array.isArray(parsedList) || parsedList.length === 0) {
    throw new Error("Unable to parse dependency graph for OSV fallback scan.");
  }

  const packageRefs = new Set();
  for (const rootNode of parsedList) {
    collectPackagesFromNode(rootNode, packageRefs);
  }

  const packages = [...packageRefs]
    .map((ref) => parsePackageRef(ref))
    .filter((entry) => entry !== null);

  if (packages.length === 0) {
    console.log("OSV fallback found no production dependency entries to scan.");
    return { vulnerabilities: [] };
  }

  const vulnerabilities = [];
  for (let index = 0; index < packages.length; index += OSV_BATCH_SIZE) {
    const batch = packages.slice(index, index + OSV_BATCH_SIZE);
    const response = await fetch("https://api.osv.dev/v1/querybatch", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        queries: batch.map((entry) => ({
          package: {
            name: entry.name,
            ecosystem: "npm",
          },
          version: entry.version,
        })),
      }),
    });

    if (!response.ok) {
      throw new Error(
        `OSV query failed (${response.status.toString()} ${response.statusText}).`,
      );
    }

    const payload = await response.json();
    const results = Array.isArray(payload?.results) ? payload.results : [];

    for (let offset = 0; offset < results.length; offset += 1) {
      const result = results[offset];
      const packageMeta = batch[offset];
      const vulns = Array.isArray(result?.vulns) ? result.vulns : [];
      for (const vuln of vulns) {
        vulnerabilities.push({
          package: `${packageMeta.name}@${packageMeta.version}`,
          id: typeof vuln?.id === "string" ? vuln.id : "UNKNOWN",
          summary: typeof vuln?.summary === "string" ? vuln.summary : "",
        });
      }
    }
  }

  return { vulnerabilities };
}

async function main() {
  for (let attempt = 1; attempt <= PRIMARY_ATTEMPTS; attempt += 1) {
    console.log(
      `Running pnpm audit attempt ${attempt.toString()} of ${PRIMARY_ATTEMPTS.toString()}...`,
    );
    const result = runCommand("pnpm", [
      "audit",
      "--prod",
      "--audit-level=high",
      "--json",
    ]);
    const classification = classifyPnpmAudit(result);

    if (classification.kind === "clean") {
      console.log("pnpm audit passed.");
      return;
    }

    if (classification.kind === "vulnerable") {
      console.error(
        `Security vulnerabilities detected by pnpm audit (${classification.reason}).`,
      );
      process.exitCode = 1;
      return;
    }

    if (classification.kind === "transient") {
      console.warn(`Transient pnpm audit failure: ${classification.reason}`);
      if (attempt < PRIMARY_ATTEMPTS) {
        await delay(RETRY_DELAY_MS);
        continue;
      }
    } else {
      console.warn(`pnpm audit unavailable: ${classification.reason}`);
    }

    try {
      const fallback = await runOsvFallback();
      if (fallback.vulnerabilities.length > 0) {
        console.error(
          `OSV fallback detected ${fallback.vulnerabilities.length.toString()} vulnerabilities in production dependencies.`,
        );
        for (const vulnerability of fallback.vulnerabilities.slice(0, 10)) {
          const summary = vulnerability.summary
            ? ` — ${vulnerability.summary}`
            : "";
          console.error(
            `- ${vulnerability.id} in ${vulnerability.package}${summary}`,
          );
        }
        if (fallback.vulnerabilities.length > 10) {
          console.error(
            `...and ${String(fallback.vulnerabilities.length - 10)} more.`,
          );
        }
        process.exitCode = 1;
        return;
      }

      console.log("OSV fallback scan passed with no vulnerabilities detected.");
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Fallback scanner unavailable: ${message}`);
      process.exitCode = 1;
      return;
    }
  }
}

await main();
