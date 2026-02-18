# Animation Audit Cycle 5: Landing Smoothing and Micro-Interactions

Date: 2026-02-18
Mode: Core safety strict (`CI blocking`) + advisory style scoring
Audit type: Post-cycle-5 verification (landing-focused)

## AnimationAuditSummary

```json
{
  "scope": [
    "/",
    "components/landing/*",
    "lib/animation/config.ts",
    "app/globals.css",
    "docs/animation-agent/landing-animation-reference.md",
    "docs/animation-agent/landing-animation-risk-register.md"
  ],
  "mode": "core-safety-strict-plus-advisory-style",
  "totals": {
    "critical": 0,
    "high": 0,
    "medium": 1,
    "low": 8,
    "overall": 9
  },
  "affected_areas": [
    "entry",
    "interaction",
    "a11y",
    "seo",
    "performance",
    "governance"
  ],
  "blocking_recommendations": [
    "Keep animation-safety workflow required on pull requests and main.",
    "Keep overflow, reduced-motion parity, and hero claim/CTA checks blocking.",
    "Keep canonical and fixture matrix passes in animation:check."
  ],
  "advisory_recommendations": [
    "Continue lowering landing wrapper density before introducing additional choreography.",
    "Keep ui-interact token classes as the default for new landing controls, links, and card surfaces.",
    "Maintain subtle top-sequence pacing and avoid long stagers."
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
    "Cycle 5 scope was landing-only for top sequence smoothing and landing-wide micro-interaction consistency.",
    "Canonical matrix generatedAt=2026-02-18T23:29:18.250Z.",
    "Fixture matrix generatedAt=2026-02-18T23:29:59.083Z.",
    "Landing target viewport subset (320x800, 390x844, 768x1024, 1280x800, 1440x900, 812x375) passed in default and reduced motion."
  ]
}
```

## Findings

1. [MEDIUM] Landing entry density remains moderate after smoothing (`anim-entry-001`)

- Category: `entry`
- Severity: `medium`
- Confidence: `0.90`
- Viewport: landing default matrix cells
- Files:
  - `/Users/fabiencampana/Documents/imageforge-site/lib/animation/config.ts`
  - `/Users/fabiencampana/Documents/imageforge-site/components/landing/Hero.tsx`
  - `/Users/fabiencampana/Documents/imageforge-site/components/landing/HeaderNav.tsx`
- Evidence: cycle-5 canonical matrix keeps `landingDefaultMotionWrapAvg=49.00`; load-once budget/stagger values are softened (`0.32s`, `220ms`, `6px`, delays `0/80/140/220`).
- user_impact: top motion is less abrupt while preserving readability.
- perf_impact: wrapper concurrency remains moderate at route level.
- seo_impact: no critical visibility regressions.
- a11y_impact: reduced-motion path remains compliant.
- fix_direction: prioritize reducing non-critical in-view wrappers before adding new section choreography.
- verification_steps:
  - rerun matrix after future landing animation changes;
  - keep hero claim/CTA checks passing.
- status: `advisory`

2. [LOW] Core overflow gate remains healthy (`anim-overflow-001`)

- Category: `performance`
- Severity: `low`
- Confidence: `0.97`
- Viewport: canonical + fixture matrix cells
- Evidence: `overflowLanding=0` and `overflowBenchmark=0` across 48 cells in both runs.
- user_impact: no root horizontal panning regressions.
- perf_impact: avoids overflow-related layout/panning costs.
- seo_impact: no content discoverability side effects.
- a11y_impact: narrow-width readability preserved.
- fix_direction: keep overflow assertion blocking in CI.
- verification_steps: continue `documentElement.scrollWidth <= innerWidth` checks.
- status: `enforced`

3. [LOW] Reduced-motion parity remains healthy (`anim-a11y-001`)

- Category: `a11y`
- Severity: `low`
- Confidence: `0.96`
- Viewport: reduced matrix cells
- Evidence: `reducedMatch=24/24`; reduced wrapper average remains `0.00`.
- user_impact: reduced-motion users keep stable static path.
- perf_impact: reduced mode avoids non-essential motion work.
- seo_impact: no content parity drift.
- a11y_impact: strict CSS + JS + MotionWrap parity remains intact.
- fix_direction: preserve `prefersReducedMotion === false` gating and reduced-motion CSS rules.
- verification_steps: keep reduced-mode wrapper assertion blocking.
- status: `enforced`

