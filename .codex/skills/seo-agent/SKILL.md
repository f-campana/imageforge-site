---
name: seo-agent
description: Full-suite SEO execution for the ImageForge site with technical, content, off-page, and optional Google Search Console analysis. Use when asked to audit or improve metadata, canonical tags, structured data, sitemap/robots, keyword coverage, snippet quality, competitor positioning, or SEO CI enforcement in this repository.
---

# SEO Agent

Run the repository SEO pipeline first, then implement fixes in priority order.

## Default Workflow

1. Run `pnpm seo:full -- --mode advisory`.
2. Read `.tmp/seo/report.md` and `.tmp/seo/report.json`.
3. Prioritize `critical` then `high` checks.
4. Implement changes with minimal copy drift from the product messaging scope.
5. Re-run targeted suite:
   - `pnpm seo:tech`
   - `pnpm seo:content`
   - `pnpm seo:offpage`
6. Re-run full report and confirm issue counts trend down.

## Strict Mode Rules

1. Use strict mode only for CI gating and release readiness checks.
2. In strict mode, treat all `critical` failures as blocking.
3. Do not block on off-page or GSC gaps unless explicitly requested.

## Repository Constraints

1. Keep focus on ImageForge CLI messaging: build-time optimization, WebP/AVIF, blurDataURL, hash-based caching, CI checks.
2. Do not inject unrelated keyword themes.
3. Keep canonical/sitemap/robots aligned to the same site URL resolver.

## References

1. Severity rubric: `references/severity-rubric.md`
2. Checklist: `references/checklist.md`
3. Output schema: `references/output-contract.md`
