# Landing and Benchmark Animation Reference

Date: 2026-02-18
Scope mode: Landing + benchmark-focused
Enforcement mode: Advisory-first (cycle 1 baseline + cycle 2 fixes + cycle 3 reintroduction)

## Purpose

Define where and how animations should be applied on the ImageForge landing and benchmark surfaces, and how to assess animation risks across performance, accessibility, and SEO before implementation work.

This document is the canonical reference for future animation audits and implementation planning.

## Scope and Intent

In scope:

- `/Users/fabiencampana/Documents/imageforge-site/app/page.tsx`
- `/Users/fabiencampana/Documents/imageforge-site/app/benchmarks/latest/page.tsx`
- `/Users/fabiencampana/Documents/imageforge-site/components/landing/*`
- `/Users/fabiencampana/Documents/imageforge-site/components/benchmark/*`
- `/Users/fabiencampana/Documents/imageforge-site/app/globals.css`

Out of scope for cycle 1:

- Non-landing and non-benchmark routes
- Runtime production telemetry changes
- Product code implementation changes

## Cycle 2 Implementation Decisions (2026-02-18)

1. Animation baseline

- `motion` is the active UI animation baseline for landing and benchmark entry transitions.
- Existing CSS and hook-based reduced-motion behavior remains mandatory and is enforced alongside `motion`.

2. Deferred platform API

- `<ViewTransition>` remains deferred in this cycle.
- Revisit once browser/runtime support and framework integration are stable for our route model.

3. React hook policy for motion-adjacent behavior

- `useLayoutEffect` is allowed only for pre-paint layout reads/writes that cannot be deferred to `useEffect`.
- `useTransition` is reserved for non-urgent state updates and must not be used as the animation engine.

4. Reduced-motion and SEO parity

- Reduced-motion parity is required across CSS, JS, and `motion` paths.
- Core claims, CTA paths, and crawlable links must remain visible without interaction-gated animation.

5. Local benchmark fixture policy

- Data-rich benchmark animation validation uses a local fixture switch only:
  - `BENCHMARK_ENABLE_LOCAL_FIXTURE=1`
  - `BENCHMARK_SNAPSHOT_FIXTURE=sample`
- Canonical `data/benchmarks/latest.json` remains unchanged during animation audits and fixes.

## Cycle 3 Reintroduction Decisions (2026-02-18)

1. Top-half reintroduction scope

- Reintroduced motion is limited to top nav + hero only.
- No additional section-entry choreography was added in cycle 3.

2. Trigger model

- Top nav + hero use `load-once` entry behavior (`initial + animate`), not in-view replay.
- Behavior runs once on initial load and does not depend on scroll replay.

3. Motion budget for reintroduction

- top-half max duration: `<= 0.24s`
- top-half max delay: `<= 120ms`
- top-half max translation: `<= 8px`

4. Micro-interaction policy

- Added subtle nav/hero interaction polish only (links, CTAs, install command controls).
- No long staggers, no decorative infinite loops, no layout-affecting animation properties.

## Animation Usage Model

Use motion to improve comprehension, not to decorate by default.

1. Interaction feedback

- Use micro-transitions for button hover/press, tab switching, and copy actions.
- Keep duration short and predictable.

2. Spatial continuity

- Use enter/exit transitions to explain where content came from and where it goes.
- Prioritize transitions in temporary UI (menus, toasts, expandable surfaces).

3. Attention guidance

- Use subtle one-time reveals for section entry and key supporting content.
- Keep hero and primary CTA readable immediately without waiting for animation.

4. Status signaling

- Use motion for loading/progress states when it improves status clarity.
- Avoid aggressive looping indicators near core reading content.

## Animation Avoid and Limit Model

1. Hero-blocking entrance choreography

- Avoid sequencing that delays value proposition copy or CTA visibility.

2. Infinite decorative loops

- Avoid persistent loops that compete with reading or conversion actions.

3. Layout-affecting animation properties

