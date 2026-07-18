import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  evaluateReleaseFreshness,
  fetchPackumentWithRetry,
  runCheckReleaseFreshness,
} from "../check-release-freshness.mjs";

const release = {
  package: "@imageforge/cli",
  version: "0.1.9",
  publishedAt: "2026-06-04T14:33:05.358Z",
  evidence: {
    packageIntegrity: "sha512-example",
    sourceGitHead: "84921702849f80b5be5c3448c77dadac7a8611c0",
    verificationCommand: "node scripts/governance/verify-release-behavior.mjs",
  },
  behavior: {
    dryRunIsFilesystemPure: false,
    checkIsFilesystemPure: false,
    checkValidatesManifest: false,
    emptyInputReconcilesGeneratedState: false,
  },
};
const packument = {
  "dist-tags": { latest: "0.1.9" },
  time: { "0.1.9": "2026-06-04T14:33:05.358Z" },
  versions: {
    "0.1.9": {
      dist: { integrity: "sha512-example" },
      gitHead: "84921702849f80b5be5c3448c77dadac7a8611c0",
    },
  },
};

test("evaluateReleaseFreshness accepts matching npm provenance", () => {
  const result = evaluateReleaseFreshness({ release, packument });
  assert.equal(result.ok, true);
  assert.equal(result.reason, "current");
});

test("evaluateReleaseFreshness rejects a newer npm release", () => {
  const result = evaluateReleaseFreshness({
    release,
    packument: {
      "dist-tags": { latest: "0.2.0" },
      time: { "0.2.0": "2026-07-20T10:00:00.000Z" },
      versions: {
        "0.2.0": {
          dist: { integrity: "sha512-new" },
          gitHead: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        },
      },
    },
  });
  assert.equal(result.ok, false);
  assert.equal(result.reason, "release_metadata_mismatch");
});

test("evaluateReleaseFreshness requires an explicit behavior contract", () => {
  const releaseWithoutBehavior = {
    package: release.package,
    version: release.version,
    publishedAt: release.publishedAt,
    evidence: release.evidence,
  };
  const result = evaluateReleaseFreshness({
    release: releaseWithoutBehavior,
    packument,
  });
  assert.equal(result.ok, false);
  assert.equal(result.reason, "invalid_release_metadata");
});

test("evaluateReleaseFreshness rejects partial and extended behavior contracts", () => {
  for (const behavior of [
    {},
    { ...release.behavior, checkValidatesManifest: undefined },
    { ...release.behavior, unexpected: false },
  ]) {
    const result = evaluateReleaseFreshness({
      release: { ...release, behavior },
      packument,
    });
    assert.equal(result.ok, false);
    assert.equal(result.reason, "invalid_release_metadata");
  }
});

test("evaluateReleaseFreshness rejects invalid local and registry dates", () => {
  assert.equal(
    evaluateReleaseFreshness({
      release: { ...release, publishedAt: "not-a-date" },
      packument,
    }).reason,
    "invalid_release_metadata",
  );
  assert.equal(
    evaluateReleaseFreshness({
      release,
      packument: {
        "dist-tags": { latest: "0.1.9" },
        time: { "0.1.9": "not-a-date" },
        versions: packument.versions,
      },
    }).reason,
    "invalid_registry_response",
  );
});

test("evaluateReleaseFreshness rejects package evidence drift", () => {
  const result = evaluateReleaseFreshness({
    release: {
      ...release,
      evidence: { ...release.evidence, packageIntegrity: "sha512-different" },
    },
    packument,
  });
  assert.equal(result.ok, false);
  assert.equal(result.reason, "release_metadata_mismatch");
});

test("fetchPackumentWithRetry recovers from a transient registry failure", async () => {
  let calls = 0;
  const delays = [];
  const signals = [];
  const result = await fetchPackumentWithRetry({
    fetchImpl: async (_url, options) => {
      calls += 1;
      signals.push(options.signal);
      return calls === 1
        ? { ok: false, status: 503 }
        : { ok: true, json: async () => packument };
    },
    sleepImpl: async (delay) => delays.push(delay),
    retryDelaysMs: [10, 20],
  });

  assert.equal(result.attempts, 2);
  assert.deepEqual(result.packument, packument);
  assert.deepEqual(delays, [10]);
  assert.equal(signals.length, 2);
  assert.ok(signals.every((signal) => signal instanceof AbortSignal));
});

test("fetchPackumentWithRetry bounds a stalled registry request", async () => {
  await assert.rejects(
    fetchPackumentWithRetry({
      fetchImpl: async (_url, { signal }) =>
        new Promise((_resolve, reject) => {
          signal.addEventListener("abort", () => reject(signal.reason), {
            once: true,
          });
        }),
      retryDelaysMs: [],
      requestTimeoutMs: 5,
    }),
    (error) => {
      assert.match(error.message, /failed after 1 attempts/u);
      assert.equal(error.attempts.length, 1);
      assert.equal(error.attempts[0].status, null);
      assert.equal(error.attempts[0].retriable, true);
      return true;
    },
  );
});

test("fetchPackumentWithRetry does not retry a permanent client error", async () => {
  let calls = 0;
  await assert.rejects(
    fetchPackumentWithRetry({
      fetchImpl: async () => {
        calls += 1;
        return { ok: false, status: 404 };
      },
      sleepImpl: async () => {},
      retryDelaysMs: [0, 0],
    }),
    (error) => {
      assert.match(error.message, /failed after 1 attempts/u);
      assert.deepEqual(error.attempts, [
        {
          attempt: 1,
          status: 404,
          retriable: false,
          error: "npm registry returned 404",
        },
      ]);
      return true;
    },
  );

  assert.equal(calls, 1);
});

test("runCheckReleaseFreshness persists an auditable report", async () => {
  const tempDir = mkdtempSync(path.join(tmpdir(), "imageforge-release-"));
  const releasePath = path.join(tempDir, "release.json");
  const outputPath = path.join(tempDir, "release-freshness.json");
  writeFileSync(releasePath, `${JSON.stringify(release)}\n`);

  const report = await runCheckReleaseFreshness({
    releasePath,
    outputPath,
    fetchImpl: async () => ({ ok: true, json: async () => packument }),
    now: new Date("2026-07-18T00:00:00.000Z"),
  });

  assert.equal(report.status, "pass");
  assert.equal(
    JSON.parse(await readFile(outputPath, "utf8")).reason,
    "current",
  );
});

test("runCheckReleaseFreshness fails closed on registry errors", async () => {
  const tempDir = mkdtempSync(path.join(tmpdir(), "imageforge-release-error-"));
  const releasePath = path.join(tempDir, "release.json");
  writeFileSync(releasePath, `${JSON.stringify(release)}\n`);

  const report = await runCheckReleaseFreshness({
    releasePath,
    outputPath: path.join(tempDir, "report.json"),
    fetchImpl: async () => ({ ok: false, status: 503 }),
    sleepImpl: async () => {},
    retryDelaysMs: [0, 0],
  });

  assert.equal(report.status, "fail");
  assert.equal(report.reason, "release_check_failed");
  assert.match(report.message, /failed after 3 attempts/u);
  assert.equal(report.registryAttempts, 3);
  assert.equal(report.registryAttemptHistory.length, 3);
});
