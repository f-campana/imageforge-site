# Landing Animation Risk Register

Date: 2026-02-13
Scope: Landing-focused (`/` and `/components/landing/*`)
Status model: Advisory-only (cycle 1)

## Usage

- This register tracks baseline animation risks discovered through static analysis before implementation work.
- Every row is advisory in cycle 1, including `critical` severity rows.
- Severity and confidence scoring must follow:
  `/Users/fabiencampana/Documents/imageforge-site/.codex/skills/animation-agent/references/severity-rubric.md`

## Baseline Issues

| id | area | severity | confidence | evidence | impact | recommended_direction | validation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `anim-entry-001` | entry sequencing density | high | 0.85 | `/Users/fabiencampana/Documents/imageforge-site/components/landing/MotionWrap.tsx` applies shared delayed `motion-rise` reveal to section content; `/Users/fabiencampana/Documents/imageforge-site/app/globals.css` defines global rise keyframes. | Stacked first-view reveals can reduce immediate readability and slow early CTA comprehension on narrow screens. | Limit above-the-fold reveal density, keep hero copy/CTA immediately readable, and cap concurrent animated elements. | Validate readability and CTA clarity at 320/360/390 widths in default motion mode; confirm no dependency on reveal completion. |
| `anim-loop-001` | infinite loop intensity | medium | 0.83 | `/Users/fabiencampana/Documents/imageforge-site/app/globals.css` defines infinite `terminal-caret` animation used by terminal cursor element. | Persistent motion near demo copy can create distraction and increase discomfort for some users. | Reduce visual prominence of looped cursor and ensure reduced-motion mode fully suppresses non-essential loops. | Verify cursor behavior at mobile and desktop widths; verify cursor hidden/disabled with `prefers-reduced-motion: reduce`. |
| `anim-timeline-001` | timeline complexity and timing | medium | 0.81 | `/Users/fabiencampana/Documents/imageforge-site/components/landing/TerminalDemo.tsx` uses `IntersectionObserver` plus multiple `setTimeout` calls to progressively reveal lines. | Timer-driven timelines can increase interaction complexity and create inconsistent perceived responsiveness on constrained devices. | Simplify reveal timeline, cap timer count, and preserve immediate static fallback for low-motion or low-power contexts. | Validate behavior in viewport matrix and reduced-motion mode; verify no interaction jank while timeline is active. |
| `anim-seo-001` | interaction-gated visibility risk | medium | 0.78 | Terminal content visibility currently changes after in-view trigger and timing progression in `/Users/fabiencampana/Documents/imageforge-site/components/landing/TerminalDemo.tsx`. | If future key claims or links become tied to animated reveal states, discoverability and content parity risk increases. | Keep meaningful SEO-relevant text/links in immediately discoverable markup and treat animation as enhancement only. | Verify critical claims and links are present without requiring scroll-triggered animation progression. |
| `anim-a11y-001` | reduced-motion parity | medium | 0.86 | Reduced-motion handling exists in both `/Users/fabiencampana/Documents/imageforge-site/hooks/usePrefersReducedMotion.ts` and `/Users/fabiencampana/Documents/imageforge-site/app/globals.css`; parity must stay consistent as motion expands. | Divergence between CSS and JS reduced-motion behavior can create inconsistent user experience for motion-sensitive users. | Centralize reduced-motion rules and enforce parity checks for every new animation path (CSS and JS). | Validate all motion paths in both default and reduced modes; confirm non-essential movement is minimized consistently. |

## Operating Notes

1. Advisory-only behavior means no automatic merge blocking from this register in cycle 1.
2. Fix sequencing should follow:
   1. user-impact blockers
   2. accessibility/safety risks
   3. SEO discoverability risks
   4. performance regression risks
3. Convert to hard-gate mode only after one full audit + remediation loop validates metric stability.
