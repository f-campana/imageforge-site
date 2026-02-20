# Animation Audit Cycle 2 (Post-Fix): Landing + Benchmark

Date: 2026-02-18
Mode: Advisory (`cycle 2`)
Audit type: Post-fix verification (code + runtime viewport checks)

## AnimationAuditSummary

```json
{
  "scope": [
    "/",
    "/benchmarks/latest",
    "components/landing/*",
    "components/benchmark/BenchmarkPageContent.tsx",
    "app/globals.css",
    "hooks/usePrefersReducedMotion.ts"
  ],
  "mode": "advisory",
  "totals": {
    "critical": 0,
    "high": 0,
    "medium": 1,
    "low": 7
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
    "Continue reducing non-critical landing reveal density beyond current cycle-2 level.",
    "Keep root overflow and reduced-motion matrix checks in each animation cycle.",
    "Preserve benchmark mobile-card readability path and avoid reintroducing heavy stagger chains."
  ],
  "commands_run": [
    "pnpm lint",
    "pnpm typecheck",
    "NEXT_PUBLIC_SITE_URL=https://example.com pnpm build",
    "NEXT_PUBLIC_SITE_URL=https://example.com pnpm seo:full -- --mode advisory",
    "BASE_URL=http://127.0.0.1:3205 OUTPUT_FILE=/tmp/animation-cycle2-matrix-canonical.json pnpm dlx @playwright/test@1.51.0 test .tmp/animation-cycle2-matrix.spec.js --reporter=line --workers=1",
    "BASE_URL=http://127.0.0.1:3205 OUTPUT_FILE=/tmp/animation-cycle2-matrix-fixture.json pnpm dlx @playwright/test@1.51.0 test .tmp/animation-cycle2-matrix.spec.js --reporter=line --workers=1"
  ],
  "notes": [
    "Fixture-mode benchmark validation was run with BENCHMARK_ENABLE_LOCAL_FIXTURE=1 and BENCHMARK_SNAPSHOT_FIXTURE=sample.",
    "Cycle-1 baseline landing default reveal density was 49 motion nodes/cell; cycle-2 post-fix default average is 45.",
    "All findings remain advisory in cycle 2."
  ]
}
```

## Runtime Matrix Method

- Routes: `/`, `/benchmarks/latest`
- Portrait viewports: `320`, `360`, `375`, `390`, `412`, `768`, `1024`, `1280`, `1440`
- Landscape viewports: `568x320`, `667x375`, `812x375`
- Motion modes: default + reduced (`prefers-reduced-motion: reduce`)
- Data modes:
  - Canonical benchmark data (`data/benchmarks/latest.json`)
  - Fixture benchmark data (`BENCHMARK_ENABLE_LOCAL_FIXTURE=1`, `BENCHMARK_SNAPSHOT_FIXTURE=sample`)

## Findings (AnimationFinding)

1. [MEDIUM] Landing reveal density remains above target (`anim-entry-001`)

- id: `anim-entry-001`
- category: `entry`
- severity: `medium`
- confidence: `0.87`
- viewport: `all landing default cells`
- files:
  - `/Users/fabiencampana/Documents/imageforge-site/components/landing/MotionWrap.tsx`
  - `/Users/fabiencampana/Documents/imageforge-site/components/landing/Hero.tsx`
- evidence: cycle-2 canonical matrix average `landingDefaultMotionWrapAvg=45` (`/tmp/animation-cycle2-matrix-canonical.json`), reduced from cycle-1 baseline `49`.
- user_impact: first-view readability is improved but still visually dense beyond hero.
- perf_impact: moderate compositing/concurrency pressure remains on long landing route.
- seo_impact: indirect only; hero/CTA are now static-first.
- a11y_impact: reduced-motion path is healthy, but default-mode density can still increase cognitive load.
- fix_direction: continue reducing non-critical section reveals and cap concurrent entry wrappers per section.
- verification_steps:
  - keep matrix target below current `45` default average;
  - preserve static-first hero + CTA behavior.
- status: `advisory`

2. [LOW] Narrow-viewport root overflow resolved (`anim-overflow-001`)

- id: `anim-overflow-001`
- category: `performance`
- severity: `low`
- confidence: `0.95`
- viewport: `all cells`
- files:
  - `/Users/fabiencampana/Documents/imageforge-site/app/page.tsx`
  - `/Users/fabiencampana/Documents/imageforge-site/components/landing/CodeBlock.tsx`
  - `/Users/fabiencampana/Documents/imageforge-site/components/landing/InstallCommands.tsx`
  - `/Users/fabiencampana/Documents/imageforge-site/components/landing/ComparisonAndCost.tsx`
- evidence: canonical + fixture matrices both report `overflowLanding=0` and `overflowBenchmark=0`.
- user_impact: landing mobile horizontal drift risk is mitigated.
- perf_impact: reduced root layout/panning friction.
- seo_impact: indirect page-experience benefit.
- a11y_impact: reflow usability is improved on narrow screens.
- fix_direction: keep root overflow clipped and local overflow constrained to intended code/table containers.
- verification_steps:
  - assert `documentElement.scrollWidth <= innerWidth` for all cells each cycle.
- status: `advisory`

3. [LOW] Terminal loop intensity reduced (`anim-loop-001`)

- id: `anim-loop-001`
- category: `loop`
- severity: `low`
- confidence: `0.89`
- viewport: `landing terminal cells`
- files:
  - `/Users/fabiencampana/Documents/imageforge-site/components/landing/TerminalDemo.tsx`
  - `/Users/fabiencampana/Documents/imageforge-site/app/globals.css`
