---
name: responsive-agent
description: Landing-focused responsive analysis workflow for ImageForge with advisory-first performance, accessibility, and SEO risk scoring.
---

# Responsive Agent

Use this skill when a request mentions responsive analysis, viewport regressions, mobile behavior, or responsive performance/accessibility/SEO tradeoffs.

## Scope

Default scope is landing-focused:

- `/Users/fabiencampana/Documents/imageforge-site/app/page.tsx`
- `/Users/fabiencampana/Documents/imageforge-site/components/landing/*`
- `/Users/fabiencampana/Documents/imageforge-site/app/globals.css`

## Canonical References

1. Audit reference:
   `/Users/fabiencampana/Documents/imageforge-site/docs/responsive-agent/landing-responsive-reference.md`
2. Current baseline register:
   `/Users/fabiencampana/Documents/imageforge-site/docs/responsive-agent/landing-responsive-risk-register.md`
3. Checklist:
   `references/checklist.md`
4. Severity rubric:
   `references/severity-rubric.md`
5. Output contract:
   `references/output-contract.md`

## Default Workflow

1. Load the canonical reference and checklist.
2. Run baseline command set:
   - `pnpm lint`
   - `pnpm typecheck`
   - `NEXT_PUBLIC_SITE_URL=https://example.com pnpm build`
   - `NEXT_PUBLIC_SITE_URL=https://example.com pnpm seo:full -- --mode advisory`
3. Inspect landing files for responsive behavior by viewport matrix and anti-pattern catalog.
4. Score each finding with the severity rubric.
5. Output findings strictly using the output contract.
6. Cross-check recommendations against existing SEO pipeline constraints (`scripts/seo/*`) and current product messaging boundaries.

## Constraints

1. Documentation and analysis first.
2. Do not implement code changes unless the user explicitly asks for implementation.
3. In cycle 1, treat all findings as advisory recommendations, even when severity is high/critical.

## Repository Alignment

1. Keep guidance compatible with existing metadata/canonical/schema behavior in `app/layout.tsx`, `app/page.tsx`, `lib/seo/*`.
2. Preserve ImageForge messaging scope from `README.md` and landing component copy.
3. Keep responsive-width semantics aligned with:
   `/Users/fabiencampana/Documents/ImageForge/docs/product/responsive-widths-contract.md`

## Output Expectations

Every audit response should include:

1. `ResponsiveAuditSummary`
2. `ResponsiveFinding[]` entries with explicit viewport impact, evidence, and verification steps
3. Advisory-first recommendation status labels