4. [LOW] Hero claim/CTA visibility remains non-gated (`anim-seo-001`)

- Category: `seo`
- Severity: `low`
- Confidence: `0.91`
- Viewport: landing cells and target subset
- Evidence: `heroClaimMissing=0` and `primaryCtaMissing=0` in canonical + fixture; target subset had `0` failures.
- user_impact: conversion path remains immediate.
- perf_impact: none.
- seo_impact: critical text/CTA discoverability remains safe.
- a11y_impact: no interaction dependency for core content.
- fix_direction: keep hero claim + CTA in immediate render path.
- verification_steps: preserve blocking hero/CTA checks.
- status: `enforced`

5. [LOW] Landing-wide interaction consistency improved (`anim-interact-001`)

- Category: `interaction`
- Severity: `low`
- Confidence: `0.87`
- Files:
  - `/Users/fabiencampana/Documents/imageforge-site/app/globals.css`
  - `/Users/fabiencampana/Documents/imageforge-site/components/landing/Hero.tsx`
  - `/Users/fabiencampana/Documents/imageforge-site/components/landing/HeaderNav.tsx`
  - `/Users/fabiencampana/Documents/imageforge-site/components/landing/InstallCommands.tsx`
  - `/Users/fabiencampana/Documents/imageforge-site/components/landing/CopyButton.tsx`
  - `/Users/fabiencampana/Documents/imageforge-site/components/landing/TerminalDemo.tsx`
  - `/Users/fabiencampana/Documents/imageforge-site/components/landing/FeaturesGrid.tsx`
  - `/Users/fabiencampana/Documents/imageforge-site/components/landing/SegmentUseCases.tsx`
  - `/Users/fabiencampana/Documents/imageforge-site/components/landing/Limitations.tsx`
  - `/Users/fabiencampana/Documents/imageforge-site/components/landing/StatsStrip.tsx`
  - `/Users/fabiencampana/Documents/imageforge-site/components/landing/Methodology.tsx`
  - `/Users/fabiencampana/Documents/imageforge-site/components/landing/ComparisonAndCost.tsx`
  - `/Users/fabiencampana/Documents/imageforge-site/components/landing/FinalCtaFooter.tsx`
  - `/Users/fabiencampana/Documents/imageforge-site/components/landing/CodeBlock.tsx`
- Evidence: shared interaction token classes are applied across landing controls, links, and card surfaces.
- user_impact: hover/focus behavior is more predictable across the route.
- perf_impact: low transform amplitude and short durations maintain low overhead.
- seo_impact: no content gating impact.
- a11y_impact: shared focus-ring treatment improves keyboard consistency.
- fix_direction: keep token-based patterns as default; avoid ad hoc transitions in new landing components.
- verification_steps: include token usage + keyboard focus checks in future cycle audits.
- status: `advisory`

6. [LOW] Core safety gate coverage remains operational (`anim-gate-001`)

- Category: `governance`
- Severity: `low`
- Confidence: `0.95`
- Files:
  - `/Users/fabiencampana/Documents/imageforge-site/.github/workflows/animation-safety.yml`
  - `/Users/fabiencampana/Documents/imageforge-site/scripts/animation/collect-matrix.mts`
  - `/Users/fabiencampana/Documents/imageforge-site/scripts/animation/assert-core-safety.mts`
  - `/Users/fabiencampana/Documents/imageforge-site/scripts/animation/run-check.sh`
- Evidence: cycle-5 changes pass blocking checks in canonical + fixture modes.
- user_impact: reduced probability of shipping animation safety regressions.
- perf_impact: catches overflow/reduced-motion regressions before merge.
- seo_impact: catches interaction-gated critical content regressions before merge.
- a11y_impact: catches reduced-motion parity regressions before merge.
- fix_direction: keep gate scope narrow and deterministic.
- verification_steps: monitor workflow runtime and artifact health over time.
- status: `enforced`
