# Product Claim Matrix (Integration Branch)

- Scope branch: `codex/staging-landing-seo-integration`
- Governance owner: Product + Growth + CLI maintainers
- Baseline date: 2026-02-15

| Claim                                                                          | Source location                                                                                             | Evidence class                                       | Volatility | Owner              | Update cadence                   |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ---------- | ------------------ | -------------------------------- |
| Build-time image optimization, not runtime transformation                      | `components/landing/Hero.tsx`, `components/landing/constants.ts`                                            | CLI behavior + docs                                  | Low        | CLI maintainers    | Per release                      |
| WebP/AVIF conversion support                                                   | `components/landing/constants.ts`, `app/layout.tsx`                                                         | CLI behavior + tests                                 | Low        | CLI maintainers    | Per release                      |
| `blurDataURL` and manifest metadata support                                    | `components/landing/constants.ts`, `components/landing/ManifestExample.tsx`                                 | CLI behavior + tests                                 | Low        | CLI maintainers    | Per release                      |
| Hash-based caching and rerun determinism                                       | `components/landing/constants.ts`, `components/landing/TerminalDemo.tsx`                                    | CLI behavior + tests                                 | Medium     | CLI maintainers    | Per release                      |
| `--check` CI guard mode                                                        | `components/landing/constants.ts`, `components/landing/CICheckExample.tsx`                                  | CLI behavior + tests                                 | Low        | CLI maintainers    | Per release                      |
| Benchmark evidence and methodology numbers                                     | `data/benchmarks/latest.json`, `app/benchmarks/latest/page.tsx`, `components/landing/benchmark-evidence.ts` | CLI benchmark artifacts synced via approval-gated PR | High       | CLI + Growth       | Nightly source, reviewed on sync |
| Comparison/pricing scenario statements                                         | `components/landing/ComparisonAndCost.tsx`, `components/landing/constants.ts`                               | External references + dated assumptions              | High       | Product + Growth   | Monthly                          |
| Air-gapped/local-processing compatibility statements                           | `components/landing/constants.ts`                                                                           | Architectural behavior                               | Medium     | Product + Security | Quarterly                        |
| Responsive width-set semantics (requested vs effective, no upscale, width cap) | `components/landing/constants.ts`, `docs/pr-diff-audit-agents/cli-contract-pin.md`                          | Pinned to `022957c640615c3abb45d1a7e3fb4cba961be558` | High       | CLI maintainers    | At release + per contract change |

## Governance Notes

1. Dated claims must include both `as-of` date and ownership.
2. Claims dependent on responsive width semantics must stay aligned to the pinned SHA in `cli-contract-pin.md` and be re-reviewed on each CLI contract change.
3. Source links for pricing claims must remain valid and be re-checked at each monthly review.
4. Benchmark claims must be sourced from merged benchmark sync PR snapshots, not manual literal edits.
