import { describe, expect, it } from "vitest";

import {
  IMAGEFORGE_CLI_BEHAVIOR,
  IMAGEFORGE_CLI_PACKAGE_SPEC,
  IMAGEFORGE_CLI_PUBLISHED_AT,
  IMAGEFORGE_CLI_VERSION,
} from "@/lib/release";

describe("release provenance", () => {
  it("reads a published CLI version from checked-in evidence", () => {
    expect(IMAGEFORGE_CLI_VERSION).toMatch(/^\d+\.\d+\.\d+$/u);
    expect(IMAGEFORGE_CLI_PACKAGE_SPEC).toBe(
      `@imageforge/cli@${IMAGEFORGE_CLI_VERSION}`,
    );
    expect(new Date(IMAGEFORGE_CLI_PUBLISHED_AT).toISOString()).toBe(
      IMAGEFORGE_CLI_PUBLISHED_AT,
    );
    expect(IMAGEFORGE_CLI_BEHAVIOR).toEqual({
      dryRunIsFilesystemPure: true,
      checkIsFilesystemPure: true,
      checkValidatesManifest: true,
      emptyInputReconcilesGeneratedState: true,
    });
  });
});
