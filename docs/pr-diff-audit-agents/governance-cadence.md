# Governance Cadence

This document defines the recurring governance loop for SEO and claim integrity.

## Ownership and SLA

1. Default owner: `@f-campana`
2. SLA: review and disposition each governance issue within 2 business days.

## Recurring Reviews

1. Weekly SEO review (`YYYY-Www`)
2. Monthly claims/source verification review (`YYYY-MM`)

## Automation Contract

Automation runs from:

1. `/Users/fabiencampana/Documents/imageforge-site/.github/workflows/seo-weekly.yml` (weekly SEO upsert + evaluate + resolve)
2. `/Users/fabiencampana/Documents/imageforge-site/.github/workflows/governance-cadence.yml` (monthly claims upsert + evaluate + resolve)

Resolver behavior:

1. A single sticky comment is upserted per issue with marker `<!-- governance-resolver:{kind}:{periodKey} -->`.
2. Issues are closed automatically only when blocking checks pass.
3. Closed issues are never auto-reopened.
4. Issue matching is exact title + period key and uses `state=all` (no duplicate issue creation for a closed period).

## Auto-Close Criteria

### Weekly SEO (`critical-only`)

1. Blocking pass criterion: SEO report `summary.critical == 0`.
2. `high`/`medium`/`low` are advisory; they are reported in sticky comments but do not block closure.

### Monthly Claims (`objective auto-close`)

Blocking objective checks:

1. Pricing links from landing sources are reachable with retry policy.
2. `PRICING_AS_OF` parses and is fresh (`<=45` days).
3. `PRICING_OWNER` is present.
4. `data/benchmarks/latest.json` schema is valid and non-null (`schemaVersion=1.0`).
5. Benchmark `generatedAt` freshness is within `<=14` days.
6. Latest benchmark snapshot commit has merged PR lineage to `main` that touches `data/benchmarks/latest.json`.
7. Benchmark evidence guardrails remain derived from latest snapshot source mapping.
8. Contract pin SHA is aligned across claim matrix + CLI pin docs.
9. `NEXT_PUBLIC_SITE_URL=https://example.com pnpm build` succeeds.

Advisory only:

1. Lineage naming convention checks.
2. Subjective copy interpretation mismatch reminder.

## Link Check HTTP Policy

1. Attempt `HEAD` first.
2. Timeout per attempt: 8s.
3. Retry count: 3 with backoff 1s, 2s, 4s.
4. Fallback to `GET` when `HEAD` is unsupported (`405`/`501`).
5. Final non-2xx/3xx result is blocking.

## Manual Dry-Run

Both workflows support `workflow_dispatch` dry-run mode:

1. Dry-run still upserts issue and sticky comment.
2. Dry-run never closes issues.
