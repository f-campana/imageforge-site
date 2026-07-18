import { describe, expect, it } from "vitest";

import {
  buildReleaseBehaviorCopy,
  type ReleaseBehavior,
} from "@/lib/docs/release-copy";

const allFalse: ReleaseBehavior = {
  dryRunIsFilesystemPure: false,
  checkIsFilesystemPure: false,
  checkValidatesManifest: false,
  emptyInputReconcilesGeneratedState: false,
};

const allTrue: ReleaseBehavior = {
  dryRunIsFilesystemPure: true,
  checkIsFilesystemPure: true,
  checkValidatesManifest: true,
  emptyInputReconcilesGeneratedState: true,
};

describe("published release behavior copy", () => {
  it("describes conservative legacy behavior", () => {
    const fields = buildReleaseBehaviorCopy("0.1.9", allFalse);
    const copy = JSON.stringify(fields);

    expect(Object.values(fields).every((value) => value.length > 0)).toBe(true);
    expect(copy).toContain("Published version 0.1.9");
    expect(copy).toContain("can create the output directory");
    expect(copy).toContain("transient cache lock");
    expect(fields.dryRunReference).toContain("can create the output directory");
    expect(copy).toContain("does not validate imageforge.json");
    expect(fields.ciCheckCaveat).toBe(
      "Published version 0.1.9 does not validate the manifest, so review it with the generated files.",
    );
    expect(copy).toContain("does not rewrite an empty manifest/cache");
    expect(fields.checkReference).toContain("source, cache, and output");
  });

  it("describes every verified modern capability", () => {
    const fields = buildReleaseBehaviorCopy("0.2.0", allTrue);
    const copy = JSON.stringify(fields);

    expect(Object.values(fields).every((value) => value.length > 0)).toBe(true);
    expect(copy).toContain("Published version 0.2.0");
    expect(copy).toContain("keeps --dry-run filesystem-pure");
    expect(fields.dryRunReference).toContain("filesystem-pure preview");
    expect(copy).toContain("Check mode does not write project state");
    expect(copy).toContain("and imageforge.json");
    expect(fields.ciCheckCaveat).toBe(
      "Published version 0.2.0 validates the manifest together with source, cache, and derivative state.",
    );
    expect(fields.checkReference).toContain(
      "source, cache, output, and manifest",
    );
    expect(copy).toContain(
      "rewrites the manifest and cache to current empty state",
    );
  });
});