- evidence: cursor now appears only during active reveal and uses slower cadence.
- user_impact: less persistent distraction near explanatory copy.
- perf_impact: reduced continuous animation runtime.
- seo_impact: negligible direct impact.
- a11y_impact: lower repeated-motion exposure.
- fix_direction: keep reveal-only cursor behavior and reduced-motion suppression.
- verification_steps:
  - ensure cursor is absent outside active reveal and in reduced mode.
- status: `advisory`

4. [LOW] Terminal timeline policy is deterministic with manual override (`anim-timeline-001`)

- id: `anim-timeline-001`
- category: `timeline`
- severity: `low`
- confidence: `0.86`
- viewport: `landing default cells`
- files:
  - `/Users/fabiencampana/Documents/imageforge-site/components/landing/TerminalDemo.tsx`
- evidence: `terminalRevealCells=1/12` auto-progression with explicit full-output control visible in `11/12` default cells.
- user_impact: preview-first behavior is now explicit and user-controllable.
- perf_impact: simplified single-interval reveal path.
- seo_impact: low; key content remains outside gated timeline.
- a11y_impact: improved predictability with manual action.
- fix_direction: keep preview-first + manual full-output policy and avoid reintroducing multi-timer complexity.
- verification_steps:
  - verify button remains keyboard reachable across matrix;
  - verify reduced mode shows full output without motion.
- status: `advisory`

5. [LOW] Interaction-gated SEO risk is currently constrained (`anim-seo-001`)

- id: `anim-seo-001`
- category: `seo`
- severity: `low`
- confidence: `0.84`
- viewport: `landing all`
- files:
  - `/Users/fabiencampana/Documents/imageforge-site/components/landing/Hero.tsx`
  - `/Users/fabiencampana/Documents/imageforge-site/components/landing/TerminalDemo.tsx`
- evidence: hero claims and CTA remain static-first; terminal remains enhancement with explicit full-output path.
- user_impact: conversion-critical content is immediately visible.
- perf_impact: neutral direct impact.
- seo_impact: low current risk while key claims stay ungated.
- a11y_impact: more predictable content availability.
- fix_direction: keep critical claims/links in immediate render path.
- verification_steps:
  - audit claim/link placement during release checks.
- status: `advisory`

6. [LOW] Reduced-motion parity is healthy across CSS + JS + motion paths (`anim-a11y-001`)

- id: `anim-a11y-001`
- category: `a11y`
- severity: `low`
- confidence: `0.94`
- viewport: `all reduced cells`
- files:
  - `/Users/fabiencampana/Documents/imageforge-site/components/landing/MotionWrap.tsx`
  - `/Users/fabiencampana/Documents/imageforge-site/hooks/usePrefersReducedMotion.ts`
  - `/Users/fabiencampana/Documents/imageforge-site/app/globals.css`
- evidence: both matrices report reduced-mode media query match in `24/24` cells and `reducedMotionWrapAvg=0.00`.
- user_impact: reduced-motion users receive non-animated path consistently.
- perf_impact: reduced mode minimizes motion work.
- seo_impact: neutral direct impact.
- a11y_impact: strong parity trend.
- fix_direction: preserve explicit reduced-motion gating in all new motion wrappers.
- verification_steps:
  - keep reduced-mode matrix checks mandatory in every cycle.
- status: `advisory`

7. [LOW] Benchmark entry density risk is reduced in data-rich mode (`anim-benchmark-001`)

- id: `anim-benchmark-001`
- category: `benchmark`
- severity: `low`
- confidence: `0.90`
- viewport: `benchmark default cells`
- files:
  - `/Users/fabiencampana/Documents/imageforge-site/components/benchmark/BenchmarkPageContent.tsx`
  - `/Users/fabiencampana/Documents/imageforge-site/components/landing/MotionWrap.tsx`
- evidence: fixture matrix reports `benchmarkDefaultMotionWrapAvg=1.00` after benchmark wrapper consolidation.
- user_impact: benchmark page is easier to scan with less entry animation clutter.
- perf_impact: lower animation concurrency in data-heavy route.
- seo_impact: neutral direct impact.
- a11y_impact: reduced non-essential movement on dense metrics page.
- fix_direction: keep benchmark reveal budget minimal and avoid per-card stagger chains in dense sections.
- verification_steps:
  - re-run fixture matrix whenever benchmark sections are expanded.
- status: `advisory`

8. [LOW] Benchmark mobile interaction friction is mitigated in data-rich mode (`anim-benchmark-002`)

- id: `anim-benchmark-002`
- category: `benchmark`
- severity: `low`
- confidence: `0.91`
- viewport: `benchmark portrait 320-412`
- files:
  - `/Users/fabiencampana/Documents/imageforge-site/components/benchmark/BenchmarkPageContent.tsx`
- evidence: fixture matrix reports benchmark mobile summary cards present in `10/10` portrait checks and root overflow remains `0`.
- user_impact: key benchmark conclusions are readable without mandatory root-level lateral panning.
- perf_impact: neutral to improved due mobile-first summaries.
- seo_impact: neutral direct impact.
- a11y_impact: improved narrow-width readability and interaction comfort.
- fix_direction: keep mobile summary cards primary on narrow widths; keep wide tables for larger breakpoints.
- verification_steps:
  - ensure mobile cards remain present after benchmark schema/layout changes.
- status: `advisory`
