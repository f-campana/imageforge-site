# Animation Audit Cycle 6: Benchmark Density Reduction and Micro-Interaction Consistency

Date: 2026-02-18
Mode: Core safety strict (`CI blocking`) + advisory style scoring
Audit type: Post-cycle-6 verification (benchmark-focused)

## AnimationAuditSummary

```json
{
  "scope": [
    "/benchmarks/latest",
    "components/benchmark/BenchmarkPageContent.tsx",
    "lib/animation/config.ts",
    "docs/animation-agent/landing-animation-reference.md",
    "docs/animation-agent/landing-animation-risk-register.md"
  ],
  "mode": "core-safety-strict-plus-advisory-style",
  "totals": {
    "critical": 0,
    "high": 0,
    "medium": 0,
    "low": 7,
    "overall": 7
  },
  "affected_areas": [
    "benchmark",
    "interaction",
    "overflow",
    "a11y",
    "seo",
    "governance"
  ],
  "blocking_recommendations": [
    "Keep animation-safety workflow required on pull requests and main.",
    "Keep overflow, reduced-motion parity, and hero claim/CTA checks blocking.",
    "Keep canonical and fixture matrix passes in animation:check."
  ],
  "advisory_recommendations": [
    "Keep benchmark fixture default wrapper average at or below 4.",
    "Keep benchmark interaction surfaces on shared ui-interact token classes.",
    "Continue mobile-card readability checks for benchmark portrait viewports."
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
    "Cycle-6 canonical matrix generatedAt=2026-02-18T23:56:42.494Z.",
    "Cycle-6 fixture matrix generatedAt=2026-02-18T23:57:23.748Z.",
    "Fixture benchmark default wrapper average is now 4.00 (cycle-5 baseline was 6.00)."
  ]
}
```

## Findings

1. [LOW] Benchmark entry density now meets cycle-6 target (`anim-benchmark-001`)

- Category: `benchmark`
- Severity: `low`
- Confidence: `0.94`
- Viewport: benchmark fixture default matrix cells
- Files:
  - `/Users/fabiencampana/Documents/imageforge-site/components/benchmark/BenchmarkPageContent.tsx`
  - `/Users/fabiencampana/Documents/imageforge-site/lib/animation/config.ts`
- Evidence: cycle-6 fixture matrix shows `benchmarkDefaultMotionWrapAvg=4.00`; cycle-6 canonical remains `1.00` for fallback branch behavior.
- user_impact: benchmark first-view readability is improved while preserving subtle sequence guidance.
- perf_impact: lower concurrent wrapper animation density reduces compositing pressure versus cycle-5 fixture behavior.
- seo_impact: no interaction-gated benchmark claim/link behavior introduced.
- a11y_impact: reduced-motion benchmark path remains static and compliant.
- fix_direction: keep benchmark animated section wrappers bounded to the current four-section model unless evidence justifies expansion.
- verification_steps:
  - rerun matrix and track fixture benchmark default wrapper average;
  - keep threshold at `<=4`.
- status: `advisory`

2. [LOW] Benchmark micro-interaction consistency is standardized (`anim-interact-002`)

- Category: `interaction`
- Severity: `low`
- Confidence: `0.89`
- Files:
  - `/Users/fabiencampana/Documents/imageforge-site/components/benchmark/BenchmarkPageContent.tsx`
  - `/Users/fabiencampana/Documents/imageforge-site/app/globals.css`
- Evidence: benchmark controls/links/cards now use shared classes (`ui-interact-control`, `ui-interact-link`, `ui-interact-card`, `ui-focus-ring`) instead of local ad hoc transition utilities.
- user_impact: interaction feedback is more predictable across landing and benchmark routes.
- perf_impact: tokenized micro-motion stays low-amplitude and transform-limited.
- seo_impact: no discoverability regressions from interaction-token changes.
- a11y_impact: focus-ring parity is now consistent on benchmark interactive controls.
- fix_direction: keep token classes as the benchmark default and avoid one-off transition styles in new benchmark blocks.
- verification_steps:
  - include token-usage spot checks in benchmark audit passes;
  - confirm focus-visible parity for keyboard navigation.
- status: `advisory`

3. [LOW] Benchmark narrow-width readability remains stable (`anim-benchmark-002`)

