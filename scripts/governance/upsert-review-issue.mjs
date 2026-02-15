#!/usr/bin/env node

import process from "node:process";

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function issueTemplate(kind, periodKey) {
  if (kind === "seo-weekly") {
    return {
      title: `[Governance][seo-weekly] ${periodKey}`,
      body: [
        "Automated weekly SEO governance review.",
        "",
        `- Owner: @f-campana`,
        `- SLA: 2 business days`,
        `- Period key: ${periodKey}`,
        "",
        "Checklist:",
        "1. Inspect latest SEO artifacts (`seo` CI job + weekly SEO workflow).",
        "2. Confirm critical findings remain zero.",
        "3. Convert notable medium/low advisories into tracked follow-up tasks.",
      ].join("\n"),
    };
  }

  if (kind === "claims-monthly") {
    return {
      title: `[Governance][claims-monthly] ${periodKey}`,
      body: [
        "Automated monthly claim/source governance review.",
        "",
        `- Owner: @f-campana`,
        `- SLA: 2 business days`,
        `- Period key: ${periodKey}`,
        "",
        "Checklist:",
        "1. Re-verify external pricing/comparison sources used on landing.",
        "2. Confirm responsive-width claims still align with pinned CLI contract SHA.",
        "3. Verify benchmark evidence metadata in components/landing/benchmark-evidence.ts is current (as-of date, owner, dataset, runner, profile, scenario, artifact URL).",
        "4. Update claim matrix evidence notes for any changed facts.",
      ].join("\n"),
    };
  }

  throw new Error(
    `Unsupported ISSUE_KIND '${kind}'. Expected 'seo-weekly' or 'claims-monthly'.`,
  );
}

async function ghRequest(url, token, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API ${response.status}: ${text}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function main() {
  const token = requireEnv("GITHUB_TOKEN");
  const repository = requireEnv("GITHUB_REPOSITORY");
  const issueKind = requireEnv("ISSUE_KIND");
  const periodKey = requireEnv("PERIOD_KEY");
  const [owner, repo] = repository.split("/");

  if (!owner || !repo) {
    throw new Error(`Invalid GITHUB_REPOSITORY value: '${repository}'`);
  }

  const { title, body } = issueTemplate(issueKind, periodKey);

  const listUrl = `https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=100`;
  const issues = await ghRequest(listUrl, token);
  const existing = issues.find(
    (issue) => issue.title === title && issue.pull_request === undefined,
  );

  if (existing) {
    console.log(
      `Issue already exists: #${existing.number} (${existing.html_url})`,
    );
    return;
  }

  const createUrl = `https://api.github.com/repos/${owner}/${repo}/issues`;
  const created = await ghRequest(createUrl, token, {
    method: "POST",
    body: JSON.stringify({
      title,
      body,
    }),
  });

  console.log(`Created issue #${created.number}: ${created.html_url}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
