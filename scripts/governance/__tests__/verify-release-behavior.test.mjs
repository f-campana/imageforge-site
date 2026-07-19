import assert from "node:assert/strict";
import test from "node:test";

import {
  evaluateBehaviorContract,
  isEmptyGeneratedState,
  isReleaseIdentity,
} from "../release-contract.mjs";

const declared = {
  dryRunIsFilesystemPure: false,
  checkIsFilesystemPure: false,
  checkValidatesManifest: false,
  emptyInputReconcilesGeneratedState: false,
};

test("evaluateBehaviorContract accepts matching package observations", () => {
  assert.deepEqual(
    evaluateBehaviorContract({ declared, observed: { ...declared } }),
    { ok: true, mismatches: [] },
  );
});

test("evaluateBehaviorContract reports each mismatched capability", () => {
  const result = evaluateBehaviorContract({
    declared,
    observed: { ...declared, checkValidatesManifest: true },
  });

  assert.equal(result.ok, false);
  assert.deepEqual(result.mismatches, [
    { key: "checkValidatesManifest", declared: false, observed: true },
  ]);
});

test("evaluateBehaviorContract fails closed on incomplete or extended evidence", () => {
  for (const invalid of [
    {},
    { ...declared, checkValidatesManifest: undefined },
    { ...declared, unexpected: false },
  ]) {
    const result = evaluateBehaviorContract({
      declared: invalid,
      observed: { ...declared },
    });
    assert.equal(result.ok, false);
    assert.equal(result.mismatches[0].key, "behavior_contract_shape");
  }

  assert.equal(evaluateBehaviorContract({ declared, observed: {} }).ok, false);
});

test("isEmptyGeneratedState requires both manifest and cache reconciliation", () => {
  assert.equal(
    isEmptyGeneratedState({
      manifest: { images: {} },
      cache: { version: 1, entries: {} },
    }),
    true,
  );
  assert.equal(
    isEmptyGeneratedState({
      manifest: { images: {} },
      cache: { version: 1, entries: { "fixture.png": { hash: "stale" } } },
    }),
    false,
  );
  assert.equal(
    isEmptyGeneratedState({
      manifest: { images: { "fixture.png": {} } },
      cache: { version: 1, entries: {} },
    }),
    false,
  );
  for (const malformed of [
    { manifest: {}, cache: {} },
    { manifest: { images: [] }, cache: { entries: {} } },
    { manifest: { images: {} }, cache: { entries: [] } },
    { manifest: null, cache: { entries: {} } },
  ]) {
    assert.equal(isEmptyGeneratedState(malformed), false);
  }
});

test("isReleaseIdentity accepts only the pinned package and evidence shape", () => {
  const valid = {
    package: "@imageforge/cli",
    version: "0.1.9",
    evidence: {
      packageIntegrity: `sha512-${"A".repeat(86)}==`,
      sourceGitHead: "a".repeat(40),
    },
  };
  assert.equal(isReleaseIdentity(valid), true);
  assert.equal(isReleaseIdentity({ ...valid, package: "lookalike" }), false);
  assert.equal(isReleaseIdentity({ ...valid, version: "latest" }), false);
  assert.equal(
    isReleaseIdentity({
      ...valid,
      evidence: { ...valid.evidence, packageIntegrity: "sha1-aa" },
    }),
    false,
  );
});
