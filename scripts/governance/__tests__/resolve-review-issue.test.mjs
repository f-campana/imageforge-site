import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { buildResolverComment, runResolveReviewIssue } from "../resolve-review-issue.mjs";

function writeEvaluationFile(tempDir, result) {
  const filePath = path.join(tempDir, `evaluation-${result}.json`);
  writeFileSync(
    filePath,
    `${JSON.stringify(
      {
        version: "1.0",
        kind: "seo-weekly",
        periodKey: "2026-W08",
        generatedAt: "2026-02-22T00:00:00.000Z",
        result,
        blockingFailures: result === "pass" ? 0 : 1,
        checks:
          result === "pass"
            ? [
                {
                  id: "seo-critical-count",
                  status: "pass",
                  severity: "critical",
                  message: "Critical issue count is zero.",
                  evidence: "summary.critical=0",
                },
              ]
            : [
                {
                  id: "seo-critical-count",
                  status: "fail",
                  severity: "critical",
                  message: "Critical issue count is 1.",
                  evidence: "summary.critical=1",
                },
              ],
        notes: [],
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  return filePath;
}

test("buildResolverComment includes sticky marker and failing section", () => {
  const { marker, body } = buildResolverComment({
    issueKind: "seo-weekly",
    periodKey: "2026-W08",
    runUrl: "https://github.com/example/run/1",
    evaluation: {
      version: "1.0",
      kind: "seo-weekly",
      periodKey: "2026-W08",
      generatedAt: "2026-02-22T00:00:00.000Z",
      result: "fail",
      blockingFailures: 1,
      checks: [
        {
          id: "seo-critical-count",
          status: "fail",
          severity: "critical",
          message: "Critical issue count is 1.",
          evidence: "summary.critical=1",
        },
      ],
      notes: [],
    },
  });

  assert.equal(marker, "<!-- governance-resolver:seo-weekly:2026-W08 -->");
  assert.ok(body.includes("### Failing Checks"));
  assert.ok(body.includes("seo-critical-count"));
});

test("runResolveReviewIssue closes open issue on pass", async () => {
  const tempDir = mkdtempSync(path.join(tmpdir(), "imageforge-resolver-"));
  const evaluationPath = writeEvaluationFile(tempDir, "pass");
  let issueClosed = false;

  const fetchImpl = async (url, options = {}) => {
    if (url.includes("/issues?state=all&per_page=100")) {
      return new Response(
        JSON.stringify([
          {
            number: 9,
            title: "[Governance][seo-weekly] 2026-W08",
            html_url: "https://github.com/f-campana/imageforge-site/issues/9",
            state: "open",
          },
        ]),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }

    if (url.endsWith("/issues/9/comments?per_page=100")) {
      return new Response("[]", {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    if (url.endsWith("/issues/9/comments")) {
      assert.equal(options.method, "POST");
      return new Response(JSON.stringify({ id: 100 }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    if (url.endsWith("/issues/9")) {
      assert.equal(options.method, "PATCH");
      issueClosed = true;
      return new Response(JSON.stringify({ number: 9, state: "closed" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    throw new Error(`Unexpected URL: ${url}`);
  };

  const result = await runResolveReviewIssue({
    token: "token",
    repository: "f-campana/imageforge-site",
    issueKind: "seo-weekly",
    periodKey: "2026-W08",
    evaluationPath,
    runUrl: "",
    dryRun: false,
    fetchImpl,
  });

  assert.equal(issueClosed, true);
  assert.equal(result.result, "pass");
  assert.equal(result.issueState, "closed");
});

test("runResolveReviewIssue updates marker comment and leaves issue open on fail", async () => {
  const tempDir = mkdtempSync(path.join(tmpdir(), "imageforge-resolver-"));
  const evaluationPath = writeEvaluationFile(tempDir, "fail");
  let closeCalled = false;

  const fetchImpl = async (url, options = {}) => {
    if (url.includes("/issues?state=all&per_page=100")) {
      return new Response(
        JSON.stringify([
          {
            number: 9,
            title: "[Governance][seo-weekly] 2026-W08",
            html_url: "https://github.com/f-campana/imageforge-site/issues/9",
            state: "open",
          },
        ]),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }

    if (url.endsWith("/issues/9/comments?per_page=100")) {
      return new Response(
        JSON.stringify([
          {
            id: 101,
            body: "<!-- governance-resolver:seo-weekly:2026-W08 -->\nold",
          },
        ]),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      );
    }

    if (url.endsWith("/issues/comments/101")) {
      assert.equal(options.method, "PATCH");
      return new Response(JSON.stringify({ id: 101 }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    if (url.endsWith("/issues/9")) {
      closeCalled = true;
      return new Response(JSON.stringify({ number: 9, state: "closed" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    throw new Error(`Unexpected URL: ${url}`);
  };

  const result = await runResolveReviewIssue({
    token: "token",
    repository: "f-campana/imageforge-site",
    issueKind: "seo-weekly",
    periodKey: "2026-W08",
    evaluationPath,
    runUrl: "",
    dryRun: false,
    fetchImpl,
  });

  assert.equal(closeCalled, false);
  assert.equal(result.result, "fail");
  assert.equal(result.commentUpdated, true);
  assert.equal(result.issueState, "open");
});

test("runResolveReviewIssue dry-run never closes issue", async () => {
  const tempDir = mkdtempSync(path.join(tmpdir(), "imageforge-resolver-"));
  const evaluationPath = writeEvaluationFile(tempDir, "pass");
  let closeCalled = false;

  const fetchImpl = async (url) => {
    if (url.includes("/issues?state=all&per_page=100")) {
      return new Response(
        JSON.stringify([
          {
            number: 9,
            title: "[Governance][seo-weekly] 2026-W08",
            html_url: "https://github.com/f-campana/imageforge-site/issues/9",
            state: "open",
          },
        ]),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }

    if (url.endsWith("/issues/9/comments?per_page=100")) {
      return new Response("[]", {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    if (url.endsWith("/issues/9/comments")) {
      return new Response(JSON.stringify({ id: 102 }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    if (url.endsWith("/issues/9")) {
      closeCalled = true;
      return new Response(JSON.stringify({ number: 9, state: "closed" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    throw new Error(`Unexpected URL: ${url}`);
  };

  const result = await runResolveReviewIssue({
    token: "token",
    repository: "f-campana/imageforge-site",
    issueKind: "seo-weekly",
    periodKey: "2026-W08",
    evaluationPath,
    runUrl: "",
    dryRun: true,
    fetchImpl,
  });

  assert.equal(closeCalled, false);
  assert.equal(result.dryRun, true);
  assert.equal(result.issueState, "open");
});
