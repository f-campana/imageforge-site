#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import {
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  unlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import {
  evaluateBehaviorContract,
  isEmptyGeneratedState,
  isReleaseIdentity,
} from "./release-contract.mjs";

const DEFAULT_RELEASE_PATH = "data/release.json";
const DEFAULT_OUTPUT_PATH = ".tmp/governance/release-behavior.json";

function runCommand(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    timeout: 120_000,
    maxBuffer: 4 * 1024 * 1024,
  });
  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    error: result.error?.message ?? null,
  };
}

async function exists(filePath) {
  try {
    await readFile(filePath);
    return true;
  } catch {
    try {
      const entries = await readdir(filePath);
      return Array.isArray(entries);
    } catch {
      return false;
    }
  }
}

async function createInput(root, name, fixturePath) {
  const input = path.join(root, name, "input");
  await mkdir(input, { recursive: true });
  await copyFile(fixturePath, path.join(input, "fixture.png"));
  return input;
}

export async function runVerifyReleaseBehavior({
  rootDir = process.cwd(),
  releasePath = path.join(rootDir, DEFAULT_RELEASE_PATH),
  outputPath = path.join(rootDir, DEFAULT_OUTPUT_PATH),
  runCommandImpl = runCommand,
  now = new Date(),
} = {}) {
  const outputAbsolutePath = path.resolve(outputPath);
  const workspace = await mkdtemp(
    path.join(tmpdir(), "imageforge-release-behavior-"),
  );
  let report;

  try {
    const release = JSON.parse(
      await readFile(path.resolve(releasePath), "utf8"),
    );
    if (!isReleaseIdentity(release)) {
      throw new Error(
        "Release metadata does not contain a trusted package identity and evidence contract.",
      );
    }
    await writeFile(
      path.join(workspace, "package.json"),
      `${JSON.stringify({ private: true })}\n`,
    );
    const packageSpec = `${release.package}@${release.version}`;
    const install = runCommandImpl(
      "npm",
      [
        "install",
        "--no-audit",
        "--no-fund",
        "--package-lock=false",
        "--save=false",
        "--ignore-scripts",
        packageSpec,
      ],
      workspace,
    );
    if (install.status !== 0) {
      throw new Error(
        `Could not install ${packageSpec}: ${install.error ?? install.stderr}`,
      );
    }

    const fixturePath = path.join(workspace, "fixture.png");
    const fixture = runCommandImpl(
      "node",
      [
        "-e",
        "require('sharp')({create:{width:8,height:8,channels:3,background:{r:40,g:90,b:140}}}).png().toFile(process.argv[1]).catch((error)=>{console.error(error);process.exit(1)})",
        fixturePath,
      ],
      workspace,
    );
    if (fixture.status !== 0) {
      throw new Error(
        `Could not create the behavior fixture: ${fixture.error ?? fixture.stderr}`,
      );
    }

    const binary = path.join(workspace, "node_modules", ".bin", "imageforge");
    const runs = [];
    const runCli = (args) => {
      const result = runCommandImpl(binary, args, workspace);
      runs.push({
        args,
        status: result.status,
        stderr: result.stderr.slice(-800),
      });
      return result;
    };

    const dryRunInput = await createInput(workspace, "dry-run", fixturePath);
    const dryRunRoot = path.dirname(dryRunInput);
    const dryRunOut = path.join(dryRunRoot, "generated");
    const dryRunManifest = path.join(dryRunRoot, "imageforge.json");
    const dryRun = runCli([
      dryRunInput,
      "--dry-run",
      "--out-dir",
      dryRunOut,
      "-o",
      dryRunManifest,
    ]);
    if (dryRun.status !== 0) {
      throw new Error(
        "Published CLI dry-run fixture did not exit successfully.",
      );
    }
    const dryRunIsFilesystemPure = !(
      (await exists(dryRunOut)) ||
      (await exists(dryRunManifest)) ||
      (await exists(path.join(dryRunOut, ".imageforge-cache.json"))) ||
      (await exists(path.join(dryRunOut, ".imageforge-cache.json.lock")))
    );

    const checkInput = await createInput(workspace, "check", fixturePath);
    const checkRoot = path.dirname(checkInput);
    const checkOut = path.join(checkRoot, "generated");
    const checkManifest = path.join(checkRoot, "imageforge.json");
    const initialCheck = runCli([
      checkInput,
      "--check",
      "--out-dir",
      checkOut,
      "-o",
      checkManifest,
    ]);
    if (initialCheck.status !== 1) {
      throw new Error(
        "Published CLI check fixture did not report ungenerated state.",
      );
    }
    const checkIsFilesystemPure = !(
      (await exists(checkOut)) ||
      (await exists(checkManifest)) ||
      (await exists(path.join(checkOut, ".imageforge-cache.json"))) ||
      (await exists(path.join(checkOut, ".imageforge-cache.json.lock")))
    );

    const manifestInput = await createInput(workspace, "manifest", fixturePath);
    const manifestRoot = path.dirname(manifestInput);
    const manifestPath = path.join(manifestRoot, "imageforge.json");
    const generated = runCli([manifestInput, "-o", manifestPath]);
    if (generated.status !== 0) {
      throw new Error("Published CLI could not generate the behavior fixture.");
    }
    const tampered = JSON.parse(await readFile(manifestPath, "utf8"));
    tampered.images["fixture.png"].hash = "tampered";
    await writeFile(manifestPath, `${JSON.stringify(tampered, null, 2)}\n`);
    const manifestCheck = runCli([
      manifestInput,
      "--check",
      "--json",
      "-o",
      manifestPath,
    ]);
    const manifestReport = JSON.parse(manifestCheck.stdout);
    const checkValidatesManifest =
      manifestCheck.status === 1 &&
      manifestReport.errors?.some((error) => error.code === "MANIFEST_STALE");

    const restored = runCli([manifestInput, "-o", manifestPath]);
    if (restored.status !== 0) {
      throw new Error("Published CLI could not restore the behavior fixture.");
    }
    await unlink(path.join(manifestInput, "fixture.png"));
    const emptyRun = runCli([manifestInput, "-o", manifestPath]);
    if (emptyRun.status !== 0) {
      throw new Error(
        "Published CLI empty-input fixture did not exit successfully.",
      );
    }
    const afterDeletion = JSON.parse(await readFile(manifestPath, "utf8"));
    const cacheAfterDeletion = JSON.parse(
      await readFile(
        path.join(manifestInput, ".imageforge-cache.json"),
        "utf8",
      ),
    );
    const emptyInputReconcilesGeneratedState = isEmptyGeneratedState({
      manifest: afterDeletion,
      cache: cacheAfterDeletion,
    });

    const observed = {
      dryRunIsFilesystemPure,
      checkIsFilesystemPure,
      checkValidatesManifest,
      emptyInputReconcilesGeneratedState,
    };
    const evaluation = evaluateBehaviorContract({
      declared: release.behavior,
      observed,
    });
    report = {
      version: "1.0.0",
      generatedAt: now.toISOString(),
      status: evaluation.ok ? "pass" : "fail",
      package: packageSpec,
      packageIntegrity: release.evidence?.packageIntegrity ?? null,
      sourceGitHead: release.evidence?.sourceGitHead ?? null,
      declared: release.behavior,
      observed,
      runs,
      ...evaluation,
    };
  } catch (error) {
    report = {
      version: "1.0.0",
      generatedAt: now.toISOString(),
      status: "fail",
      reason: "release_behavior_verification_failed",
      message: error instanceof Error ? error.message : String(error),
    };
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }

  await mkdir(path.dirname(outputAbsolutePath), { recursive: true });
  await writeFile(outputAbsolutePath, `${JSON.stringify(report, null, 2)}\n`);
  return report;
}

export async function main() {
  const report = await runVerifyReleaseBehavior();
  process.stdout.write(`${JSON.stringify(report)}\n`);
  if (report.status !== "pass") process.exitCode = 1;
}

const isMainModule =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
