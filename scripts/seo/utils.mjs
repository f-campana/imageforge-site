import { access, readFile, readdir } from "node:fs/promises";

export async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readText(filePath) {
  return readFile(filePath, "utf8");
}

export async function readTextOrNull(filePath) {
  try {
    return await readText(filePath);
  } catch {
    return null;
  }
}

export async function listFilesRecursively(directory, filter) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const absolute = `${directory}/${entry.name}`;
      if (entry.isDirectory()) {
        return listFilesRecursively(absolute, filter);
      }

      if (!filter || filter(absolute)) {
        return [absolute];
      }

      return [];
    }),
  );

  return nested.flat();
}

export function compactWhitespace(input) {
  return input.replace(/\s+/g, " ").trim();
}

export function extractTextLike(input) {
  return input
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[{}()[\],;:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractHrefs(input) {
  return Array.from(
    input.matchAll(/href\s*=\s*["']([^"']+)["']/g),
    (match) => match[1],
  );
}

export function extractTargetBlankAnchors(input) {
  const anchors = input.match(/<a\b[\s\S]*?<\/a>/g) ?? [];
  return anchors.filter((anchor) => /target\s*=\s*["']_blank["']/.test(anchor));
}

export function extractAltValues(input) {
  const values = [];

  for (const match of input.matchAll(/<img\b[\s\S]*?alt\s*=\s*["']([^"']*)["']/g)) {
    values.push(match[1]);
  }

  for (const match of input.matchAll(
    /<Image\b[\s\S]*?alt\s*=\s*["']([^"']*)["']/g,
  )) {
    values.push(match[1]);
  }

  return values;
}

export function ensureArray(value) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}
