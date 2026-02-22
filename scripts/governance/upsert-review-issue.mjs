#!/usr/bin/env node

import process from "node:process";
import { pathToFileURL } from "node:url";

import {
  createIssue,
  findIssueByExactTitle,
  splitRepository,
} from "./github-api.mjs";
import { issueTemplate } from "./issue-template.mjs";

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export async function runUpsertReviewIssue({
  token,
  repository,
  issueKind,
  periodKey,
  fetchImpl = fetch,
}) {
  const { owner, repo } = splitRepository(repository);
  const { title, body } = issueTemplate(issueKind, periodKey);

  const existing = await findIssueByExactTitle({
    owner,
    repo,
    title,
    token,
    state: "all",
    fetchImpl,
  });

  if (existing) {
    return {
      issueNumber: existing.number,
      issueUrl: existing.html_url,
      issueState: existing.state,
      created: false,
    };
  }

  const created = await createIssue({
    owner,
    repo,
    title,
    body,
    token,
    fetchImpl,
  });

  return {
    issueNumber: created.number,
    issueUrl: created.html_url,
    issueState: created.state,
    created: true,
  };
}

export async function main() {
  const token = requireEnv("GITHUB_TOKEN");
  const repository = requireEnv("GITHUB_REPOSITORY");
  const issueKind = requireEnv("ISSUE_KIND");
  const periodKey = requireEnv("PERIOD_KEY");

  const result = await runUpsertReviewIssue({
    token,
    repository,
    issueKind,
    periodKey,
  });

  process.stdout.write(`${JSON.stringify(result)}\n`);
}

const isMainModule =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
