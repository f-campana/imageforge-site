import { IMAGEFORGE_CLI_BEHAVIOR, IMAGEFORGE_CLI_VERSION } from "@/lib/release";

export type ReleaseBehavior = {
  dryRunIsFilesystemPure: boolean;
  checkIsFilesystemPure: boolean;
  checkValidatesManifest: boolean;
  emptyInputReconcilesGeneratedState: boolean;
};

export function buildReleaseBehaviorCopy(
  version: string,
  behavior: ReleaseBehavior,
) {
  const publishedVersion = `Published version ${version}`;

  return {
    dryRunContract: behavior.dryRunIsFilesystemPure
      ? `${publishedVersion} keeps --dry-run filesystem-pure: it does not write derivatives, the manifest, cache state, output directories, or cache locks.`
      : `${publishedVersion} dry-run skips derivative, manifest, and cache-file writes, but it can create the output directory and a transient cache lock.`,
    dryRunReference: `--dry-run / --no-dry-run: ${behavior.dryRunIsFilesystemPure ? "filesystem-pure preview without derivative, manifest, cache, output-directory, or lock writes" : "preview without derivative, manifest, or cache-file writes; it can create the output directory and a transient cache lock"} in version ${version}`,
    checkContract: behavior.checkValidatesManifest
      ? `${publishedVersion} exits with code 1 when source, cache, output, or manifest state is stale.`
      : `${publishedVersion} exits with code 1 when source, cache, or output state is stale. It does not validate imageforge.json, so validate and commit the manifest alongside the generated files.`,
    checkWriteContract: behavior.checkIsFilesystemPure
      ? "Check mode does not write project state."
      : "It can create a transient cache lock.",
    checkReference: `--check / --no-check: ${behavior.checkValidatesManifest ? "source, cache, output, and manifest" : "source, cache, and output"} freshness assertion for CI in version ${version}`,
    ciCheckCaveat: behavior.checkValidatesManifest
      ? `${publishedVersion} validates the manifest together with source, cache, and derivative state.`
      : `${publishedVersion} does not validate the manifest, so review it with the generated files.`,
    manifestContract: behavior.checkValidatesManifest
      ? `${publishedVersion} check mode evaluates source hashes, options, cache entries, expected derivative files, and imageforge.json.`
      : `${publishedVersion} check mode evaluates source hashes, options, cache entries, and expected derivative files. It does not validate imageforge.json, so treat the manifest and generated files as one reviewed change and regenerate them together.`,
    deletedSourceContract: behavior.emptyInputReconcilesGeneratedState
      ? `${publishedVersion} rewrites the manifest and cache to current empty state after the final source is deleted. Review and remove orphaned derivative files explicitly; ImageForge does not delete them automatically.`
      : `${publishedVersion} does not rewrite an empty manifest/cache after the final source is deleted. Remove stale generated state explicitly after reviewing which source owned it. When other sources remain, a normal run prunes deleted entries, but ImageForge still does not automatically delete orphaned derivative files.`,
    manifestReviewChecklist: behavior.checkValidatesManifest
      ? "Review imageforge.json with the generated files; check mode validates both as one generated-state contract"
      : `In published CLI ${version}, review imageforge.json with the generated files because check mode does not validate the manifest`,
  };
}

export const PUBLISHED_RELEASE_COPY = buildReleaseBehaviorCopy(
  IMAGEFORGE_CLI_VERSION,
  IMAGEFORGE_CLI_BEHAVIOR,
);
