import assert from "node:assert/strict";
import test from "node:test";

import {
  findIssueByExactTitle,
  ghPaginate,
  parseLinkHeader,
  upsertIssueCommentByMarker,
} from "../github-api.mjs";

function jsonResponse(body, options = {}) {
  return new Response(JSON.stringify(body), {
    status: options.status ?? 200,
    headers: {
      "content-type": "application/json",
      ...(options.headers ?? {}),
    },
  });
}

test("parseLinkHeader parses rel map", () => {
  const parsed = parseLinkHeader(
    '<https://api.github.com/a?page=2>; rel="next", <https://api.github.com/a?page=5>; rel="last"',
  );

  assert.equal(parsed.next, "https://api.github.com/a?page=2");
  assert.equal(parsed.last, "https://api.github.com/a?page=5");
});

test("ghPaginate follows next link until exhausted", async () => {
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(url);
    if (url === "https://api.github.com/items?page=1") {
      return jsonResponse([{ id: 1 }], {
        headers: {
          link: '<https://api.github.com/items?page=2>; rel="next"',
        },
      });
    }

    if (url === "https://api.github.com/items?page=2") {
      return jsonResponse([{ id: 2 }]);
    }

    throw new Error(`Unexpected URL: ${url}`);
  };

  const items = await ghPaginate(
    "https://api.github.com/items?page=1",
    "token",
    fetchImpl,
  );

  assert.deepEqual(items, [{ id: 1 }, { id: 2 }]);
  assert.deepEqual(calls, [
    "https://api.github.com/items?page=1",
    "https://api.github.com/items?page=2",
  ]);
});

test("findIssueByExactTitle searches across state=all and excludes pull requests", async () => {
  const fetchImpl = async (url) => {
    assert.match(url, /state=all/u);
    return jsonResponse([
      {
        number: 10,
        title: "[Governance][seo-weekly] 2026-W08",
        html_url: "https://example.com/10",
        state: "closed",
      },
      {
        number: 11,
        title: "[Governance][seo-weekly] 2026-W08",
        html_url: "https://example.com/11",
        state: "open",
        pull_request: {
          url: "https://example.com/pr/11",
        },
      },
    ]);
  };

  const issue = await findIssueByExactTitle({
    owner: "f-campana",
    repo: "imageforge-site",
    title: "[Governance][seo-weekly] 2026-W08",
    token: "token",
    state: "all",
    fetchImpl,
  });

  assert.equal(issue?.number, 10);
  assert.equal(issue?.state, "closed");
});

test("upsertIssueCommentByMarker updates existing marker comment", async () => {
  const fetchImpl = async (url, options) => {
    if (
      url ===
      "https://api.github.com/repos/f-campana/imageforge-site/issues/9/comments?per_page=100"
    ) {
      return jsonResponse([
        {
          id: 42,
          body: "<!-- governance-resolver:seo-weekly:2026-W08 -->\nold",
        },
      ]);
    }

    if (
      url ===
      "https://api.github.com/repos/f-campana/imageforge-site/issues/comments/42"
    ) {
      assert.equal(options?.method, "PATCH");
      return jsonResponse({ id: 42, body: "updated" });
    }

    throw new Error(`Unexpected URL: ${url}`);
  };

  const result = await upsertIssueCommentByMarker({
    owner: "f-campana",
    repo: "imageforge-site",
    issueNumber: 9,
    marker: "<!-- governance-resolver:seo-weekly:2026-W08 -->",
    body: "updated",
    token: "token",
    fetchImpl,
  });

  assert.equal(result.updated, true);
  assert.equal(result.comment.id, 42);
});

test("upsertIssueCommentByMarker creates comment when marker is absent", async () => {
  const fetchImpl = async (url, options) => {
    if (
      url ===
      "https://api.github.com/repos/f-campana/imageforge-site/issues/9/comments?per_page=100"
    ) {
      return jsonResponse([]);
    }

    if (
      url ===
      "https://api.github.com/repos/f-campana/imageforge-site/issues/9/comments"
    ) {
      assert.equal(options?.method, "POST");
      return jsonResponse({ id: 55, body: "created" });
    }

    throw new Error(`Unexpected URL: ${url}`);
  };

  const result = await upsertIssueCommentByMarker({
    owner: "f-campana",
    repo: "imageforge-site",
    issueNumber: 9,
    marker: "<!-- marker -->",
    body: "created",
    token: "token",
    fetchImpl,
  });

  assert.equal(result.updated, false);
  assert.equal(result.comment.id, 55);
});
