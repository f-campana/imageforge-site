# Animation Severity Rubric

Cycle mode: Advisory-first (cycle 1)

This rubric defines how to classify animation findings by severity and confidence.

## Severity Levels

### Critical

Use when any of the following is true:

1. Primary task completion is blocked by animation behavior on common viewports.
2. Hero or core CTA is materially delayed/hidden by entrance choreography.
3. Severe accessibility failure exists (for example, intense motion without reduced-motion fallback, or flash hazard risk).
4. Animation behavior causes major SEO discoverability loss (critical content/links interaction-gated).
5. Animation behavior likely introduces severe CWV regression (major CLS or interaction jank in core flows).

Expected action: first-fix candidate. In cycle 1 this remains advisory, not auto-gating.

### High

Use when there is substantial user impact but not full task blocking:

1. Meaningful friction from repeated loops/timelines in key conversion sections.
2. Strong reduced-motion parity gap with partial fallback only.
3. Likely measurable CWV degradation risk from animation density or paint-heavy effects.
4. Material content-discovery risk caused by animation-tied visibility timing.

Expected action: early-fix priority in first implementation batch.

### Medium

Use when issue is noticeable and recurring but workaround exists:

1. Non-critical animation distracts from readability.
2. Partial reduced-motion coverage in either CSS or JS path.
3. Potential but not clearly severe CWV risk from localized motion patterns.
4. Localized SEO parity risk with mitigations already present.

Expected action: queued after critical/high items.

### Low

Use when issue is minor polish or edge-case behavior:

1. Cosmetic easing/timing inconsistency.
2. Low-probability edge viewport or interaction-state animation artifacts.
3. Minimal measurable user impact expected.

Expected action: backlog and batch with adjacent work.

## Confidence Scoring

Use `0..1` confidence scale:

- `0.90-1.00`: confirmed with direct evidence plus reproducible behavior across relevant viewports and motion modes.
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
4. Issues with stronger reproducibility/confidence first.

## Advisory-First Rule (Cycle 1)

1. All findings must use `status: advisory`.
2. `critical` in cycle 1 means urgent recommendation, not merge blocking.
3. Do not promote to `proposed-gate` or `gated` until explicitly requested.
