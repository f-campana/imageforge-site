# Landing and Benchmark Animation Risk Register

Date: 2026-02-18
Scope: Landing + benchmark (`/`, `/benchmarks/latest`, `/components/landing/*`, `/components/benchmark/*`)
Status model: Advisory-only (cycle 1 to cycle 3)

## Usage

- This register tracks animation risks through static review plus runtime viewport/motion verification.
- Every row remains advisory through cycle 3.
- Severity and confidence scoring must follow:
  `/Users/fabiencampana/Documents/imageforge-site/.codex/skills/animation-agent/references/severity-rubric.md`

## Current Issues (Post-Reintroduction Cycle 3)

| id                   | area                                        | severity | confidence | evidence                                                                                                                                                                       | impact                                                                                                | recommended_direction                                                                                              | validation                                                                                                   |
| -------------------- | ------------------------------------------- | -------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `anim-entry-001`     | landing entry density                       | medium   | 0.88       | Cycle-3 matrix (`/tmp/animation-cycle3-pr2-canonical.json`) shows landing default wrapper average `49` after load-once nav+hero reintroduction (`45` in cycle 2 post-fix).     | Top-half polish improved perceived quality, but overall landing reveal density remains moderate risk. | Keep top-half motion subtle and reduce non-critical below-fold wrapper density before adding broader choreography. | Re-run matrix after future tuning; target reduction from `49` without reducing nav/hero readability.         |
| `anim-overflow-001`  | narrow-viewport root overflow               | low      | 0.95       | Cycle-3 canonical + fixture matrices report `overflowLanding=0` and `overflowBenchmark=0` across all 48 checks per run.                                                        | Root-level horizontal drift risk remains mitigated.                                                   | Preserve root `overflow-x-clip` and keep overflow constrained to local code/table containers only.                 | Keep `documentElement.scrollWidth <= innerWidth` assertion in canonical + fixture matrix checks.             |
| `anim-loop-001`      | terminal loop intensity                     | low      | 0.89       | Terminal cursor remains reveal-only with subdued cadence and no persistent decorative loop state.                                                                              | Distraction risk is currently low.                                                                    | Keep cursor tied to active reveal states and maintain strict reduced-motion suppression.                           | Verify cursor is absent outside active reveal and hidden in reduced mode across matrix cells.                |
| `anim-timeline-001`  | terminal timeline determinism               | low      | 0.87       | Cycle-3 matrix still shows preview-first auto progression only in `1/12` default landing cells, with explicit full-output control visible in `11/12`.                          | Deterministic policy is acceptable; remaining variability is controlled and user-overridable.         | Keep preview-first behavior and full-output action explicit and keyboard reachable.                                | Verify full-output control remains present and focus-visible where preview remains partial.                  |
| `anim-seo-001`       | interaction-gated visibility risk           | low      | 0.84       | Hero claims and CTAs remain immediate content; nav+hero load-once motion does not gate critical claim/link availability.                                                       | Current SEO discoverability risk is low.                                                              | Keep critical claims/links in immediate render path; treat progressive terminal output as supplemental only.       | Audit key claims/links in initial render state each release.                                                 |
| `anim-a11y-001`      | reduced-motion parity                       | low      | 0.94       | Cycle-3 matrices show reduced-motion media match in `24/24` reduced cells and reduced-mode animated wrapper average `0.00`.                                                    | Reduced-motion parity remains healthy after nav+hero reintroduction.                                  | Preserve strict gating in `MotionWrap` (`prefersReducedMotion === false`) and CSS reduced-motion overrides.        | Keep reduced-mode matrix checks mandatory on every motion-affecting PR.                                      |
| `anim-benchmark-001` | benchmark entry density (data-rich branch)  | low      | 0.90       | Cycle-3 fixture matrix (`/tmp/animation-cycle3-pr2-fixture.json`) shows benchmark default wrapper average remains `1.00`; cycle-3 scope did not expand benchmark choreography. | Benchmark entry-density risk remains low and stable.                                                  | Keep benchmark reveal budget minimal until cycle-4 enhancement pass.                                               | Re-check benchmark wrapper density after cycle-4 benchmark polish changes.                                   |
| `anim-benchmark-002` | benchmark narrow-width interaction friction | low      | 0.91       | Cycle-3 fixture portrait checks keep benchmark mobile-card availability at `10/10` with zero root overflow.                                                                    | Mobile readability path remains effective for data-rich benchmark view.                               | Preserve mobile-first cards as primary narrow-width interpretation path and keep wide tables desktop-oriented.     | Validate mobile-card availability and no-root-overflow constraints whenever benchmark schema/layout evolves. |

## Operating Notes

1. Advisory-only behavior remains active through cycle 3.
2. Runtime evidence for cycle 3 was gathered with:
   - `/tmp/animation-cycle3-pr2-canonical.json`
   - `/tmp/animation-cycle3-pr2-fixture.json`
3. Fixture-mode benchmark validation used:
   - `BENCHMARK_ENABLE_LOCAL_FIXTURE=1`
   - `BENCHMARK_SNAPSHOT_FIXTURE=sample`
4. Fix sequencing remains:
   1. user-impact blockers
   2. accessibility/safety risks
   3. SEO discoverability risks
   4. performance regression risks
