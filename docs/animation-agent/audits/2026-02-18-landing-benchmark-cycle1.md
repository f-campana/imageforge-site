# Animation Audit Cycle 1 (Landing + Benchmark)

Date: 2026-02-18
Mode: Advisory (`cycle 1`)
Audit type: Comprehensive, code + runtime viewport checks

## Animation Audit Summary

- Scope: landing (`/`) + benchmark (`/benchmarks/latest`) + shared motion primitives
- Mode: advisory
- Totals: critical=0, high=2, medium=5, low=1
- Affected areas: entry, performance, interaction, seo, a11y, benchmark
- Blocking recommendations: none (cycle 1 advisory-only)
- Advisory recommendations:
  - Reduce first-view reveal density on landing sections using shared `MotionWrap`.
  - Remove root-level horizontal overflow on narrow landing widths (`320`, `360`).
  - Stabilize terminal timeline behavior across viewports and keep SEO-relevant copy ungated.
  - Add benchmark-specific motion budget for data-rich branch before snapshot content grows.
  - Maintain reduced-motion parity checks for all new animation paths.
- Commands run:
  - `pnpm lint && pnpm typecheck && pnpm build`
  - `NEXT_PUBLIC_SITE_URL=https://example.com pnpm seo:full -- --mode advisory`
  - `pnpm dlx @playwright/test@1.51.0 test animation-audit.spec.js --reporter=line --workers=1` (prod server)
  - `pnpm dlx @playwright/test@1.51.0 test animation-focus.spec.js --reporter=line --workers=1` (prod server)
- Notes:
  - Runtime matrix evidence captured in `/tmp/animation-runtime-matrix-prod.json` and `/tmp/animation-focus-matrix-prod.json`.
  - Benchmark runtime currently renders fallback branch because `data/benchmarks/latest.json` is `null`; data-rich benchmark findings rely on static evidence with lower confidence.

## Coverage Inventory

`MotionWrap` usage was reviewed in all landing and benchmark components currently importing it:

- `/Users/fabiencampana/Documents/imageforge-site/components/landing/CICheckExample.tsx`
- `/Users/fabiencampana/Documents/imageforge-site/components/landing/ComparisonAndCost.tsx`
- `/Users/fabiencampana/Documents/imageforge-site/components/landing/FeaturesGrid.tsx`
- `/Users/fabiencampana/Documents/imageforge-site/components/landing/FinalCtaFooter.tsx`
- `/Users/fabiencampana/Documents/imageforge-site/components/landing/HeaderNav.tsx`
- `/Users/fabiencampana/Documents/imageforge-site/components/landing/Hero.tsx`
- `/Users/fabiencampana/Documents/imageforge-site/components/landing/HowItWorks.tsx`
- `/Users/fabiencampana/Documents/imageforge-site/components/landing/Limitations.tsx`
- `/Users/fabiencampana/Documents/imageforge-site/components/landing/ManifestExample.tsx`
- `/Users/fabiencampana/Documents/imageforge-site/components/landing/Methodology.tsx`
- `/Users/fabiencampana/Documents/imageforge-site/components/landing/NextIntegration.tsx`
- `/Users/fabiencampana/Documents/imageforge-site/components/landing/ProblemStrip.tsx`
- `/Users/fabiencampana/Documents/imageforge-site/components/landing/SegmentUseCases.tsx`
- `/Users/fabiencampana/Documents/imageforge-site/components/landing/StatsStrip.tsx`
- `/Users/fabiencampana/Documents/imageforge-site/components/benchmark/BenchmarkPageContent.tsx`

Additional direct motion sources reviewed:

- `/Users/fabiencampana/Documents/imageforge-site/components/landing/TerminalDemo.tsx`
- `/Users/fabiencampana/Documents/imageforge-site/components/landing/MotionWrap.tsx`
- `/Users/fabiencampana/Documents/imageforge-site/hooks/usePrefersReducedMotion.ts`
- `/Users/fabiencampana/Documents/imageforge-site/app/globals.css`

## Runtime Matrix Method

