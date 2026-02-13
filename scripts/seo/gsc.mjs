import { google } from "googleapis";

import { makeCheck, makeOpportunity } from "./types.mjs";

function hasGscCredentials(config) {
  return Boolean(
    config.gsc.clientEmail && config.gsc.privateKey && config.gsc.propertyUri,
  );
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function getDateRange(daysBackStart, daysBackEnd = 0) {
  const now = new Date();
  const end = new Date(now);
  end.setUTCDate(end.getUTCDate() - daysBackEnd);

  const start = new Date(now);
  start.setUTCDate(start.getUTCDate() - daysBackStart);

  return {
    startDate: formatDate(start),
    endDate: formatDate(end),
  };
}

export async function runGscChecks(config) {
  const checks = [];
  const opportunities = [];

  if (!hasGscCredentials(config)) {
    checks.push(
      makeCheck({
        id: "gsc.credentials",
        suite: "gsc",
        severity: "low",
        status: "skip",
        message: "GSC credentials not configured; adapter skipped.",
        evidence:
          "Provide SEO_GSC_CLIENT_EMAIL, SEO_GSC_PRIVATE_KEY, and SEO_GSC_PROPERTY_URI to enable Search Console opportunities.",
        fixHint: "Configure GSC service account credentials in CI secrets.",
        file: ".env.example",
      }),
    );

    return {
      checks,
      opportunities,
      enabled: false,
    };
  }

  const privateKey = config.gsc.privateKey.replace(/\\n/g, "\n");

  try {
    const auth = new google.auth.JWT({
      email: config.gsc.clientEmail,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
    });

    const webmasters = google.searchconsole({ version: "v1", auth });
    const range = getDateRange(28, 1);

    const query = await webmasters.searchanalytics.query({
      siteUrl: config.gsc.propertyUri,
      requestBody: {
        startDate: range.startDate,
        endDate: range.endDate,
        dimensions: ["query", "page"],
        rowLimit: 100,
      },
    });

    const rows = query.data.rows ?? [];

    checks.push(
      makeCheck({
        id: "gsc.query_data",
        suite: "gsc",
        severity: "medium",
        status: rows.length > 0 ? "pass" : "warn",
        message:
          rows.length > 0
            ? "GSC query data loaded successfully."
            : "GSC returned no query rows for the selected window.",
        evidence: `rows=${rows.length}, range=${range.startDate}..${range.endDate}`,
        fixHint:
          "Verify property permissions and that the selected date range has Search Console activity.",
        file: ".env.example",
      }),
    );

    for (const row of rows.slice(0, 100)) {
      const [queryText, pageUrl] = row.keys ?? [];
      const impressions = row.impressions ?? 0;
      const ctr = row.ctr ?? 0;

      if (impressions >= 300 && ctr < 0.03 && queryText && pageUrl) {
        opportunities.push(
          makeOpportunity({
            type: "gsc",
            priority: "high",
            title: `Improve CTR for \"${queryText}\"`,
            rationale: `Query has ${Math.round(impressions)} impressions with ${(ctr * 100).toFixed(2)}% CTR.`,
            target: String(pageUrl),
          }),
        );
      }
    }

    return {
      checks,
      opportunities,
      enabled: true,
    };
  } catch (error) {
    checks.push(
      makeCheck({
        id: "gsc.query_data",
        suite: "gsc",
        severity: "high",
        status: "warn",
        message: "GSC query failed.",
        evidence: error instanceof Error ? error.message : String(error),
        fixHint:
          "Confirm service account permissions for the property and verify secret formatting.",
        file: ".env.example",
      }),
    );

    return {
      checks,
      opportunities,
      enabled: false,
    };
  }
}