- Avoid animation of `top`, `left`, `width`, `height`, `margin`, or similar layout drivers.

4. Flash and strobe risks

- Avoid high-frequency flashes and strong luminance toggling.

5. Interaction-gated critical content

- Do not require click/tap/scroll to expose key SEO-relevant text or links.

## Performance Guardrails

Target thresholds:

- LCP <= 2.5s
- INP <= 200ms
- CLS <= 0.1

Animation performance rules:

1. Prefer compositor-friendly properties

- Prefer `transform` and `opacity`.

2. Protect first-view rendering

- Do not delay hero headline/body/CTA visibility behind animation logic.

3. Prevent avoidable layout shifts

- Reserve space for animated elements so reveal timing does not move surrounding content.

4. Control animation concurrency

- Limit simultaneous animated elements, especially on narrow/mobile viewports.

5. Limit paint-heavy effects

- Avoid broad-surface blur/shadow/filter animation patterns on constrained devices.

## Accessibility Guardrails

1. Respect reduced-motion preference globally

- Honor `prefers-reduced-motion: reduce` in both CSS and JS behavior paths.

2. Pause/stop/hide for persistent movement

- Automatically moving content lasting more than 5 seconds must provide pause/stop/hide where required.

3. Avoid flash hazards

- Avoid flash frequencies and contrast shifts that could trigger seizure risk.

4. Preserve keyboard parity during motion

- Motion state changes must not break keyboard traversal or focus visibility.

5. Ensure readability during and after transitions

- Animated transitions must not obscure critical text or focus indicators.

## SEO Guardrails Under Animation Behavior

1. Do not depend on user interaction for discoverability

- Critical content and links must be available without user action.

2. Keep lazy loading crawl-friendly

- Use crawlable lazy-loading patterns and avoid interaction-only reveal dependencies.

3. Preserve content parity

- Animated and non-animated states must communicate equivalent core meaning.

4. Keep links crawlable

- Use real `<a href>` links for internal pathways.

5. Protect page experience signals

- Animation updates must not regress page experience-related UX metrics.

## Repo Hotspot Map (Current Evidence)

1. `/Users/fabiencampana/Documents/imageforge-site/components/landing/MotionWrap.tsx`

- Evidence: reusable wrapper now supports `in-view`, `load-once`, and `static` modes with `motion/react`, plus strict reduced-motion fallback.
- Risk theme: reveal density and top-half readability when load-once motion is reintroduced.

2. `/Users/fabiencampana/Documents/imageforge-site/components/landing/TerminalDemo.tsx`

- Evidence: timer-driven line reveal, IntersectionObserver trigger, and animated cursor behavior.
- Risk theme: timeline complexity, progressive visibility timing, and ongoing loop intensity.

3. `/Users/fabiencampana/Documents/imageforge-site/hooks/usePrefersReducedMotion.ts`

- Evidence: JS media query listener controls runtime reduced-motion behavior.
- Risk theme: JS/CSS parity and default-state behavior during initial render.

4. `/Users/fabiencampana/Documents/imageforge-site/app/globals.css`

- Evidence: terminal cursor styling and reduced-motion CSS override block remain active.
- Risk theme: global reduced-motion consistency and loop intensity control.

5. `/Users/fabiencampana/Documents/imageforge-site/components/benchmark/BenchmarkPageContent.tsx`

- Evidence: benchmark route reuses shared `MotionWrap` across headline, cards, chart sections, and tables in data-rich branch.
- Risk theme: shared-motion spillover and potential entrance-density/perf risk when benchmark data is populated.

## Runtime Baseline Notes (Cycle 1 Historical, 2026-02-18)

Evidence collected using production server (`next start`) and automated viewport/motion matrix checks for `/` and `/benchmarks/latest`.

Observed highlights:

1. Reduced-motion parity

- `motion-rise` usage dropped to zero for all reduced-motion checks (`24/24` cells), confirming JS/CSS suppression path is active.