- Category: `benchmark`
- Severity: `low`
- Confidence: `0.94`
- Viewport: fixture portrait `320/360/375/390/412` in default and reduced modes
- Evidence: cycle-6 fixture checks retain `delta cards=3` and `recent cards=2` in all sampled portrait cells; root overflow remains `0`.
- user_impact: narrow-width benchmark interpretation remains available without root panning.
- perf_impact: no overflow regression introduced by cycle-6 benchmark edits.
- seo_impact: key benchmark data remains visible without interaction gating.
- a11y_impact: mobile benchmark information remains readable in reduced mode.
- fix_direction: preserve the current mobile-card-first benchmark interpretation path.
- verification_steps:
  - keep fixture mobile card-count checks in each benchmark animation cycle.
- status: `advisory`

4. [LOW] Overflow safety gate remains stable (`anim-overflow-001`)

- Category: `overflow`
- Severity: `low`
- Confidence: `0.97`
- Viewport: canonical + fixture matrix cells
- Evidence: cycle-6 canonical and fixture matrices both report `overflowLanding=0` and `overflowBenchmark=0`.
- user_impact: no horizontal root panning regressions on tested viewports.
- perf_impact: avoids overflow-induced rendering regressions.
- seo_impact: no overflow-related content visibility regressions.
- a11y_impact: narrow-width readability remains stable.
- fix_direction: keep overflow assertion blocking in core safety checks.
- verification_steps:
  - maintain `documentElement.scrollWidth <= innerWidth` assertion in `animation:safety`.
- status: `enforced`

5. [LOW] Reduced-motion parity remains stable (`anim-a11y-001`)

- Category: `a11y`
- Severity: `low`
- Confidence: `0.96`
- Viewport: reduced matrix cells
- Evidence: cycle-6 fixture reduced-motion media matches in `24/24` cells; benchmark reduced wrapper average remains `0.00`.
- user_impact: reduced-motion users continue to receive a static, readable route.
- perf_impact: reduced mode avoids non-essential animation work.
- seo_impact: no content parity drift under reduced mode.
- a11y_impact: CSS + JS + motion wrapper parity remains intact.
- fix_direction: preserve strict reduced-motion gating across wrapper and CSS token behavior.
- verification_steps:
  - keep reduced-mode `motionWrapCount=0` assertion blocking in CI.
- status: `enforced`

6. [LOW] Critical hero claim/CTA safety gate remains stable (`anim-seo-001`)

- Category: `seo`
- Severity: `low`
- Confidence: `0.91`
- Viewport: landing rows in canonical + fixture matrices
- Evidence: cycle-6 matrices report `heroClaimPresent=true` and `primaryCtaPresent=true` with non-empty href in all landing cells (`24/24`).
- user_impact: conversion-critical landing path remains immediate.
- perf_impact: none.
- seo_impact: critical claim and primary CTA remain discoverable without interaction.
- a11y_impact: avoids interaction dependency for key path visibility.
- fix_direction: keep hero claim/CTA safety checks in blocking script as benchmark work evolves.
- verification_steps:
  - preserve claim/CTA assertions in `scripts/animation/assert-core-safety.mts`.
- status: `enforced`

7. [LOW] Core safety gate coverage remains operational (`anim-gate-001`)

- Category: `governance`
- Severity: `low`
- Confidence: `0.95`
- Files:
  - `/Users/fabiencampana/Documents/imageforge-site/.github/workflows/animation-safety.yml`
  - `/Users/fabiencampana/Documents/imageforge-site/scripts/animation/collect-matrix.mts`
  - `/Users/fabiencampana/Documents/imageforge-site/scripts/animation/assert-core-safety.mts`
  - `/Users/fabiencampana/Documents/imageforge-site/scripts/animation/run-check.sh`
- Evidence: cycle-6 branch passes canonical + fixture checks through `NEXT_PUBLIC_SITE_URL=https://example.com pnpm animation:check`.
- user_impact: lower probability of shipping animation regressions.
- perf_impact: catches overflow/density safety regressions before merge.
- seo_impact: catches interaction-gated critical content regressions before merge.
- a11y_impact: catches reduced-motion parity regressions before merge.
- fix_direction: maintain current narrow blocking scope and keep style scoring advisory.
- verification_steps:
  - monitor workflow runtime and matrix artifact health on each cycle PR.
- status: `enforced`
