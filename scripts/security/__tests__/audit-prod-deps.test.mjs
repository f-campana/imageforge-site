import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { spawnSync } from "node:child_process";

const ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
  "..",
);
const AUDIT_SCRIPT = path.join(ROOT, "security", "audit-prod-deps.mjs");

function makeBinDir(tempDir) {
  const binDir = path.join(tempDir, "bin");
  mkdirSync(binDir, { recursive: true });
  return { binDir };
}

function writePnpmStub(binDir, scriptBody) {
  const pnpmPath = path.join(binDir, "pnpm");
  writeFileSync(pnpmPath, scriptBody, { encoding: "utf-8", mode: 0o755 });
}

test("audit wrapper fails closed when pnpm audit reports high vulnerabilities", () => {
  const tempDir = mkdtempSync(
    path.join(tmpdir(), "imageforge-site-audit-fi-vuln-"),
  );
  const { binDir } = makeBinDir(tempDir);

  writePnpmStub(
    binDir,
    `#!/bin/sh
if [ "$1" = "audit" ]; then
  echo '{"metadata":{"vulnerabilities":{"high":1,"critical":0}}}'
  exit 1
fi

echo "unexpected pnpm args: $*" >&2
exit 2
`,
  );

  const result = spawnSync("node", [AUDIT_SCRIPT], {
    encoding: "utf-8",
    env: {
      ...process.env,
      PATH: `${binDir}:${process.env.PATH ?? ""}`,
    },
  });

  assert.equal(result.status, 1);
  assert.match(
    result.stderr,
    /Security vulnerabilities detected by pnpm audit/,
  );
});

test("audit wrapper fails closed when primary and fallback scanners are unavailable", () => {
  const tempDir = mkdtempSync(
    path.join(tmpdir(), "imageforge-site-audit-fi-unavail-"),
  );
  const { binDir } = makeBinDir(tempDir);

  writePnpmStub(
    binDir,
    `#!/bin/sh
if [ "$1" = "audit" ]; then
  echo "permission denied" >&2
  exit 1
fi

if [ "$1" = "list" ]; then
  echo "list unavailable" >&2
  exit 1
fi

echo "unexpected pnpm args: $*" >&2
exit 2
`,
  );

  const result = spawnSync("node", [AUDIT_SCRIPT], {
    encoding: "utf-8",
    env: {
      ...process.env,
      PATH: `${binDir}:${process.env.PATH ?? ""}`,
    },
  });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Fallback scanner unavailable/);
});
