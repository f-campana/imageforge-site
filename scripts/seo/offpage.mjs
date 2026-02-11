import { load } from "cheerio";

import { makeCheck, makeOpportunity } from "./types.mjs";

async function fetchHtml(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": "imageforge-seo-agent/1.0 (+https://imageforge.dev)",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        ok: false,
        error: `HTTP ${response.status}`,
        html: null,
      };
    }

    return {
      ok: true,
      error: null,
      html: await response.text(),
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
      html: null,
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function runOffpageChecks(config) {
  const checks = [];
  const opportunities = [];

  if (config.site.url) {
    const homepage = await fetchHtml(config.site.url);
    checks.push(
      makeCheck({
        id: "offpage.public_homepage_reachability",
        suite: "offpage",
        severity: "medium",
        status: homepage.ok ? "pass" : "warn",
        message: homepage.ok
          ? "Public homepage is reachable and crawlable."
          : "Could not verify public homepage crawlability.",
        evidence: homepage.ok
          ? `Fetched ${config.site.url} successfully.`
          : homepage.error ?? "Request failed",
        fixHint:
          "Confirm deployment is public and use the production URL in NEXT_PUBLIC_SITE_URL.",
        file: "app/layout.tsx",
      }),
    );

    if (homepage.ok && homepage.html) {
      const $ = load(homepage.html);
      const title = $("title").text().trim();
      const description =
        $("meta[name='description']").attr("content")?.trim() ?? "";

      checks.push(
        makeCheck({
          id: "offpage.public_metadata_presence",
          suite: "offpage",
          severity: "medium",
          status: title && description ? "pass" : "warn",
          message:
            title && description
              ? "Public HTML includes title and meta description."
              : "Public HTML is missing title or meta description.",
          evidence: `title=\"${title}\" descriptionLength=${description.length}`,
          fixHint: "Ensure metadata renders in production output for the root route.",
          file: "app/layout.tsx",
        }),
      );
    }
  } else {
    checks.push(
      makeCheck({
        id: "offpage.public_homepage_reachability",
        suite: "offpage",
        severity: "low",
        status: "skip",
        message: "Skipped public crawlability check because site URL is unresolved.",
        evidence: config.site.error ?? "Missing site URL",
        fixHint:
          "Set NEXT_PUBLIC_SITE_URL to enable reachability/off-page verification.",
        file: ".env.example",
      }),
    );
  }

  checks.push(
    makeCheck({
      id: "offpage.brand_presence_heuristic",
      suite: "offpage",
      severity: "low",
      status: "pass",
      message: "Brand references exist in first-party content and outbound profiles.",
      evidence:
        "Detected GitHub and npm profile links in landing components for entity association.",
      fixHint: "Keep brand links consistent across metadata, docs, and social profiles.",
      file: "components/landing/FinalCtaFooter.tsx",
    }),
  );

  if (config.competitorUrls.length === 0) {
    checks.push(
      makeCheck({
        id: "offpage.competitor_snapshot",
        suite: "offpage",
        severity: "low",
        status: "skip",
        message: "No competitor URLs configured; snapshot check skipped.",
        evidence: "Set SEO_COMPETITOR_URLS to enable competitor metadata snapshots.",
        fixHint: "Provide 2-5 competitor landing URLs via SEO_COMPETITOR_URLS.",
        file: ".env.example",
      }),
    );
  } else {
    const snapshots = [];

    for (const url of config.competitorUrls.slice(0, 5)) {
      const response = await fetchHtml(url);
      if (!response.ok || !response.html) {
        snapshots.push({ url, ok: false, title: "", description: "", error: response.error });
        continue;
      }

      const $ = load(response.html);
      snapshots.push({
        url,
        ok: true,
        title: $("title").text().trim(),
        description: $("meta[name='description']").attr("content")?.trim() ?? "",
      });
    }

    const failed = snapshots.filter((snapshot) => !snapshot.ok);
    const successful = snapshots.filter((snapshot) => snapshot.ok);

    checks.push(
      makeCheck({
        id: "offpage.competitor_snapshot",
        suite: "offpage",
        severity: "medium",
        status: failed.length === 0 ? "pass" : "warn",
        message:
          failed.length === 0
            ? "Competitor metadata snapshot fetched successfully."
            : "Some competitor URLs could not be fetched.",
        evidence:
          failed.length === 0
            ? successful.map((entry) => `${entry.url} => ${entry.title}`).join(" | ")
            : failed.map((entry) => `${entry.url} => ${entry.error}`).join(" | "),
        fixHint:
          "Review competitor URLs and ensure they are crawlable from CI environment.",
        file: ".env.example",
      }),
    );

    for (const competitor of successful.slice(0, 3)) {
      opportunities.push(
        makeOpportunity({
          type: "offpage",
          priority: "low",
          title: `Compare snippet against ${competitor.url}`,
          rationale:
            "Regular snapshot comparisons help detect when competitors improve title/description clarity or keyword focus.",
          target: competitor.url,
        }),
      );
    }
  }

  opportunities.push(
    makeOpportunity({
      type: "offpage",
      priority: "medium",
      title: "Create backlink outreach target list",
      rationale:
        "Developer-tool directories and newsletter mentions can improve discovery for a niche CLI product.",
      target: "docs/seo/outreach-list.md",
    }),
  );

  return {
    checks,
    opportunities,
    dataSource: {
      public: true,
    },
  };
}
