# Animation Audit Cycle 4: Landing + Benchmark Enhancement and Safety Gates

Date: 2026-02-18
Mode: Core safety strict (`CI blocking`) + advisory style scoring
Audit type: Post-cycle-4 verification (code + runtime matrix)

## AnimationAuditSummary

```json
{
  "scope": [
    "/",
    "/benchmarks/latest",
    "components/landing/MotionWrap.tsx",
    "components/benchmark/BenchmarkPageContent.tsx",
    "lib/animation/config.ts",
    "scripts/animation/collect-matrix.mts",
    "scripts/animation/assert-core-safety.mts",
    "scripts/animation/run-check.sh",
    ".github/workflows/animation-safety.yml",
    "docs/animation-agent/landing-animation-reference.md",
    "docs/animation-agent/landing-animation-risk-register.md"
  ],
  "mode": "core-safety-strict-plus-advisory-style",
  "totals": {
    "critical": 0,
    "high": 0,
    "medium": 2,
    "low": 7,
    "overall": 9
  },
  "affected_areas": [
    "entry",
    "benchmark",
    "overflow",
    "seo",
    "a11y",
    "governance"
  ],
  "blocking_recommendations": [
    "Keep animation-safety workflow required on pull requests and main.",
    "Keep root-overflow, reduced-motion parity, and hero claim/CTA checks blocking.",
    "Keep canonical and fixture benchmark safety passes mandatory via animation:check."
  ],
  "advisory_recommendations": [
    "Maintain subtle timing budgets and avoid expanding landing choreography beyond current behavior.",
    "Monitor benchmark fixture density after future feature additions; keep reveals low-amplitude.",
    "Continue tracking terminal timeline/loop behavior as advisory unless interaction regressions appear."
  ],
  "commands_run": [
    "pnpm format",
    "pnpm lint",
    "pnpm typecheck",
    "NEXT_PUBLIC_SITE_URL=https://example.com pnpm build",
    "NEXT_PUBLIC_SITE_URL=https://example.com pnpm seo:full -- --mode advisory",
    "NEXT_PUBLIC_SITE_URL=https://example.com pnpm animation:check"
  ],
  "notes": [
    "animation:check now rebuilds both canonical and fixture benchmark variants before running matrix + safety assertions.",
    "Cycle-4 canonical matrix generatedAt=2026-02-18T17:54:14.751Z.",
    "Cycle-4 fixture matrix generatedAt=2026-02-18T17:54:56.493Z."
  ]
}
```

## Findings

1. [MEDIUM] Landing density remains above ideal tuning target (`anim-entry-001`)

- Category: `entry`
- Severity: `medium`
- Confidence: `0.89`
- Viewport: all landing default matrix cells
- Files:
  - `/Users/fabiencampana/Documents/imageforge-site/lib/animation/config.ts`
  - `/Users/fabiencampana/Documents/imageforge-site/components/landing/MotionWrap.tsx`
- Evidence: canonical matrix keeps `landingDefaultMotionWrapAvg=49.00`.
- user_impact: readability remains good, but future expansion space is limited.
- perf_impact: moderate compositing concurrency risk if more landing choreography is added.
- seo_impact: low current risk; hero claim/CTA remain immediate.
- a11y_impact: low current risk; reduced mode remains compliant.
- fix_direction: keep landing additions micro-only and reduce non-critical below-fold wrappers before adding new reveals.
- verification_steps:
  - rerun matrix and track landing default wrapper average;
  - validate hero headline + CTA remain immediate.
- status: `advisory`

2. [LOW] Overflow safety gate is stable (`anim-overflow-001`)

- Category: `overflow`
- Severity: `low`
- Confidence: `0.97`
- Viewport: all canonical + fixture cells
- Evidence: `overflowLanding=0`, `overflowBenchmark=0` in both matrices.
- user_impact: no root horizontal panning regression.
- perf_impact: avoids unnecessary reflow/panning side effects.
- seo_impact: no discoverability regression from overflow-related clipping.
- a11y_impact: preserves narrow-device readability path.
- fix_direction: keep root overflow assertions as merge-blocking.
- verification_steps: ensure `documentElement.scrollWidth <= innerWidth` across matrix.
- status: `enforced`

