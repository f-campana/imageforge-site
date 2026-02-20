# Animation Audit Checklist (Landing + Benchmark, Advisory Cycle 1)

## 1. Preflight

1. Confirm scope:
   - `app/page.tsx`
   - `app/benchmarks/latest/page.tsx`
   - `components/landing/*`
   - `components/benchmark/*`
   - `app/globals.css`
2. Load:
   - `docs/animation-agent/landing-animation-reference.md`
   - `docs/animation-agent/landing-animation-risk-register.md`
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

## 3. Viewport and Motion Matrix Checks

Check portrait widths: `320, 360, 375, 390, 412, 768, 1024, 1280, 1440`.

Check landscape where interactions differ: `568x320, 667x375, 812x375`.

For each viewport, evaluate in both motion modes:

1. Default motion preference.
2. Reduced motion preference (`prefers-reduced-motion: reduce`).

For each matrix cell, verify:

1. Primary headline/body/CTA are readable without waiting for non-essential animation.
2. No forced 2D page scrolling caused by animated surfaces.
3. Animation does not hide or delay meaningful links/content.
4. Keyboard focus remains visible during animated state changes.
5. Reduced-motion behavior disables or minimizes non-essential movement.
6. Route fallback states and data-rich states preserve equivalent animation safety constraints.

## 4. Performance Checks

1. Evaluate potential Core Web Vitals risk from animation behavior:
   - LCP <= 2.5s target
   - INP <= 200ms target
   - CLS <= 0.1 target
2. Confirm animation relies on compositor-friendly properties (`transform`/`opacity`) where possible.
3. Identify layout-affecting animation patterns (`top`, `left`, `width`, `height`, `margin`) and record risk level.
4. Review timeline density (timers/observers/looping effects) for low-end mobile overhead.

## 5. Accessibility Checks

1. Verify `prefers-reduced-motion` handling in both CSS and JS paths.
2. Validate no flashing hazards above WCAG thresholds.
3. Ensure automatically moving content lasting more than 5 seconds can be paused/stopped/hidden where required.
4. Confirm keyboard parity for interactions with animated transitions.
5. Confirm focus indicators are not obscured by motion effects.

## 6. SEO Checks

1. Ensure critical text and links do not require interaction (click/tap/scroll) to become discoverable.
2. Validate lazy-loading patterns use crawlable strategies (IntersectionObserver preferred).
3. Confirm animated variants preserve content parity and intent.
4. Confirm internal links remain crawlable `<a href>` links.
5. Verify animation recommendations do not conflict with current SEO checks under `scripts/seo/*`.

## 7. Hotspot Pass (Repo-Specific)

At minimum, inspect:

- `components/landing/MotionWrap.tsx`
- `components/landing/TerminalDemo.tsx`
- `components/benchmark/BenchmarkPageContent.tsx`
- `hooks/usePrefersReducedMotion.ts`
- `app/globals.css`
- any landing or benchmark component using animation/transition classes

## 8. Reporting

1. Produce findings using `AnimationFinding` schema.
2. Produce summary using `AnimationAuditSummary` schema.
3. Mark all recommendations as advisory in cycle 1.
4. Include verification steps for each finding.

## 9. Exit Criteria

1. Every identified issue has severity and confidence.
2. Every recommendation includes clear validation steps.
3. No recommendation conflicts with existing `scripts/seo/*` expectations.
4. Report is formatted exactly per output contract.
