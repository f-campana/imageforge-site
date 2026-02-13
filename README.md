# ImageForge CLI Landing Site

Marketing landing page for **ImageForge CLI** built with Next.js App Router, TypeScript, Tailwind CSS, and pnpm.

## Tech stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- pnpm
- Vercel-ready defaults
- Node >= 22

## Product messaging scope

This site intentionally describes ImageForge as:

- Build-time image optimization (not runtime generation)
- WebP/AVIF conversion
- `blurDataURL` placeholder generation
- Hash-based caching
- Concurrency control
- `--check` CI guard mode
- `--json` machine-readable run report to stdout
- `imageforge.json` manifest output by default

## Local setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
pnpm dev         # run dev server
pnpm lint        # eslint
pnpm typecheck   # typescript checks
pnpm check:ci    # local CI-parity gate (recommended before opening PR)
pnpm build       # production build
pnpm start       # run production server
pnpm seo:tech    # technical SEO checks
pnpm seo:content # content SEO checks
pnpm seo:offpage # off-page/public SEO checks
pnpm seo:full    # full SEO checks (includes optional GSC adapter)
pnpm seo:check   # CI-oriented SEO check (mode from SEO_MODE)
pnpm seo:test    # SEO script unit tests
pnpm format      # prettier check
pnpm format:write
```

## Accessibility

- Contrast target: WCAG 2.1 AA for normal text (`>= 4.5:1`).
- Components remediated for contrast:
  - `components/landing/StatsStrip.tsx`
  - `components/landing/FinalCtaFooter.tsx`
- Release gate checks:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm build`
  - Lighthouse accessibility (desktop and mobile) against local production server

Verification snapshot (2026-02-11):

- Desktop accessibility score: `95 -> 100`
- Mobile accessibility score: `95 -> 100`
- Failing audit delta: `color-contrast` only, `12 -> 0` failing nodes

## Environment variables

`NEXT_PUBLIC_IMAGEFORGE_VERSION` is used for public version display in the UI.
`NEXT_PUBLIC_SITE_URL` defines canonical/metadata base URL and should match production.
In non-development flows (CI, release verification, local production build checks), this value is required.
`SEO_MODE` controls audit mode (`advisory` or `strict`).
`SEO_LOCALE` defaults keyword/report locale (`en-US`).
`SEO_COMPETITOR_URLS` optionally enables competitor snapshot checks.
`SEO_GSC_CLIENT_EMAIL`, `SEO_GSC_PRIVATE_KEY`, and `SEO_GSC_PROPERTY_URI` enable Google Search Console analysis.

Example:

```bash
NEXT_PUBLIC_IMAGEFORGE_VERSION=0.1.3
NEXT_PUBLIC_SITE_URL=https://imageforge.dev
```

If unset, the site falls back to `local-dev`.

### Non-dev command contract

Use this command to reproduce the CI-required quality gate locally:

```bash
pnpm check:ci
```

This command intentionally uses `NEXT_PUBLIC_SITE_URL=https://example.com` for deterministic local parity.

## Deploy to Vercel

1. Push this repository to GitHub.
2. In Vercel, create a new project and import the repository.
3. Keep framework preset as **Next.js**.
4. Set environment variable `NEXT_PUBLIC_IMAGEFORGE_VERSION` (optional but recommended).
5. Deploy.

Vercel build command and output settings can remain default for Next.js.
