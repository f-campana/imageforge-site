const GITHUB_ACCEPT = "application/vnd.github+json";
const GITHUB_API_VERSION = "2022-11-28";

export function splitRepository(repository) {
  const [owner, repo] = String(repository ?? "").split("/");
  if (!owner || !repo) {
    throw new Error(`Invalid GITHUB_REPOSITORY value: '${repository}'`);
  }
  return { owner, repo };
}

export function buildGithubHeaders(token, headers = {}) {
  return {
    Accept: GITHUB_ACCEPT,
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": GITHUB_API_VERSION,
    ...headers,
  };
}

export async function ghRequestWithResponse(
  url,
  token,
  options = {},
  fetchImpl = fetch,
) {
  const response = await fetchImpl(url, {
    ...options,
    headers: buildGithubHeaders(token, options.headers),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API ${response.status}: ${text}`);
  }

  if (response.status === 204) {
    return { response, data: null };
  }

  const text = await response.text();
  if (!text.trim()) {
    return { response, data: null };
  }

  return { response, data: JSON.parse(text) };
}

export async function ghRequest(url, token, options = {}, fetchImpl = fetch) {
  const { data } = await ghRequestWithResponse(url, token, options, fetchImpl);
  return data;
}

export function parseLinkHeader(value) {
  if (!value) {
    return {};
  }

  const relMap = {};
  for (const part of value.split(",")) {
    const trimmed = part.trim();
    const match = trimmed.match(/<([^>]+)>;\s*rel="([^"]+)"/u);
    if (!match) {
      continue;
    }

    relMap[match[2]] = match[1];
  }

  return relMap;
}

export async function ghPaginate(url, token, fetchImpl = fetch) {
  const items = [];
  let nextUrl = url;

  while (nextUrl) {
    const { response, data } = await ghRequestWithResponse(
      nextUrl,
      token,
      {},
      fetchImpl,
    );

    if (!Array.isArray(data)) {
      throw new Error(`Expected paginated array response for ${nextUrl}`);
    }

    items.push(...data);
    const relMap = parseLinkHeader(response.headers.get("link"));
    nextUrl = relMap.next ?? null;
  }

  return items;
}

export async function findIssueByExactTitle({
  owner,
  repo,
  title,
  token,
  state = "all",
  fetchImpl = fetch,
}) {
  const listUrl = `https://api.github.com/repos/${owner}/${repo}/issues?state=${state}&per_page=100`;
  const issues = await ghPaginate(listUrl, token, fetchImpl);

  return (
    issues.find(
      (issue) => issue.title === title && issue.pull_request === undefined,
    ) ?? null
  );
}

export async function createIssue({
  owner,
  repo,
  title,
  body,
  token,
  fetchImpl = fetch,
}) {
  const createUrl = `https://api.github.com/repos/${owner}/${repo}/issues`;
  return ghRequest(
    createUrl,
    token,
    {
      method: "POST",
      body: JSON.stringify({ title, body }),
    },
    fetchImpl,
  );
}

export async function listIssueComments({
  owner,
  repo,
  issueNumber,
  token,
  fetchImpl = fetch,
}) {
  const commentsUrl = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments?per_page=100`;
  return ghPaginate(commentsUrl, token, fetchImpl);
}

export async function upsertIssueCommentByMarker({
  owner,
  repo,
  issueNumber,
  marker,
  body,
  token,
  fetchImpl = fetch,
}) {
  const comments = await listIssueComments({
    owner,
    repo,
    issueNumber,
    token,
    fetchImpl,
  });

  const existing = comments.find(
    (comment) =>
      typeof comment.body === "string" && comment.body.includes(marker),
  );

  if (existing) {
    const updateUrl = `https://api.github.com/repos/${owner}/${repo}/issues/comments/${existing.id}`;
    const updated = await ghRequest(
      updateUrl,
      token,
      {
        method: "PATCH",
        body: JSON.stringify({ body }),
      },
      fetchImpl,
    );

    return {
      comment: updated,
      updated: true,
    };
  }

  const createUrl = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`;
  const created = await ghRequest(
    createUrl,
    token,
    {
      method: "POST",
      body: JSON.stringify({ body }),
    },
    fetchImpl,
  );

  return {
    comment: created,
    updated: false,
  };
}

export async function closeIssue({
  owner,
  repo,
  issueNumber,
  token,
  fetchImpl = fetch,
}) {
  const closeUrl = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`;
  return ghRequest(
    closeUrl,
    token,
    {
      method: "PATCH",
      body: JSON.stringify({ state: "closed" }),
    },
    fetchImpl,
  );
}

export async function listPullRequestsForCommit({
  owner,
  repo,
  commitSha,
  token,
  fetchImpl = fetch,
}) {
  const pullsUrl = `https://api.github.com/repos/${owner}/${repo}/commits/${commitSha}/pulls?per_page=100`;
  const pulls = await ghRequest(
    pullsUrl,
    token,
    {
      headers: {
        Accept: "application/vnd.github+json",
      },
    },
    fetchImpl,
  );

  return Array.isArray(pulls) ? pulls : [];
}

export async function listPullRequestFiles({
  owner,
  repo,
  pullNumber,
  token,
  fetchImpl = fetch,
}) {
  const filesUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/files?per_page=100`;
  return ghPaginate(filesUrl, token, fetchImpl);
}
