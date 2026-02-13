# Changed-Surface Test Catalog

## Objectives

Define minimum test coverage additions and manual checks for surfaces introduced in PR-diff integration work.

## Risk-Ranked Catalog

| Priority | Surface | Risk | Current Coverage | Planned Coverage |
|---|---|---|---|---|
| P0 | Install command tab semantics (`components/landing/InstallCommands.tsx`) | Regressed accessibility and incorrect package manager command display | Typecheck + lint only | Add lightweight render interaction tests (tab activation, `aria-selected`, `role=tab`, panel wiring) |
| P0 | Package-manager preference persistence (`components/landing/use-package-manager-preference.ts`) | Wrong command shown after reload, broken persistence due localStorage/event drift | Typecheck + lint only | Add unit tests for initial read, write, event sync, fallback behavior |
| P0 | SEO URL resolution permutations (`lib/seo/site-url.ts`, `scripts/seo/config.mjs`) | Canonical URL drift between runtime metadata and SEO script checks | SEO config tests exist | Extend coverage to assert parity scenarios between runtime and SEO resolver outputs |
| P1 | Hero keyword coverage SEO signal | Reduced search intent coverage | SEO advisory report | Keep advisory tracking and update content copy only when it remains aligned with product contract |
| P1 | OG/Twitter image alt quality | Generic alt text weakening technical SEO checks | SEO advisory report | Update alt strings and verify via `pnpm seo:tech` |

## Execution Notes

1. No new component-test framework is introduced in this cycle.
2. P0 entries are tracked as immediate follow-up test tasks when touching the related surface.
3. Until dedicated tests exist, include manual QA checklist in PR descriptions for tab navigation and command correctness.
