# Responsive Severity Rubric

Cycle mode: Advisory-first (cycle 1)

This rubric defines how to classify responsive findings by severity and confidence.

## Severity Levels

### Critical

Use when any of the following is true:

1. Primary task completion is blocked for a common mobile viewport.
2. Severe accessibility failure on core interactions (for example, inaccessible primary navigation or CTA paths).
3. Responsive behavior causes major SEO discoverability loss (critical links/content unavailable in mobile presentation).
4. Responsive behavior introduces likely severe CWV regression (for example, persistent major CLS from layout shifts).

Expected action: first-fix candidate. In cycle 1 this remains advisory, not auto-gating.

### High

Use when there is substantial user impact but not full task blocking:

1. Core flows have high friction on common viewport ranges.
2. Material parity drift risk between responsive branches.
3. Likely measurable CWV degradation risk affecting user experience or ranking signals.
4. Significant keyboard/touch usability degradation on important controls.

Expected action: early-fix priority in first implementation batch.

### Medium

Use when issue is noticeable and recurring but workaround exists:

1. Interaction friction on narrow widths.
2. Localized content parity risk.
3. Potential but not clearly severe CWV risk.
4. Target-size/focus/motion concerns with partial mitigation already present.

Expected action: queued after critical/high items.

### Low

Use when issue is minor polish or edge-case behavior:

1. Cosmetic or non-blocking responsive inconsistency.
2. Low-probability edge viewport behavior.
3. Minimal measurable user impact expected.

Expected action: backlog and batch with adjacent work.

## Confidence Scoring

Use `0..1` confidence scale:

- `0.90-1.00`: confirmed with direct evidence plus reproducible behavior across relevant viewports.
- `0.75-0.89`: strong static/dynamic evidence, minor unvalidated assumptions remain.
- `0.50-0.74`: plausible issue with partial evidence, requires validation pass.
- `<0.50`: speculative; do not recommend implementation before validation.

## Impact Axes (Must Be Recorded)

For each finding, explicitly assess:

1. `user_impact`
2. `perf_impact`
3. `seo_impact`
4. `a11y_impact`

A finding can be high/critical even with neutral impact on one axis if overall harm is strong.

## Tie-Break Rules

When two findings share severity, prioritize:

1. Broader viewport impact first.
2. Direct conversion-path impact first.
3. Multi-axis harm (`user + a11y` or `user + seo`) over single-axis harm.

## Advisory-First Rule (Cycle 1)

1. All findings must use `status: advisory`.
2. `critical` in cycle 1 means urgent recommendation, not merge blocking.
3. Do not promote to `proposed-gate` or `gated` until explicitly requested.
