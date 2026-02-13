# Responsive Audit Checklist (Landing, Advisory Cycle 1)

## 1. Preflight

1. Confirm scope:
   - `app/page.tsx`
   - `components/landing/*`
   - `app/globals.css`
2. Load:
   - `docs/responsive-agent/landing-responsive-reference.md`
   - `docs/responsive-agent/landing-responsive-risk-register.md`
   - `references/severity-rubric.md`
   - `references/output-contract.md`
3. Confirm audit mode is advisory-first.

## 2. Baseline Commands

Run in order:

```bash
pnpm lint
pnpm typecheck
NEXT_PUBLIC_SITE_URL=https://example.com pnpm build
NEXT_PUBLIC_SITE_URL=https://example.com pnpm seo:full -- --mode advisory
```

Record pass/fail and notable warnings for the final report.

## 3. Viewport Matrix Checks

Check portrait widths: `320, 360, 375, 390, 412, 768, 1024, 1280, 1440`.

Check landscape where interactions differ: `568x320, 667x375, 812x375`.

For each viewport, verify:

1. No forced 2D page scrolling.
2. Primary CTA discoverability and usability.
3. Nav discoverability.
4. Keyboard reachability/focus visibility.
5. No responsive branch content parity drift.

## 4. Performance Checks

1. Evaluate potential CWV risk for responsive behavior:
   - LCP <= 2.5s target
   - INP <= 200ms target
   - CLS <= 0.1 target
2. Confirm responsive media sizing strategy is coherent with layout slots.
3. Confirm no avoidable layout-shift from breakpoint transitions.
4. Review motion density and paint-heavy effects for mobile constraints.

## 5. Accessibility Checks

1. Reflow at 320 CSS px and 400% zoom without forced 2D scrolling.
2. Touch target minimum guidance applied to primary interactive controls.
3. Full keyboard equivalence for primary interactions.
4. `prefers-reduced-motion` behavior verified in both CSS and JS paths.
5. Coarse pointer/no-hover usability checks.

## 6. SEO Checks

1. Mobile and desktop content parity (claims, links, and meaning).
2. Metadata parity unaffected by responsive presentation.
3. Structured data parity unaffected by viewport/hydration conditions.
4. No critical content hidden behind interaction-only lazy loading.
5. Internal link consistency across responsive branches.

## 7. Hotspot Pass (Repo-Specific)

At minimum, inspect:

- `components/landing/HeaderNav.tsx`
- `components/landing/ComparisonAndCost.tsx`
- `components/landing/TerminalDemo.tsx`
- `components/landing/InstallCommands.tsx`
- `components/landing/CopyButton.tsx`
- `app/globals.css`

## 8. Reporting

1. Produce findings using `ResponsiveFinding` schema.
2. Produce summary using `ResponsiveAuditSummary` schema.
3. Mark all recommendations as advisory in cycle 1.
4. Include verification steps for each finding.

## 9. Exit Criteria

1. Every identified issue has severity + confidence.
2. Every recommendation includes clear verification steps.
3. No recommendation conflicts with current `scripts/seo/*` expectations.
4. Report is formatted exactly per output contract.
