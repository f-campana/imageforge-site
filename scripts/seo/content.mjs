import path from "node:path";

import { makeCheck, makeOpportunity } from "./types.mjs";
import { seedKeywords } from "./seed-keywords.mjs";
import { compactWhitespace, extractTextLike, listFilesRecursively, readTextOrNull } from "./utils.mjs";

function parseMetadataValue(source, key) {
  const quotedPattern = new RegExp(`${key}\\s*:\\s*"([^"]+)"`);
  const singleQuotedPattern = new RegExp(`${key}\\s*:\\s*'([^']+)'`);

  return (
    source.match(quotedPattern)?.[1] ?? source.match(singleQuotedPattern)?.[1] ?? null
  );
}

function collectTopLevelMetadataEntries(source, key) {
  const pattern = new RegExp(`^\\s{2}${key}:\\s*[\"']([^\"']+)[\"']`, "gm");
  return Array.from(source.matchAll(pattern), (match) => match[1]);
}

export function evaluateKeywordCoverage(text, keywords) {
  const normalizedText = text.toLowerCase();

  const covered = [];
  const missing = [];

  for (const keyword of keywords) {
    if (normalizedText.includes(keyword.toLowerCase())) {
      covered.push(keyword);
    } else {
      missing.push(keyword);
    }
  }

  return {
    covered,
    missing,
    coverageRatio: keywords.length === 0 ? 1 : covered.length / keywords.length,
  };
}

export function evaluateTitleDescription(title, description) {
  const issues = [];

  if (!title) {
    issues.push("Missing title");
  } else if (title.length < 20 || title.length > 65) {
    issues.push(`Title length ${title.length} is outside 20-65 characters`);
  }

  if (!description) {
    issues.push("Missing meta description");
  } else if (description.length < 70 || description.length > 170) {
    issues.push(
      `Description length ${description.length} is outside 70-170 characters`,
    );
  }

  return issues;
}

