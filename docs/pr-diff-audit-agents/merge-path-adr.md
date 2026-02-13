# Merge Path ADR: PR-Diff Integration for imageforge-site

- Status: Accepted
- Date: 2026-02-13
- Scope: Integration of PR-diff workstreams relative to `main`

## Context

The active branch set includes:

1. `codex/staging-landing-seo-integration` (`0e00d3b`) as the stacked landing + SEO integration path.
2. `codex/a11y-implementation-plan` (`c2dc60d`) as a separate accessibility delta.

`codex/staging-landing-seo-integration` already includes the PR #2 + PR #3 line plus integration commits and is the lowest-churn base for rollout.

## Decision

Use `codex/staging-landing-seo-integration` as the integration base and replay a11y via cherry-pick of `c2dc60d`.

### Integration Branches

1. `codex/site-agent-05-security`
2. `codex/site-agent-03-dx`
3. `codex/site-agent-04-testing`
4. `codex/site-agent-01-claims`
5. `codex/site-agent-06-seo`
6. `codex/site-integrator`

### Merge Order into `codex/site-integrator`

1. `codex/site-agent-05-security`
2. `codex/site-agent-03-dx`
3. `codex/site-agent-04-testing`
4. `codex/site-agent-01-claims`
5. `codex/site-agent-06-seo`

## Rationale

1. Reduces replay/conflict churn compared with replaying PR #2 and PR #3 separately.
2. Preserves clear separation of technical hardening from claims/content calibration.
3. Keeps a11y scope explicit and traceable as a standalone replayed delta.

## Rollback Plan

If integration introduces regressions:

1. Revert the cherry-pick commit (`fix(a11y): improve landing page text contrast and focus visibility`) from `codex/site-integrator`.
2. Re-test baseline on pure `codex/staging-landing-seo-integration`.
3. Re-introduce only required a11y hunks as follow-up patch commits.

## Operational Gates

1. PR CI: `lint`, `typecheck`, `build`, `format`, `seo:test`, advisory `seo:check`.
2. Release verifier: same suite plus strict `seo:check` with `NEXT_PUBLIC_SITE_URL` set.
