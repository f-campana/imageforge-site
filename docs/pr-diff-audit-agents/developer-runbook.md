# Developer Runbook: Integration Branch Quality Loop

## Purpose

Keep local validation behavior aligned with CI gates on `codex/staging-landing-seo-integration` derived branches.

## Preconditions

1. Node >= 22
2. pnpm installed
3. Dependencies installed with `pnpm install`

## Standard Local Gate

Run this before opening or updating a PR:

```bash
pnpm check:ci
```

The command executes:

1. `pnpm lint`
2. `pnpm typecheck`
3. `pnpm format`
4. `NEXT_PUBLIC_SITE_URL=https://example.com pnpm build`
5. `pnpm seo:test`
6. `NEXT_PUBLIC_SITE_URL=https://example.com SEO_MODE=advisory pnpm seo:check`

## Environment Contract

1. `NEXT_PUBLIC_SITE_URL` is required for non-dev production parity checks and release verification.
2. `SEO_MODE=advisory` is used for PR CI feedback.
3. `SEO_MODE=strict` is used only in release verification and fails only on critical SEO checks.

## URL Resolver Consistency Policy

Site URL resolution is implemented in:

1. `lib/seo/site-url.ts` (runtime metadata and routes)
2. `scripts/seo/config.mjs` (SEO audit pipeline)

Any behavior change to one resolver must include equivalent updates and tests for the other resolver path.

## Troubleshooting

1. Build fails due to unresolved URL:
   set `NEXT_PUBLIC_SITE_URL` to an absolute `http(s)` URL.
2. SEO report shows unresolved canonical URL:
   re-run with explicit env, for example `NEXT_PUBLIC_SITE_URL=https://example.com pnpm seo:check`.
3. Formatting gate fails:
   run `pnpm format:write` and re-run `pnpm format`.
