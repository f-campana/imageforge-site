import assert from "node:assert/strict";
import test from "node:test";

import { runUpsertReviewIssue } from "../upsert-review-issue.mjs";

function jsonResponse(body, options = {}) {
  return new Response(JSON.stringify(body), {
    status: options.status ?? 200,
    headers: {
      "content-type": "application/json",
      ...(options.headers ?? {}),
    },
  });
}

test("runUpsertReviewIssue returns existing closed issue without creating duplicate", async () => {
  let createCalled = false;

  const fetchImpl = async (url, options) => {
    if (url.includes("/issues?state=all&per_page=100")) {
      return jsonResponse([
        {
          number: 6,
          title: "[Governance][claims-monthly] 2026-02",
          html_url: "https://github.com/f-campana/imageforge-site/issues/6",
          state: "closed",
        },
      ]);
    }

    if (url.endsWith("/issues")) {
      createCalled = true;
      assert.equal(options?.method, "POST");
      return jsonResponse({});
    }

    throw new Error(`Unexpected URL: ${url}`);
  };

  const result = await runUpsertReviewIssue({
    token: "token",
    repository: "f-campana/imageforge-site",
    issueKind: "claims-monthly",
    periodKey: "2026-02",
    fetchImpl,
  });

  assert.equal(result.created, false);
  assert.equal(result.issueNumber, 6);
  assert.equal(result.issueState, "closed");
  assert.equal(createCalled, false);
});

test("runUpsertReviewIssue creates issue when none exists", async () => {
  const calls = [];

  const fetchImpl = async (url, options) => {
    calls.push({ url, method: options?.method ?? "GET" });

    if (url.includes("/issues?state=all&per_page=100")) {
      return jsonResponse([]);
    }

    if (url.endsWith("/issues") && options?.method === "POST") {
      const payload = JSON.parse(String(options.body));
      assert.equal(payload.title, "[Governance][seo-weekly] 2026-W08");
      return jsonResponse({
        number: 9,
        html_url: "https://github.com/f-campana/imageforge-site/issues/9",
        state: "open",
      });
    }

    throw new Error(`Unexpected URL: ${url}`);
  };

  const result = await runUpsertReviewIssue({
    token: "token",
    repository: "f-campana/imageforge-site",
    issueKind: "seo-weekly",
    periodKey: "2026-W08",
    fetchImpl,
  });

  assert.equal(result.created, true);
  assert.equal(result.issueNumber, 9);
  assert.equal(result.issueState, "open");

  assert.deepEqual(
    calls.map((call) => call.method),
    ["GET", "POST"],
  );
});
