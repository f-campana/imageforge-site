---
name: animation-agent
description: Landing and benchmark-focused animation analysis workflow for ImageForge with advisory-first performance, accessibility, and SEO risk scoring.
---

# Animation Agent

Use this skill when a request mentions micro-animations, animation behavior, motion systems, or animation-related performance/accessibility/SEO tradeoffs.

## Scope

Default scope is landing and benchmark-focused:

- `/Users/fabiencampana/Documents/imageforge-site/app/page.tsx`
- `/Users/fabiencampana/Documents/imageforge-site/app/benchmarks/latest/page.tsx`
- `/Users/fabiencampana/Documents/imageforge-site/components/landing/*`
- `/Users/fabiencampana/Documents/imageforge-site/components/benchmark/*`
- `/Users/fabiencampana/Documents/imageforge-site/app/globals.css`

## Canonical References

1. Audit reference:
   `/Users/fabiencampana/Documents/imageforge-site/docs/animation-agent/landing-animation-reference.md`
2. Current baseline register:
   `/Users/fabiencampana/Documents/imageforge-site/docs/animation-agent/landing-animation-risk-register.md`
3. Checklist:
   `references/checklist.md`
4. Severity rubric:
   `references/severity-rubric.md`
5. Output contract:
   `references/output-contract.md`

## Default Workflow

1. Load the canonical reference, checklist, severity rubric, and output contract.
2. Run baseline command set:
   - `pnpm lint`
   - `pnpm typecheck`
   - `NEXT_PUBLIC_SITE_URL=https://example.com pnpm build`
   - `NEXT_PUBLIC_SITE_URL=https://example.com pnpm seo:full -- --mode advisory`
3. Inspect landing and benchmark files for animation behavior by viewport/motion matrix and anti-pattern catalog.
4. Score each finding with the severity rubric.
5. Output findings strictly using the output contract.
6. Cross-check recommendations against existing SEO pipeline constraints (`scripts/seo/*`) and current product messaging boundaries.

## Constraints

1. Documentation and analysis first.
2. Do not implement code changes unless the user explicitly asks for implementation.
3. In cycle 1, treat all findings as advisory recommendations, even when severity is high or critical.

## Repository Alignment

1. Keep guidance compatible with existing metadata/canonical/schema behavior in `app/layout.tsx`, `app/page.tsx`, and `lib/seo/*`.
2. Preserve ImageForge messaging scope from `README.md` and route-specific copy on landing and benchmark pages.
3. Keep recommendations compatible with existing motion baseline in `hooks/usePrefersReducedMotion.ts`, `components/landing/MotionWrap.tsx`, and `components/landing/TerminalDemo.tsx`.
4. Keep recommendations compatible with benchmark presentation in `components/benchmark/BenchmarkPageContent.tsx`.

## Output Expectations

Every audit response should include:

1. `AnimationAuditSummary`
2. `AnimationFinding[]` entries with explicit viewport impact, evidence, and verification steps
3. Advisory-first recommendation status labels
