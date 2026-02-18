# Landing and Benchmark Animation Risk Register

Date: 2026-02-18
Scope: Landing + benchmark (`/`, `/benchmarks/latest`, `/components/landing/*`, `/components/benchmark/*`)
Status model: Advisory-only (cycle 1 and cycle 2)

## Usage

- This register tracks animation risks through static review plus runtime viewport/motion verification.
- Every row remains advisory in cycle 2.
- Severity and confidence scoring must follow:
  `/Users/fabiencampana/Documents/imageforge-site/.codex/skills/animation-agent/references/severity-rubric.md`

## Current Issues (Post-Fix Cycle 2)

| id                   | area                                        | severity | confidence | evidence                                                                                                                                                                                                                | impact                                                                                            | recommended_direction                                                                                                      | validation                                                                                                                         |
| -------------------- | ------------------------------------------- | -------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `anim-entry-001`     | landing entry density                       | medium   | 0.87       | Post-fix matrix (`/tmp/animation-cycle2-matrix-canonical.json`) shows landing default `data-motion-wrap` average `45` nodes per cell (down from cycle 1 baseline `49`), with hero headline/body/CTA now static-first.   | First-view density improved but still high across full landing route.                             | Keep reducing non-critical reveal wrappers outside first read path and cap section-level concurrent entry motion.          | Re-run matrix and target further reduction versus current `45` default average while preserving readability at 320/360/390 widths. |
| `anim-overflow-001`  | narrow-viewport root overflow               | low      | 0.95       | Cycle-2 canonical + fixture matrices report `0` overflow cells across all 48 checks per run; landing no longer exceeds `documentElement.scrollWidth > innerWidth` at `320/360` portrait.                                | Root horizontal drift risk is currently mitigated.                                                | Keep `overflow-x-clip` root containment and local overflow containers only for code/table surfaces.                        | Keep root overflow assertion in future matrix runs for both routes and both motion modes.                                          |
| `anim-loop-001`      | terminal loop intensity                     | low      | 0.89       | Terminal cursor now appears only during active reveal, with slower cadence and reduced visual prominence (`TerminalDemo.tsx`, `app/globals.css`).                                                                       | Persistent distraction risk is materially lower.                                                  | Preserve reveal-only cursor visibility and reduced-motion suppression.                                                     | Verify cursor remains hidden outside active reveal and fully hidden in reduced mode.                                               |
| `anim-timeline-001`  | terminal timeline determinism               | low      | 0.86       | Timeline uses a single interval policy plus explicit “Show full output” action; matrix still shows auto-progression in `1/12` default landing cells, but manual full-output path is available in `11/12` default cells. | Behavior is now policy-driven (preview-first) with user override, reducing unpredictability risk. | Keep deterministic preview-first policy and ensure full-output control remains discoverable and keyboard reachable.        | Confirm preview/full-output behavior in all viewports and ensure no regression to multi-timer complexity.                          |
| `anim-seo-001`       | interaction-gated visibility risk           | low      | 0.84       | Hero claims/CTAs are static-first; terminal remains supplementary and now provides explicit full-output control instead of only observer/timer-driven reveal.                                                           | Current direct SEO discoverability risk is limited.                                               | Keep key claims/links in immediately rendered content and treat terminal progression as enhancement-only.                  | Audit key claim/link placement each release and verify initial rendered state contains essential content.                          |
| `anim-a11y-001`      | reduced-motion parity                       | low      | 0.94       | Both matrices show `prefers-reduced-motion` match in all reduced cells (`24/24`) and post-fix `MotionWrap` reduced-mode animated wrapper count at `0.00` average.                                                       | Reduced-motion parity is healthy after cycle-2 fixes.                                             | Keep centralized reduced-motion handling in CSS + JS + `motion` wrappers.                                                  | Re-run reduced-mode matrix each cycle and block regressions where non-essential motion reappears.                                  |
| `anim-benchmark-001` | benchmark entry density (data-rich branch)  | low      | 0.9        | Data-rich fixture matrix (`/tmp/animation-cycle2-matrix-fixture.json`) shows benchmark default `data-motion-wrap` average `1.00` after consolidating to a minimal benchmark entry animation boundary.                   | Benchmark reveal-density spillover risk is currently low.                                         | Keep benchmark reveal budget minimal and avoid reintroducing per-card stagger chains in dense metric sections.             | Re-check benchmark motion-wrap counts whenever benchmark sections or cards are expanded.                                           |
| `anim-benchmark-002` | benchmark narrow-width interaction friction | low      | 0.91       | Data-rich fixture matrix shows benchmark mobile delta/recent card availability in `10/10` portrait checks (`320-412`), with root overflow still `0`.                                                                    | Primary benchmark conclusions are now readable without mandatory root-level lateral panning.      | Keep mobile-first benchmark summary cards as the primary narrow-width path and reserve wide tables for larger breakpoints. | Validate mobile card path and no-root-overflow constraints for future benchmark schema or layout changes.                          |

## Operating Notes

1. Advisory-only behavior remains active in cycle 2.
2. Runtime evidence for cycle 2 was gathered with:
   - `/tmp/animation-cycle2-matrix-canonical.json`
   - `/tmp/animation-cycle2-matrix-fixture.json`
3. Fixture-mode benchmark validation used:
   - `BENCHMARK_ENABLE_LOCAL_FIXTURE=1`
   - `BENCHMARK_SNAPSHOT_FIXTURE=sample`
4. Fix sequencing remains:
   1. user-impact blockers
   2. accessibility/safety risks
   3. SEO discoverability risks
   4. performance regression risks