2. Horizontal overflow on narrow landing viewports

- Root-level horizontal scroll occurred at `320x800` and `360x800` (default and reduced modes).
- Benchmark route did not show root-level horizontal scroll in the same matrix.

3. Terminal timeline behavior variability

- Progressive terminal reveal advanced only in the tall desktop portrait case (`1024x1366`) where observer threshold was met on initial load.
- Most viewports remained at preview line count without progression unless additional scrolling occurred.

4. Keyboard focus continuity (sampled matrix)

- Focus remained visible across all sampled cells; benchmark fallback route exposed a reachable “Back to landing” anchor as first tab stop.

## Cycle 3 Verification Notes (2026-02-18)

Evidence collected with the same matrix method used in cycle 2, on both canonical and fixture data modes.

Observed highlights:

1. Safety checks remain healthy

- Root overflow remained `0` for landing and benchmark across the full matrix.
- Reduced-motion media preference matched in `24/24` reduced cells with reduced-mode animated wrapper average `0.00`.

2. Reintroduction effect is measurable

- Landing default wrapper density returned to `49` average cells after top nav + hero load-once reintroduction.
- This increase is expected and remains advisory for tuning in cycle 4.

3. Benchmark behavior remained stable

- Benchmark default wrapper density remained `1.00`.
- Fixture portrait checks (`320-412`) retained mobile-card availability in `10/10` cells.

## Standard Audit Command Set

Use this command sequence during future animation assessments:

```bash
pnpm lint
pnpm typecheck
NEXT_PUBLIC_SITE_URL=https://example.com pnpm build
NEXT_PUBLIC_SITE_URL=https://example.com pnpm seo:full -- --mode advisory
```

## Prioritization Rules for Implementation

Apply this order when selecting what to fix first:

1. User-impact blockers

- Core reading or CTA completion degraded by animation behavior.

2. Accessibility and safety risks

- Reduced-motion parity failures or flash hazards.

3. SEO discoverability risks

- Interaction-gated visibility of meaningful content/links.

4. Performance regression risks

- CWV degradation risk tied to animation timing, paint cost, or layout shifts.

Tie-breakers:

1. Prefer fixes that improve multiple axes (`user + a11y`, `user + seo`, or `user + perf`).
2. Prefer fixes in above-the-fold and conversion-critical areas.
3. Prefer low-regression changes that keep messaging unchanged.

## Assumptions and Defaults

- Advisory-first scoring remains active through cycle 3.
- Landing + benchmark-focused scope remains default.
- Current animation baseline is `motion` + existing CSS/JS reduced-motion controls.
- Cycle-3 reintroduction scope is limited to nav+hero load-once plus subtle micro-interactions.

## Sources

1. [Google Search Central: JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
2. [Google Search Central: Fix lazy-loaded content issues](https://developers.google.com/search/docs/crawling-indexing/javascript/lazy-loading)
3. [Google Search Central: Understanding page experience in Google Search results](https://developers.google.com/search/docs/appearance/page-experience)
4. [web.dev: How to create high-performance CSS animations](https://web.dev/articles/animations-guide)
5. [web.dev: Optimize Cumulative Layout Shift](https://web.dev/articles/optimize-cls)
6. [web.dev: Largest Contentful Paint (LCP)](https://web.dev/articles/lcp)
7. [web.dev: Interaction to Next Paint (INP)](https://web.dev/articles/inp)
8. [MDN: `prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
9. [W3C WCAG 2.2 Understanding: Pause, Stop, Hide (2.2.2)](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)
10. [W3C WCAG 2.2 Understanding: Three Flashes or Below Threshold (2.3.1)](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html)
11. [W3C WCAG 2.2 Understanding: Animation from Interactions (2.3.3)](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)

## Interpretation Notes

Prioritization and implementation direction in this reference are engineering inferences derived from the linked sources and current repository constraints; they are not direct normative text from a single source.