- Routes: `/`, `/benchmarks/latest`
- Portrait widths: `320`, `360`, `375`, `390`, `412`, `768`, `1024`, `1280`, `1440`
- Landscape sizes: `568x320`, `667x375`, `812x375`
- Motion modes: default + reduced (`prefers-reduced-motion: reduce`)
- Per-cell checks:
  - root horizontal overflow
  - heading visibility
  - focus traversal visibility
  - motion class density (`motion-rise`)
  - terminal timeline progression behavior (landing)

## Findings

1. [HIGH] Landing reveal density is too high in default mode (`anim-entry-001`)

- Category: entry
- Viewport: all audited landing cells, strongest UX impact in mobile portrait
- Files:
  - `/Users/fabiencampana/Documents/imageforge-site/components/landing/MotionWrap.tsx`
  - `/Users/fabiencampana/Documents/imageforge-site/components/landing/Hero.tsx`
  - `/Users/fabiencampana/Documents/imageforge-site/app/globals.css`
- Evidence: runtime matrix average `motionRiseCount=49` for landing default cells.
- User impact: first-view comprehension can degrade from concurrent reveal load.
- Perf impact: increased animation concurrency may raise paint/composite pressure.
- SEO impact: indirect risk if core message clarity is delayed.
- A11y impact: motion-sensitive users can face higher cognitive load when default mode is dense.
- Fix direction: set an above-the-fold reveal budget and reduce concurrent animated blocks.
- Verification:
  - Re-run matrix and assert reduced above-the-fold `motion-rise` count.
  - Confirm hero + CTA readability in first viewport without waiting for animation.
- Status: advisory

2. [HIGH] Root-level horizontal overflow on narrow landing screens (`anim-overflow-001`)

- Category: performance
- Viewport: `320x800`, `360x800` (default and reduced)
- Files:
  - `/Users/fabiencampana/Documents/imageforge-site/components/landing/CodeBlock.tsx`
  - `/Users/fabiencampana/Documents/imageforge-site/components/landing/InstallCommands.tsx`
  - `/Users/fabiencampana/Documents/imageforge-site/components/landing/ComparisonAndCost.tsx`
- Evidence: runtime matrix records `scrollWidth=375` at `innerWidth=320/360`; overflow probe found wide code/command surfaces causing page-level spill.
- User impact: unintended horizontal page scroll increases interaction friction.
- Perf impact: larger scrollable surface can increase layout/paint complexity.
- SEO impact: indirect page-experience risk from mobile usability regression.
- A11y impact: reflow usability degrades on narrow screens.
- Fix direction: constrain overflow to local containers and prevent root horizontal scroll.
- Verification:
  - Assert no root horizontal scroll in all matrix cells.
  - Confirm code/command areas remain usable with contained overflow only.
- Status: advisory

3. [MEDIUM] Terminal loop intensity remains persistent when active (`anim-loop-001`)

- Category: loop
- Viewport: landing where terminal animation progresses
- Files:
  - `/Users/fabiencampana/Documents/imageforge-site/app/globals.css`
  - `/Users/fabiencampana/Documents/imageforge-site/components/landing/TerminalDemo.tsx`
- Evidence: infinite `terminal-caret` keyframe loop; loop appears in progressed timeline states.
- User impact: can distract from nearby explanatory copy.
- Perf impact: minor continuous repaint cost while cursor loop is active.
- SEO impact: negligible direct impact.
- A11y impact: repeated motion may discomfort some users.
- Fix direction: lower prominence and ensure loop suppression remains strict in reduced mode.
- Verification:
  - Validate cursor behavior across representative desktop/mobile cells.
  - Validate reduced mode always hides cursor loop.
- Status: advisory

4. [MEDIUM] Terminal progression behavior is viewport-dependent (`anim-timeline-001`)

- Category: timeline
- Viewport: landing matrix, especially mobile and landscape
- Files:
  - `/Users/fabiencampana/Documents/imageforge-site/components/landing/TerminalDemo.tsx`
