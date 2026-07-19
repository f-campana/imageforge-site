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

## First-party routes

- `/` landing page
- `/benchmarks/latest` benchmark evidence page
- `/docs` documentation hub
- `/docs/getting-started`, `/docs/nextjs`, `/docs/static-html`, `/docs/ci`,
  `/docs/cli-reference`, `/docs/configuration`, `/docs/manifest`,
  `/docs/troubleshooting`, and `/docs/when-to-use`
- `/docs/build-time-vs-runtime`, `/docs/vercel-image-optimization`, and
  `/docs/image-service-comparison`, and `/docs/imageforge-and-sharp` for
  adoption-adjacent decision intent
- `/contact` support and feedback entrypoint

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
pnpm test:unit   # vitest unit/component checks
pnpm test:mutation:pilot # stryker mutation pilot (advisory)
pnpm test:e2e    # playwright route smoke checks
pnpm test:visual # playwright visual regression checks
pnpm lhci        # lighthouse-ci lab checks for / and /benchmarks/latest
pnpm quality:gates:local # local phase-3 quality gate bundle
pnpm check:ci    # local CI-parity gate (recommended before opening PR)
pnpm build       # production build
pnpm start       # run production server
pnpm seo:tech    # technical SEO checks
pnpm seo:content # content SEO checks
pnpm seo:offpage # off-page/public SEO checks
pnpm seo:full    # full SEO checks (includes optional GSC adapter)
pnpm seo:check   # CI-oriented SEO check (mode from SEO_MODE)
pnpm governance:pricing:freshness # fail-closed pricing freshness check
pnpm seo:test    # SEO script unit tests
pnpm format      # prettier check
pnpm format:write
```

## Phase 3 Advisory Quality Gates

Phase 3 adds non-blocking regression signals for landing and benchmark
surfaces:

- Vitest component/hook tests (`pnpm test:unit`)
- Stryker mutation pilot with baseline trend summary (`pnpm test:mutation:pilot`)
- Playwright smoke E2E tests (`pnpm test:e2e`)
- Playwright visual snapshots with committed baselines (`pnpm test:visual`)
- Lighthouse CI lab checks (`pnpm lhci`)

Initial rollout is advisory by design and runs in
`.github/workflows/quality-gates.yml`.

To update visual baselines intentionally:

```bash
pnpm test:visual:update
```

Deterministic benchmark route checks use fixture mode in quality-gate commands:

- `BENCHMARK_ENABLE_LOCAL_FIXTURE=1`
- `BENCHMARK_SNAPSHOT_FIXTURE=sample`

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

`NEXT_PUBLIC_SITE_URL` defines canonical/metadata base URL and should match production.
In non-development flows (CI, release verification, local production build checks), this value is required.
`SEO_MODE` controls audit mode (`advisory` or `strict`).
`SEO_LOCALE` defaults keyword/report locale (`en-US`).
`SEO_COMPETITOR_URLS` optionally enables competitor snapshot checks.
`SEO_GSC_CLIENT_EMAIL`, `SEO_GSC_PRIVATE_KEY`, and `SEO_GSC_PROPERTY_URI` enable Google Search Console analysis.

The KPI definitions, privacy guardrails, and baseline procedure live in
[`docs/adoption-measurement.md`](./docs/adoption-measurement.md). The repository deliberately does
not equate page views, npm downloads, or GitHub stars with successful CLI or CI activation.

Example:

```bash
NEXT_PUBLIC_SITE_URL=https://imageforge.dev
```

The latest published CLI display comes from `data/release.json`. Benchmark methodology uses the
independent `source.cliVersion` provenance in `data/benchmarks/latest.json`; do not substitute one
for the other when updating evidence.

When a CLI release is published, update `data/release.json` only after packaged-release verification.
Record its npm version, timestamp, integrity, and source git head, then set each `behavior`
capability from the packaged smoke test—not from an unmerged CLI branch. Run
`pnpm governance:release:freshness` and `pnpm governance:release:behavior`; the docs derive
version-specific caveats from this contract, and CI rejects provenance drift or behavior mismatch.

### Non-dev command contract

Use this command to reproduce the CI-required quality gate locally:

```bash
pnpm check:ci
```

This command intentionally uses `NEXT_PUBLIC_SITE_URL=https://example.com` for deterministic local parity.
CI also runs `pnpm governance:pricing:freshness` as a required freshness gate.

## Deploy to Vercel

1. Push this repository to GitHub.
2. In Vercel, create a new project and import the repository.
3. Keep framework preset as **Next.js**.
4. Set `NEXT_PUBLIC_SITE_URL` to the production origin for canonical metadata parity.
5. Deploy.

Vercel build command and output settings can remain default for Next.js.
