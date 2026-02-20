#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const WORKFLOWS_DIR = path.join(ROOT, ".github", "workflows");
const PINNED_REF_PATTERN = /^[0-9a-f]{40}$/;

function readWorkflowFiles(dir) {
  if (!fs.existsSync(dir)) {
    throw new Error(`Workflow directory not found: ${dir}`);
  }

  return fs
    .readdirSync(dir)
    .filter(
      (fileName) => fileName.endsWith(".yml") || fileName.endsWith(".yaml"),
    )
    .sort()
    .map((fileName) => path.join(dir, fileName));
}

function collectViolations(filePath) {
  const lines = fs.readFileSync(filePath, "utf-8").split(/\r?\n/u);
  const violations = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const match = line.match(/^\s*uses:\s*([^\s#]+)\s*(?:#.*)?$/u);
    if (!match) {
      continue;
    }

    const value = match[1].trim();
    if (value.startsWith("./") || value.startsWith("docker://")) {
      continue;
    }

    const atIndex = value.lastIndexOf("@");
    if (atIndex <= 0 || atIndex === value.length - 1) {
      violations.push({
        filePath,
        line: index + 1,
        uses: value,
        reason: "missing ref",
      });
      continue;
    }

    const ref = value.slice(atIndex + 1);
    if (!PINNED_REF_PATTERN.test(ref)) {
      violations.push({
        filePath,
        line: index + 1,
        uses: value,
        reason: "non-pinned ref",
      });
    }
  }

  return violations;
}

function main() {
  const files = readWorkflowFiles(WORKFLOWS_DIR);
  const violations = files.flatMap((filePath) => collectViolations(filePath));

  if (violations.length === 0) {
    console.log(
      `Workflow action pinning check passed (${files.length.toString()} files).`,
    );
    return;
  }

  console.error("Workflow action pinning violations detected:");
  for (const violation of violations) {
    const relativePath = path.relative(ROOT, violation.filePath);
    console.error(
      `- ${relativePath}:${violation.line.toString()} (${violation.reason}) uses: ${violation.uses}`,
    );
  }

  process.exitCode = 1;
}

main();