- Evidence: progression observed in `1/12` default landing cells (observer threshold + visibility dependent).
- User impact: inconsistent narrative progression depending on initial viewport geometry.
- Perf impact: timers/observer complexity without deterministic UX gain.
- SEO impact: potential future risk if meaningful copy moved into gated timeline states.
- A11y impact: inconsistent timing can create unpredictability.
- Fix direction: define deterministic progression policy and simplify observer/timer interplay.
- Verification:
  - Validate consistent intended behavior across the full matrix.
  - Confirm static fallback behavior remains clear when progression does not trigger.
- Status: advisory

5. [MEDIUM] Interaction-gated visibility risk for future content drift (`anim-seo-001`)

- Category: seo
- Viewport: landing all
- Files:
  - `/Users/fabiencampana/Documents/imageforge-site/components/landing/TerminalDemo.tsx`
  - `/Users/fabiencampana/Documents/imageforge-site/components/landing/Hero.tsx`
- Evidence: timeline-gated terminal lines change only after intersection + timer progression.
- User impact: low today; could rise if key content migrates into gated lines.
- Perf impact: neutral direct impact.
- SEO impact: medium future risk if important claims/links become gated.
- A11y impact: gated reveal can reduce predictability.
- Fix direction: keep SEO-relevant claims/links in immediate non-gated content.
- Verification:
  - Audit key claim/link placement before each release.
  - Ensure initial rendered state contains essential content.
- Status: advisory

6. [LOW] Reduced-motion parity is currently healthy but needs regression protection (`anim-a11y-001`)

- Category: a11y
- Viewport: all reduced-mode cells
- Files:
  - `/Users/fabiencampana/Documents/imageforge-site/hooks/usePrefersReducedMotion.ts`
  - `/Users/fabiencampana/Documents/imageforge-site/app/globals.css`
- Evidence: reduced matrix checks show zero `motion-rise` nodes in all reduced cells and visible focus targets remain accessible.
- User impact: positive current behavior.
- Perf impact: reduced mode lowers motion cost.
- SEO impact: neutral direct impact.
- A11y impact: strong current compliance trend.
- Fix direction: preserve centralized reduced-motion behavior and audit parity on every new motion path.
- Verification:
  - Keep reduced-mode checks in every animation audit cycle.
- Status: advisory

7. [MEDIUM] Benchmark data-rich branch may inherit excessive reveal density (`anim-benchmark-001`)

- Category: entry
- Viewport: benchmark route when snapshot data is present
- Files:
  - `/Users/fabiencampana/Documents/imageforge-site/components/benchmark/BenchmarkPageContent.tsx`
  - `/Users/fabiencampana/Documents/imageforge-site/components/landing/MotionWrap.tsx`
- Evidence: static review shows many `MotionWrap` boundaries in data-rich benchmark sections; runtime currently exercised fallback branch only.
- User impact: data-heavy pages may feel over-animated and harder to scan.
- Perf impact: more concurrent entry animations can increase paint/composite work.
- SEO impact: neutral direct impact.
- A11y impact: increased motion density risk for motion-sensitive users.
- Fix direction: define a benchmark-specific reveal budget and reduce simultaneous animation in dense metric sections.
- Verification:
  - Re-run runtime matrix once benchmark snapshot is non-null.
  - Compare data-rich motion density and readability at `320-412` widths.
- Status: advisory

8. [MEDIUM] Benchmark data-rich tables may require horizontal panning on narrow widths (`anim-benchmark-002`)

- Category: interaction
- Viewport: benchmark route (data-rich path), narrow portrait
- Files:
  - `/Users/fabiencampana/Documents/imageforge-site/components/benchmark/BenchmarkPageContent.tsx`
- Evidence: static code includes wide table/chart structures with overflow containers; fallback runtime path does not exercise these branches.
- User impact: potential comprehension and navigation friction on mobile.
- Perf impact: moderate due larger scrollable containers.
- SEO impact: neutral direct impact.
- A11y impact: may reduce ease of use for touch and zoom users.
- Fix direction: prioritize responsive metric summaries and minimize required lateral panning for key data.
- Verification:
  - Test populated benchmark route at 320/360/390/412 and landscape matrix.
  - Confirm primary benchmark conclusions are available without horizontal panning.
- Status: advisory
