#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

import {
  closeIssue,
  findIssueByExactTitle,
  splitRepository,
  upsertIssueCommentByMarker,
} from "./github-api.mjs";
import { validateEvaluation } from "./evaluation-contract.mjs";
import { issueTemplate } from "./issue-template.mjs";

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parseArgs(argv) {
  return {
    dryRun: argv.includes("--dry-run"),
  };
}

function checkLine(check) {
  return `- [${check.status.toUpperCase()}] ${check.id} (${check.severity}): ${check.message}`;
}

export function buildResolverComment({
  issueKind,
  periodKey,
  evaluation,
  runUrl,
}) {
  const marker = `<!-- governance-resolver:${issueKind}:${periodKey} -->`;
  const failing = evaluation.checks.filter((check) => check.status === "fail");

  const lines = [
    marker,
    `## Governance Resolver ${evaluation.result.toUpperCase()}`,
    "",
    `- Kind: ${issueKind}`,
    `- Period: ${periodKey}`,
    `- Generated: ${evaluation.generatedAt}`,
    `- Blocking failures: ${evaluation.blockingFailures.toString()}`,
    runUrl ? `- Run: ${runUrl}` : "- Run: (not provided)",
    "",
    "### Checks",
    ...evaluation.checks.map(checkLine),
    "",
    "### Failing Checks",
  ];

  if (failing.length === 0) {
    lines.push("- None");
  } else {
    lines.push(...failing.map(checkLine));
  }

  lines.push("", "### Notes");

  if (evaluation.notes.length === 0) {
    lines.push("- None");
  } else {
    lines.push(...evaluation.notes.map((note) => `- ${note}`));
  }

  return {
    marker,
    body: lines.join("\n"),
  };
}

async function readEvaluation(filePath) {
  const raw = await readFile(filePath, "utf8");
  return validateEvaluation(JSON.parse(raw));
}

export async function runResolveReviewIssue({
  token,
  repository,
  issueKind,
  periodKey,
  evaluationPath,
  runUrl,
  dryRun = false,
  fetchImpl = fetch,
}) {
  const { owner, repo } = splitRepository(repository);
  const { title } = issueTemplate(issueKind, periodKey);
  const issue = await findIssueByExactTitle({
    owner,
    repo,
    title,
    token,
    state: "all",
    fetchImpl,
  });

  if (!issue) {
    throw new Error(`No governance issue found for title '${title}'.`);
  }

  const evaluation = await readEvaluation(evaluationPath);
  const { marker, body } = buildResolverComment({
    issueKind,
    periodKey,
    evaluation,
    runUrl,
  });

  const commentResult = await upsertIssueCommentByMarker({
    owner,
    repo,
    issueNumber: issue.number,
    marker,
    body,
    token,
    fetchImpl,
  });

  let closed = false;
  if (!dryRun && evaluation.result === "pass" && issue.state === "open") {
    await closeIssue({
      owner,
      repo,
      issueNumber: issue.number,
      token,
      fetchImpl,
    });
    closed = true;
  }

  return {
    issueNumber: issue.number,
    issueUrl: issue.html_url,
    issueState: closed ? "closed" : issue.state,
    commentUpdated: commentResult.updated,
    result: evaluation.result,
    dryRun,
  };
}

export async function main(argv = process.argv.slice(2)) {
  const { dryRun } = parseArgs(argv);
  const token = requireEnv("GITHUB_TOKEN");
  const repository = requireEnv("GITHUB_REPOSITORY");
  const issueKind = requireEnv("ISSUE_KIND");
  const periodKey = requireEnv("PERIOD_KEY");
  const evaluationPath = path.resolve(requireEnv("EVALUATION_JSON_PATH"));
  const runUrl = process.env.RUN_URL?.trim() || "";

  const result = await runResolveReviewIssue({
    token,
    repository,
    issueKind,
    periodKey,
    evaluationPath,
    runUrl,
    dryRun,
  });

  process.stdout.write(`${JSON.stringify(result)}\n`);
}

const isMainModule =
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
