# SEO Gate Policy

## Policy Decision

1. PR CI runs SEO in advisory mode.
2. Release verification runs SEO in strict mode.
3. Strict mode blocks only on critical failures.
4. Off-page and GSC checks remain advisory unless explicitly promoted.

## Commands

### PR CI (advisory)

```bash
NEXT_PUBLIC_SITE_URL=https://example.com SEO_MODE=advisory pnpm seo:check
```

### Release verification (strict)

```bash
NEXT_PUBLIC_SITE_URL=https://example.com SEO_MODE=strict pnpm seo:check
```

## Current Baseline (2026-02-13)

With `NEXT_PUBLIC_SITE_URL` set:

1. `pnpm seo:tech` -> `critical=0, high=0, medium=0, low=0`
2. `pnpm seo:content` -> `critical=0, high=0, medium=0, low=0`
3. `pnpm seo:offpage` -> `critical=0, high=0, medium=1, low=0`
4. `pnpm seo:full -- --mode advisory` -> `critical=0, high=0, medium=1, low=0`
5. `SEO_MODE=strict pnpm seo:check` passes (no critical failures)

Without `NEXT_PUBLIC_SITE_URL`, advisory checks report one critical URL-resolution failure by design.

## Governance Cadence

1. Weekly SEO governance is handled in `/Users/fabiencampana/Documents/imageforge-site/.github/workflows/seo-weekly.yml`.
2. Monthly claims governance is handled in `/Users/fabiencampana/Documents/imageforge-site/.github/workflows/governance-cadence.yml`.
3. Weekly auto-close rule is `critical-only` (`summary.critical == 0`).
4. Monthly auto-close rule is `objective-only` with blocking checks for source reachability, freshness, lineage, pin alignment, and build safety.
5. Resolver updates one sticky issue comment and closes only on pass; it does not auto-reopen closed issues.
6. `workflow_dispatch` supports dry-run mode to validate resolver output without closing issues.
