# Animation Audit Cycle 3: Landing Reintroduction (Nav + Hero)

Date: 2026-02-18
Mode: Advisory (`cycle 3`)
Audit type: Post-reintroduction verification (code + runtime viewport checks)

## AnimationAuditSummary

```json
{
  "scope": [
    "/",
    "/benchmarks/latest",
    "components/landing/HeaderNav.tsx",
    "components/landing/Hero.tsx",
    "components/landing/InstallCommands.tsx",
    "components/landing/MotionWrap.tsx",
    "components/landing/TerminalDemo.tsx",
    "components/benchmark/BenchmarkPageContent.tsx",
    "app/globals.css"
  ],
  "mode": "advisory",
  "totals": {
    "critical": 0,
    "high": 0,
    "medium": 1,
    "low": 7,
    "overall": 8
  },
  "affected_areas": [
    "entry",
    "performance",
    "timeline",
    "loop",
    "seo",
    "a11y",
    "benchmark"
  ],
  "blocking_recommendations": [],
  "advisory_recommendations": [
    "Keep nav/hero load-once entry subtle and avoid expanding section-entry choreography in cycle 3.",
    "Preserve reduced-motion and overflow safety checks in every animation cycle.",
    "Defer benchmark enhancement choreography to cycle 4 while retaining current low-density baseline."
  ],
  "commands_run": [
    "pnpm lint",
    "pnpm typecheck",
    "NEXT_PUBLIC_SITE_URL=https://example.com pnpm build",
    "NEXT_PUBLIC_SITE_URL=https://example.com pnpm seo:full -- --mode advisory",
    "BASE_URL=http://127.0.0.1:3205 OUTPUT_FILE=/tmp/animation-cycle3-pr2-canonical.json pnpm dlx @playwright/test@1.51.0 test .tmp/animation-cycle2-matrix.spec.js --reporter=line --workers=1",
    "BASE_URL=http://127.0.0.1:3205 OUTPUT_FILE=/tmp/animation-cycle3-pr2-fixture.json pnpm dlx @playwright/test@1.51.0 test .tmp/animation-cycle2-matrix.spec.js --reporter=line --workers=1"
  ],
  "notes": [
    "Cycle 3 scope was nav+hero reintroduction plus micro-interaction polish only.",
    "Landing default wrapper average moved from 45 (cycle 2) to 49 after load-once nav+hero reintroduction.",
    "All findings remain advisory in cycle 3."
  ]
}
```

## Findings

1. [MEDIUM] Landing reintroduction increased default wrapper density (`anim-entry-001`)

- Category: `entry`
- Viewport: landing default matrix cells
- Files:
  - `/Users/fabiencampana/Documents/imageforge-site/components/landing/MotionWrap.tsx`
  - `/Users/fabiencampana/Documents/imageforge-site/components/landing/HeaderNav.tsx`
  - `/Users/fabiencampana/Documents/imageforge-site/components/landing/Hero.tsx`
- Evidence: cycle-3 canonical matrix average `landingDefaultMotionWrapAvg=49` (`/tmp/animation-cycle3-pr2-canonical.json`).
- User impact: top-half polish improved, but route-level reveal density remains moderate.
- Perf impact: moderate compositing/concurrency pressure remains on landing.
- SEO impact: low direct risk because critical claims/CTAs remain immediate content.
- A11y impact: reduced-motion path remains compliant; default density still needs tuning.
- Fix direction: keep nav+hero motion subtle and reduce non-critical wrapper density in lower sections before broader choreography.
- Verification steps:
  - compare default wrapper averages after future tuning;
  - confirm hero readability remains immediate.
- Status: `advisory`

2. [LOW] Root overflow remains resolved (`anim-overflow-001`)

- Category: `performance`
- Viewport: all canonical + fixture matrix cells
- Evidence: overflow remained `0` for landing and benchmark in both runs.
- Status: `advisory`

3. [LOW] Terminal loop remains controlled (`anim-loop-001`)

- Category: `loop`
- Viewport: landing terminal cells
- Evidence: cursor remains reveal-only and non-persistent.
- Status: `advisory`

4. [LOW] Terminal timeline remains deterministic (`anim-timeline-001`)

- Category: `timeline`
- Viewport: landing default matrix cells
- Evidence: preview-first behavior with explicit full-output action remains intact (`11/12` availability).
- Status: `advisory`

5. [LOW] No interaction-gated critical SEO content introduced (`anim-seo-001`)

- Category: `seo`
- Viewport: landing all
- Evidence: hero claims/CTAs remain immediately rendered despite load-once motion.
- Status: `advisory`

6. [LOW] Reduced-motion parity remains healthy (`anim-a11y-001`)

- Category: `a11y`
- Viewport: reduced matrix cells
- Evidence: reduced preference matched in `24/24`; reduced wrapper average remained `0.00`.
- Status: `advisory`

7. [LOW] Benchmark entry-density remains stable (`anim-benchmark-001`)

- Category: `benchmark`
- Viewport: benchmark default matrix cells
- Evidence: fixture matrix benchmark default wrapper average remains `1.00`.
- Status: `advisory`

8. [LOW] Benchmark mobile readability path remains stable (`anim-benchmark-002`)

- Category: `benchmark`
- Viewport: benchmark fixture portrait `320-412`
- Evidence: mobile summary-card availability remains `10/10` with no root overflow.
- Status: `advisory`