export async function runContentChecks(config) {
  const checks = [];
  const opportunities = [];

  const layoutPath = path.join(config.appDir, "layout.tsx");
  const layoutSource = (await readTextOrNull(layoutPath)) ?? "";

  const title = parseMetadataValue(layoutSource, "title");
  const description = parseMetadataValue(layoutSource, "description");
  const titleDescriptionIssues = evaluateTitleDescription(title, description);

  checks.push(
    makeCheck({
      id: "content.title_description_quality",
      suite: "content",
      severity: "high",
      status: titleDescriptionIssues.length === 0 ? "pass" : "warn",
      message:
        titleDescriptionIssues.length === 0
          ? "Title and description lengths are in recommended range."
          : "Title/description quality needs adjustment.",
      evidence:
        titleDescriptionIssues.length === 0
          ? `title=${title?.length ?? 0}, description=${description?.length ?? 0}`
          : titleDescriptionIssues.join("; "),
      fixHint:
        "Keep title around 50-60 chars and description around 120-160 chars with clear product intent.",
      file: "app/layout.tsx",
    }),
  );

  const routePageFiles = await listFilesRecursively(config.appDir, (filePath) =>
    /page\.tsx$/.test(filePath),
  );
  const landingComponentsDir = path.join(config.componentsDir, "landing");
  const landingContentFiles = await listFilesRecursively(
    landingComponentsDir,
    (filePath) => /\.(tsx|ts)$/.test(filePath),
  );
  const crawlableContentFiles = [...new Set([...routePageFiles, ...landingContentFiles])];

  const sourceText = compactWhitespace(
    (
      await Promise.all(
        crawlableContentFiles.map(async (filePath) =>
          extractTextLike((await readTextOrNull(filePath)) ?? ""),
        ),
      )
    ).join(" "),
  );

  const wordCount = sourceText.split(/\s+/).filter(Boolean).length;

  checks.push(
    makeCheck({
      id: "content.copy_depth",
      suite: "content",
      severity: "medium",
      status: wordCount >= 250 ? "pass" : "warn",
      message:
        wordCount >= 250
          ? "Page copy depth is adequate for a focused landing page."
          : "Landing page copy appears thin for broad SEO intent coverage.",
      evidence: `Approximate crawlable word count: ${wordCount} across ${crawlableContentFiles.length} route/content source files.`,
      fixHint:
        "Add concise explanatory sections that target user intent questions and integration examples.",
      file: "app/page.tsx",
    }),
  );

  const keywordSeed = await seedKeywords(config);
  const coverage = evaluateKeywordCoverage(sourceText, keywordSeed.keywords);
  const coverageStatus = coverage.coverageRatio >= 0.55 ? "pass" : "warn";

  checks.push(
    makeCheck({
      id: "content.keyword_cluster_coverage",
      suite: "content",
      severity: "high",
      status: coverageStatus,
      message:
        coverageStatus === "pass"
          ? "Seed keyword cluster coverage is healthy."
          : "Seed keyword cluster coverage is below threshold.",
      evidence: `coverage=${(coverage.coverageRatio * 100).toFixed(1)}% (${coverage.covered.length}/${keywordSeed.keywords.length}) over crawlable route content`,
      fixHint:
        "Expand copy and headings with missing high-intent terms that match product capabilities.",
      file: "components/landing/Hero.tsx",
    }),
  );

  const metadataFiles = await listFilesRecursively(config.appDir, (filePath) =>
    /(page|layout)\.tsx$/.test(filePath),
  );

  const metadataSources = await Promise.all(
    metadataFiles.map(async (filePath) => (await readTextOrNull(filePath)) ?? ""),
  );

  const topLevelTitles = metadataSources.flatMap((source) =>
    collectTopLevelMetadataEntries(source, "title"),
  );
  const topLevelDescriptions = metadataSources.flatMap((source) =>
    collectTopLevelMetadataEntries(source, "description"),
  );

  const titleFrequency = new Map();
  for (const value of topLevelTitles) {
    titleFrequency.set(value, (titleFrequency.get(value) ?? 0) + 1);
  }

  const descriptionFrequency = new Map();
  for (const value of topLevelDescriptions) {
    descriptionFrequency.set(value, (descriptionFrequency.get(value) ?? 0) + 1);
  }

  const duplicateTitles = [...titleFrequency.entries()].filter(([, count]) => count > 1);
  const duplicateDescriptions = [...descriptionFrequency.entries()].filter(
    ([, count]) => count > 1,
  );

  checks.push(
    makeCheck({
      id: "content.duplicate_metadata_signals",
      suite: "content",
      severity: "medium",
      status:
        duplicateTitles.length > 0 || duplicateDescriptions.length > 0
          ? "warn"
          : "pass",
      message:
        duplicateTitles.length > 0 || duplicateDescriptions.length > 0
          ? "Duplicate top-level metadata values detected across route metadata."
          : "No duplicate top-level metadata values detected across route metadata.",
      evidence:
        duplicateTitles.length > 0 || duplicateDescriptions.length > 0
          ? `duplicate titles=${duplicateTitles.map(([value]) => value).join(" | ") || "none"}, duplicate descriptions=${duplicateDescriptions.map(([value]) => value).join(" | ") || "none"}`
          : `route metadata files scanned=${metadataFiles.length}`,
      fixHint: "Keep one authoritative title/description per route metadata object.",
      file: "app",
    }),
  );

  for (const keyword of coverage.missing.slice(0, 8)) {
    opportunities.push(
      makeOpportunity({
        type: "content",
        priority: "medium",
        title: `Add intent coverage for \"${keyword}\"`,
        rationale:
          "This keyword was generated from existing copy context but is not explicitly covered in crawlable text.",
        target: "app/page.tsx",
      }),
    );
  }

  opportunities.push(
    makeOpportunity({
      type: "content",
      priority: "high",
      title: "Create supporting docs route for long-tail SEO",
      rationale:
        "A single landing page limits long-tail topic depth for integration and workflow queries.",
      target: "app/docs/page.tsx",
    }),
  );

  return {
    checks,
    opportunities,
    keywordSeed,
  };
}
