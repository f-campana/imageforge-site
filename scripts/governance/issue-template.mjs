export function issueTemplate(kind, periodKey) {
  if (kind === "seo-weekly") {
    return {
      title: `[Governance][seo-weekly] ${periodKey}`,
      body: [
        "Automated weekly SEO governance review.",
        "",
        "- Owner: @f-campana",
        "- SLA: 2 business days",
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
        "- Owner: @f-campana",
        "- SLA: 2 business days",
        `- Period key: ${periodKey}`,
        "",
        "Checklist:",
        "1. Re-verify external pricing/comparison sources used on landing.",
        "2. Confirm responsive-width claims still align with pinned CLI contract SHA.",
        "3. Verify benchmark snapshot freshness and lineage in data/benchmarks/latest.json and /benchmarks/latest.",
        "4. Confirm landing benchmark evidence remains derived from the latest approved snapshot.",
        "5. Update claim matrix evidence notes for any changed facts.",
      ].join("\n"),
    };
  }

  throw new Error(
    `Unsupported ISSUE_KIND '${kind}'. Expected 'seo-weekly' or 'claims-monthly'.`,
  );
}

export function issueTitle(kind, periodKey) {
  return issueTemplate(kind, periodKey).title;
}
