# Landing Conversion Follow-Up Plan

Date: February 11, 2026
Branch context: `codex/landing-page-improvement-plan`

## Why this follow-up pass
The structural rewrite is complete. The next highest-ROI step is tightening conversion copy in three sections without changing layout architecture.

## Scope: Copy-only conversion pass

### 1) Hero
File: `components/landing/Hero.tsx`

Goals:
- Make the headline more concrete and outcome-led (cost + mechanism).
- Keep the subhead to one clear promise + one proof point.
- Preserve required product terms and technical credibility.

### 2) Comparison
File: `components/landing/ComparisonAndCost.tsx`

Goals:
- Add a short "why switch" summary above the matrix.
- Surface one standout quantified scenario with inline citation.
- Keep the matrix factual and skimmable.

### 3) Final CTA
File: `components/landing/FinalCtaFooter.tsx`

Goals:
- One clear primary action (run now).
- One secondary action (GitHub/docs).
- One trust line (MIT license, local processing, no vendor lock-in).

## Validation approach

Short answer: **yes, we should A/B test before claiming conversion improvement**.

### Recommended validation sequence
1. Instrument baseline events on current copy:
   - hero install copy click
   - hero GitHub click
   - footer install copy click
   - footer GitHub/docs click
2. Run a copy-only variant (no structural/layout changes).
3. A/B test control vs variant with stable traffic split.
4. Evaluate primary and guardrail metrics.

### Primary metrics
- Install-intent CTR (copy command interactions / sessions)
- GitHub/docs CTR (outbound clicks / sessions)

### Guardrails
- Bounce rate
- Scroll depth to comparison and CTA
- Time to first meaningful interaction

### Practical test requirements
- Consistent attribution (same tracking definitions for both variants)
- Sufficient sample size before decision
- Fixed test window (avoid mixing with major marketing launches)

## Decision rule
Promote variant only if:
- Install-intent CTR improves with statistical confidence, and
- No material regression in guardrail metrics.

## Notes for next session
When resuming this work, start with:
1. 2-3 Hero variants
2. 2 Comparison summary variants
3. 2 CTA variants
Then run one controlled A/B experiment with copy-only differences.
