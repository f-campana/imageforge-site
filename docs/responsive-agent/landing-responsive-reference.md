# Landing Responsive Reference

Date: 2026-02-13
Scope mode: Landing-focused
Enforcement mode: Advisory-first (cycle 1)

## Purpose

Define where and how responsive behavior should be applied on the ImageForge landing page, and how to assess responsive risks across performance, accessibility, and SEO before implementation.

This document is the canonical reference for future responsive audits and implementation planning.

## Scope and Intent

In scope:

- `/Users/fabiencampana/Documents/imageforge-site/app/page.tsx`
- `/Users/fabiencampana/Documents/imageforge-site/components/landing/*`
- `/Users/fabiencampana/Documents/imageforge-site/app/globals.css`

Out of scope for cycle 1:

- Non-landing routes
- Runtime production telemetry changes
- Code implementation changes

## Responsive Usage Model

Responsive behavior must be evaluated in five dimensions, not just CSS breakpoints.

1. Layout responsiveness

- Reflow and spacing should adapt without horizontal page scrolling at narrow widths.
- Primary reading and CTA order should remain stable across viewport sizes.

2. Interaction responsiveness

- Navigation and action controls should remain discoverable and usable across pointer types and viewport changes.
- Keyboard access and focus visibility must remain equivalent to pointer access.

3. Media responsiveness

- Images and media should size and load appropriately for viewport width and DPR.
- Aspect ratio and reserved space should prevent layout shifts.

4. Motion responsiveness

- Motion should scale down for constrained devices and respect reduced motion preference.
- Animation should not delay access to primary content or CTA actions.

5. Content parity responsiveness

- Mobile and desktop experiences must keep equivalent meaning, core content, links, metadata, and structured data.
- Responsive variants may change presentation, not factual coverage.

## Viewport Matrix (Required During Audit)

Use these CSS viewport widths in portrait by default:

- 320
- 360
- 375
- 390
- 412
- 768
- 1024
- 1280
- 1440

Landscape checks are required where interaction patterns differ:

- 568x320
- 667x375
- 812x375

For each viewport, verify:

- No unexpected 2D page scroll
- CTA visibility/discoverability
- Nav discoverability
- Keyboard focus visibility
- No content loss from `hidden`/alternate markup branches

## Performance Guardrails (Advisory, Cycle 1)

Target thresholds:

- LCP <= 2.5s
- INP <= 200ms
- CLS <= 0.1

Responsive performance rules:

1. Above-the-fold responsiveness

- Do not delay hero headline/body/primary CTA visibility behind JS-only behavior.

2. Responsive media delivery

- Ensure rendered image slot sizes align with responsive source selection.
- Prefer explicit responsive sizing semantics for image components.

3. Layout shift prevention

- Reserve media and dynamic block space so breakpoint transitions do not introduce avoidable CLS.

4. Motion and paint cost

- Avoid heavy large-area effects that increase paint cost on low-end mobile GPUs.
- Keep reveal animations sparse and disabled/reduced under reduced-motion preference.

5. Main-thread pressure

- Avoid large numbers of concurrent observers/timers that scale poorly on small devices.

## Accessibility Guardrails

1. Reflow and zoom

- Meet WCAG reflow expectations at 320 CSS px and 400% zoom without forced 2D page scrolling.

2. Touch target minimums

- Interactive targets should satisfy WCAG 2.2 target size guidance (minimum 24x24 CSS px).

3. Keyboard and focus parity

- Every primary action available by pointer must be reachable by keyboard.
- Focus indicators must remain visible at all breakpoints.

4. Reduced motion

- Honor `prefers-reduced-motion` in CSS and JS behavior.
- Disable non-essential animation and cursor effects for reduced-motion users.

5. Pointer modality checks

- Validate usability for coarse pointers and no-hover environments.

## SEO Guardrails Under Responsive Behavior

1. Mobile/desktop content parity

- Ensure mobile variants preserve equivalent copy intent and internal links.
- Avoid maintaining materially different claim content between breakpoint-specific branches.

2. Metadata parity

- Responsive presentation must not alter canonical, title/description, Open Graph, Twitter, robots, or sitemap behavior.

3. Structured data parity

- JSON-LD emitted for homepage must remain independent of viewport or hydration-only conditions.

4. Crawlable lazy loading

- Critical content and links must not require user interaction (click/tap/swipe) to become discoverable.

5. Internal link consistency

- Breakpoint-specific nav variants must retain stable crawlable anchor/link pathways.

## Responsive Anti-Pattern Catalog

1. Hidden critical nav on mobile

- Symptom: desktop nav items removed without a usable mobile replacement.
- Risk: discoverability loss, crawl path reduction, weaker engagement.

2. Duplicated markup drift

