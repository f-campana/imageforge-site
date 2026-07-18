export const BEHAVIOR_KEYS = Object.freeze([
  "dryRunIsFilesystemPure",
  "checkIsFilesystemPure",
  "checkValidatesManifest",
  "emptyInputReconcilesGeneratedState",
]);

export const RELEASE_PACKAGE = "@imageforge/cli";

export function isPlainRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isBehaviorContract(value) {
  if (!isPlainRecord(value)) return false;
  return (
    Object.keys(value).length === BEHAVIOR_KEYS.length &&
    BEHAVIOR_KEYS.every(
      (key) => Object.hasOwn(value, key) && typeof value[key] === "boolean",
    )
  );
}

export function isReleaseIdentity(value) {
  if (!isPlainRecord(value) || value.package !== RELEASE_PACKAGE) return false;
  if (
    typeof value.version !== "string" ||
    !/^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?$/u.test(
      value.version,
    )
  ) {
    return false;
  }
  const evidence = value.evidence;
  return (
    isPlainRecord(evidence) &&
    typeof evidence.packageIntegrity === "string" &&
    /^sha512-[A-Za-z0-9+/]+={0,2}$/u.test(evidence.packageIntegrity) &&
    typeof evidence.sourceGitHead === "string" &&
    /^[a-f0-9]{40}$/u.test(evidence.sourceGitHead)
  );
}

export function evaluateBehaviorContract({ declared, observed }) {
  if (!isBehaviorContract(declared) || !isBehaviorContract(observed)) {
    return {
      ok: false,
      mismatches: [
        {
          key: "behavior_contract_shape",
          declared: isBehaviorContract(declared) ? "valid" : "invalid",
          observed: isBehaviorContract(observed) ? "valid" : "invalid",
        },
      ],
    };
  }

  const mismatches = BEHAVIOR_KEYS.filter(
    (key) => declared[key] !== observed[key],
  ).map((key) => ({ key, declared: declared[key], observed: observed[key] }));
  return { ok: mismatches.length === 0, mismatches };
}

export function isEmptyGeneratedState({ manifest, cache }) {
  return (
    isPlainRecord(manifest) &&
    isPlainRecord(manifest.images) &&
    isPlainRecord(cache) &&
    isPlainRecord(cache.entries) &&
    Object.keys(manifest.images).length === 0 &&
    Object.keys(cache.entries).length === 0
  );
}