3. [LOW] Reduced-motion parity gate is stable (`anim-a11y-001`)

- Category: `a11y`
- Severity: `low`
- Confidence: `0.96`
- Viewport: reduced matrix cells
- Evidence: `reducedMatch=24/24` and reduced wrapper average `0.00` in both runs.
- user_impact: reduced-motion users keep static, readable path.
- perf_impact: reduced mode avoids non-essential motion work.
- seo_impact: no content parity drift under reduced mode.
- a11y_impact: direct parity confirmation across CSS + JS motion paths.
- fix_direction: keep `prefersReducedMotion === false` gating and reduced-motion CSS overrides.
- verification_steps: keep reduced `motionWrapCount=0` assertion in CI.
- status: `enforced`

4. [LOW] Critical landing claim/CTA gate is stable (`anim-seo-001`)

- Category: `seo`
- Severity: `low`
- Confidence: `0.90`
- Viewport: all landing cells
- Evidence: `heroClaimMissing=0`, `primaryCtaMissing=0` in canonical + fixture matrices.
- user_impact: conversion path remains immediate.
- perf_impact: none.
- seo_impact: critical claim/link remains non-gated and crawlable.
- a11y_impact: avoids interaction dependency for essential content.
- fix_direction: preserve immediate render path for hero claim and primary CTA.
- verification_steps: keep hero claim + CTA checks in blocking assertions.
- status: `enforced`

5. [MEDIUM] Fixture benchmark density increased as intended and must be monitored (`anim-benchmark-001`)

- Category: `benchmark`
- Severity: `medium`
- Confidence: `0.92`
- Viewport: benchmark default cells (fixture build)
- Files:
  - `/Users/fabiencampana/Documents/imageforge-site/components/benchmark/BenchmarkPageContent.tsx`
  - `/Users/fabiencampana/Documents/imageforge-site/lib/animation/config.ts`
- Evidence: fixture matrix shows `benchmarkDefaultMotionWrapAvg=6.00` vs canonical fallback `1.00`.
- user_impact: richer benchmark view now has subtle section reveals and micro-polish.
- perf_impact: moderate but bounded increase in animated surfaces for data-rich branch.
- seo_impact: no critical-gating risk introduced.
- a11y_impact: reduced path remains static and compliant.
- fix_direction: keep benchmark reveal cadence subtle and avoid adding long stagers/loops.
- verification_steps: track benchmark default wrapper average on every benchmark layout change.
- status: `advisory`

6. [LOW] Fixture mobile benchmark readability remains stable (`anim-benchmark-002`)

- Category: `benchmark`
- Severity: `low`
- Confidence: `0.93`
- Viewport: fixture portrait `320/360/375/390/412`
- Evidence: in each sampled fixture viewport, delta cards render `3` and recent cards render `2`; root overflow remains `0`.
- user_impact: narrow-width interpretation path remains readable.
- perf_impact: no overflow-related rendering regression.
- seo_impact: no critical content hidden behind interaction.
- a11y_impact: cards remain readable in reduced mode as well.
- fix_direction: keep mobile-card-first interpretation path for narrow widths.
- verification_steps: keep fixture mobile card-count checks in cycle audits.
- status: `advisory`

7. [LOW] Core safety gate coverage is now operational (`anim-gate-001`)

- Category: `governance`
- Severity: `low`
- Confidence: `0.95`
- Files:
  - `/Users/fabiencampana/Documents/imageforge-site/.github/workflows/animation-safety.yml`
  - `/Users/fabiencampana/Documents/imageforge-site/scripts/animation/collect-matrix.mts`
  - `/Users/fabiencampana/Documents/imageforge-site/scripts/animation/assert-core-safety.mts`
  - `/Users/fabiencampana/Documents/imageforge-site/scripts/animation/run-check.sh`
- Evidence: workflow and scripts execute successfully with canonical + fixture artifacts.
- user_impact: fewer regressions reach staging/production.
- perf_impact: catches regressions before merge.
- seo_impact: catches interaction-gated critical content regressions before merge.
- a11y_impact: catches reduced-motion parity regressions before merge.
- fix_direction: keep gate scope narrow and deterministic.
- verification_steps: monitor workflow duration/artifacts and keep checks reproducible.
- status: `enforced`