- Symptom: separate mobile and desktop structures drift in copy, sources, links, or factual claims.
- Risk: inconsistent messaging, maintenance risk, SEO parity regressions.

3. Fixed-height dense blocks on small screens

- Symptom: min-height or fixed-height sections consume disproportionate viewport real estate.
- Risk: increased scroll fatigue, delayed access to key conversion actions.

4. Horizontal scroll reliance for critical interactions

- Symptom: essential controls/content require horizontal scrolling in narrow viewports.
- Risk: poor usability, lower completion rates, accessibility friction.

5. Viewport misconfiguration

- Symptom: missing or overridden viewport behavior causing incorrect scaling.
- Risk: rendering and usability regressions on mobile; reflow failures.

## Repo Hotspot Map (Current Evidence)

1. `/Users/fabiencampana/Documents/imageforge-site/components/landing/HeaderNav.tsx`

- Evidence: desktop nav group is hidden on smaller breakpoints (`hidden ... md:flex`) with no explicit mobile menu component.
- Risk theme: mobile navigation discoverability and internal-link parity.

2. `/Users/fabiencampana/Documents/imageforge-site/components/landing/ComparisonAndCost.tsx`

- Evidence: desktop table branch (`hidden ... md:block`) and separate mobile card branch (`md:hidden`).
- Risk theme: duplicated markup drift between responsive variants.

3. `/Users/fabiencampana/Documents/imageforge-site/components/landing/TerminalDemo.tsx`

- Evidence: `min-h-[420px]` plus animated incremental content.
- Risk theme: small-screen content density and delayed access to downstream sections.

4. `/Users/fabiencampana/Documents/imageforge-site/components/landing/InstallCommands.tsx`

- Evidence: tablist and command surfaces use `overflow-x-auto`.
- Risk theme: horizontal interaction dependence in narrow viewports.

5. `/Users/fabiencampana/Documents/imageforge-site/components/landing/CopyButton.tsx`

- Evidence: button uses `h-8` (32 CSS px height).
- Risk theme: touch target minimum risk if effective tap area remains below recommended minimum dimensions with spacing context.

6. `/Users/fabiencampana/Documents/imageforge-site/app/globals.css`

- Evidence: global layers/gradients/animations and terminal cursor animation handling.
- Risk theme: paint cost, motion adaptation, and global responsive side effects.

## Standard Audit Command Set

Use this command sequence during future responsive assessments:

```bash
pnpm lint
pnpm typecheck
NEXT_PUBLIC_SITE_URL=https://example.com pnpm build
NEXT_PUBLIC_SITE_URL=https://example.com pnpm seo:full -- --mode advisory
```

## Prioritization Rules for Implementation

Apply this order when selecting what to fix first:

1. User-impact blockers

- Broken or degraded task completion at common mobile widths
- Severe discoverability or interaction failures

2. SEO discoverability risks

- Crawl path/content parity issues tied to responsive branches
- Hidden links/content in mobile variants

3. Performance regressions

- CWV risk from responsive media/layout/motion behavior

Tie-breakers:

1. Prefer fixes that reduce duplicated markup branches.
2. Prefer fixes that improve both accessibility and SEO parity simultaneously.
3. Prefer low-regression changes that do not alter core product messaging.

## Assumptions and Defaults

- Advisory-first scoring for the first responsive audit cycle.
- Landing-focused scope only.
- No code implementation changes in this research phase.
- Responsive-width semantics remain anchored to:
  `/Users/fabiencampana/Documents/ImageForge/docs/product/responsive-widths-contract.md`

## Sources

1. [Google Search Central: Mobile-first indexing best practices](https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-first-indexing)
2. [Google Search Central: Fix lazy-loaded content issues](https://developers.google.com/search/docs/crawling-indexing/javascript/lazy-loading)
3. [web.dev: Responsive web design basics](https://web.dev/articles/responsive-web-design-basics)
4. [web.dev: Core Web Vitals](https://web.dev/articles/cwv)
5. [MDN: Responsive images](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images)
6. [MDN: HTML `sizes` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images)
7. [MDN: `viewport` meta element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/viewport)
8. [MDN: `prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
9. [MDN: `@media (pointer)`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/pointer)
10. [W3C WCAG 2.2 Understanding: Reflow (1.4.10)](https://www.w3.org/WAI/WCAG22/Understanding/reflow)
11. [W3C WCAG 2.2 Understanding: Target Size (Minimum) (2.5.8)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)
12. [Next.js: Image component](https://nextjs.org/docs/pages/api-reference/components/image)
13. [Next.js: generateViewport (default viewport behavior)](https://nextjs.org/docs/app/api-reference/functions/generate-viewport)

## Interpretation Notes

Some prioritization and ranking guidance in this document are engineering inferences derived from the linked primary sources and current repository constraints; they are not direct normative text from a single standard.
