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

1. Weekly SEO review issue creation is automated by `.github/workflows/governance-cadence.yml`.
2. Monthly claims/source review issue creation is automated by `.github/workflows/governance-cadence.yml`.
3. Default owner is `@f-campana`, with review expected within 2 business days.
4. Weekly and monthly reviews are idempotent per period key to prevent duplicate open issues.
