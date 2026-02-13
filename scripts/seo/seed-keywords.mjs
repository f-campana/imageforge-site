import path from "node:path";

import {
  listFilesRecursively,
  readTextOrNull,
  extractTextLike,
} from "./utils.mjs";

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "that",
  "with",
  "from",
  "this",
  "your",
  "into",
  "when",
  "where",
  "will",
  "have",
  "has",
  "can",
  "not",
  "are",
  "was",
  "were",
  "you",
  "our",
  "they",
  "their",
  "them",
  "about",
  "then",
  "than",
  "out",
  "all",
  "new",
  "use",
  "using",
  "via",
  "json",
  "code",
  "file",
  "app",
  "page",
  "next",
  "build",
  "time",
  "site",
  "landing",
  "run",
]);

const BASE_TERMS = [
  "imageforge cli",
  "image optimization cli",
  "next.js image optimization",
  "build-time image optimization",
  "webp conversion",
  "avif conversion",
  "blurdataurl generation",
  "hash-based image caching",
  "deterministic image optimization",
  "ci image optimization checks",
];

function tokenize(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token));
}

function topTerms(words, limit = 20) {
  const counts = new Map();
  for (const word of words) {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

function topBigrams(words, limit = 15) {
  const counts = new Map();

  for (let index = 0; index < words.length - 1; index += 1) {
    const first = words[index];
    const second = words[index + 1];

    if (first.length < 3 || second.length < 3) {
      continue;
    }

    const bigram = `${first} ${second}`;
    counts.set(bigram, (counts.get(bigram) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([bigram]) => bigram);
}

export async function seedKeywords(config) {
  const sourceFiles = [
    path.join(config.rootDir, "README.md"),
    ...(await listFilesRecursively(config.appDir, (filePath) =>
      /\.(tsx|ts|md)$/.test(filePath),
    )),
    ...(await listFilesRecursively(config.componentsDir, (filePath) =>
      /\.(tsx|ts|md)$/.test(filePath),
    )),
  ];

  const texts = await Promise.all(
    sourceFiles.map(async (filePath) => ({
      filePath,
      text: extractTextLike((await readTextOrNull(filePath)) ?? ""),
    })),
  );

  const tokens = texts.flatMap((entry) => tokenize(entry.text));
  const dynamicTerms = [
    ...topTerms(tokens, 18),
    ...topBigrams(tokens, 12),
  ].filter(
    (term) =>
      term.includes("image") ||
      term.includes("forge") ||
      term.includes("webp") ||
      term.includes("avif") ||
      term.includes("cache") ||
      term.includes("placeholder"),
  );

  const uniqueKeywords = [...new Set([...BASE_TERMS, ...dynamicTerms])];

  return {
    locale: config.locale,
    extractedAt: new Date().toISOString(),
    keywords: uniqueKeywords.slice(0, 30),
    sources: sourceFiles.map((filePath) =>
      path.relative(config.rootDir, filePath),
    ),
  };
}
