# Governance Cadence

This document defines the recurring governance loop for SEO and claim integrity.

## Ownership and SLA

1. Default owner: `@f-campana`
2. SLA: review and disposition each governance issue within 2 business days.

## Recurring Reviews

1. Weekly SEO review
2. Monthly claims/source verification review

## Automation Contract

Automation runs from `.github/workflows/governance-cadence.yml` and creates issues via `scripts/governance/upsert-review-issue.mjs`.

1. Weekly issue key format: `YYYY-Www` (ISO week)
2. Monthly issue key format: `YYYY-MM`
3. Idempotency: if an open issue for the same review type and period key exists, no new issue is created.

## Review Checklist

### Weekly SEO review

1. Inspect latest SEO artifacts from CI and weekly workflow.
2. Confirm `critical=0` and track medium/low advisories.
3. Create follow-up tasks for regressions and assign owner/date.

### Monthly claims/source review

1. Verify pricing and external comparison claims still map to active sources.
2. Confirm responsive-width claims remain aligned to `cli-contract-pin.md`.
3. Verify benchmark snapshot freshness in `data/benchmarks/latest.json` and route rendering at `/benchmarks/latest`.
4. Confirm benchmark snapshot lineage points to reviewed sync PR (no direct main edits).
5. Verify benchmark evidence metadata used on landing remains derived from the latest approved snapshot.
6. Update claim matrix `as-of` evidence references when source facts shift.
