# Security Risk Register (PR-Diff Integration)

- Date: 2026-02-13
- Scope: `codex/staging-landing-seo-integration` integration path and related workflows

## Ranked Risks

| Rank | Risk | Severity | Status | Mitigation | Owner |
|---|---|---|---|---|---|
| 1 | GitHub Actions tag pinning enables mutable supply-chain updates | High | Mitigated | Pin all actions to commit SHAs in CI and weekly SEO workflows | Engineering |
| 2 | Excessive default token privileges in workflows | Medium | Mitigated | Set explicit `permissions: contents: read` | Engineering |
| 3 | Long-running or overlapping scheduled SEO jobs | Medium | Mitigated | Add `timeout-minutes` and workflow `concurrency` guard on weekly job | Engineering |
| 4 | Transitive `qs` DoS advisory via `googleapis-common` | Low | Mitigated | Upgrade `googleapis` and enforce `qs >= 6.14.2` via pnpm override; verify with audit | Engineering |
| 5 | Secrets exposure risk in weekly SEO job logs | Medium | Accepted with controls | Keep secrets in GitHub encrypted secrets and avoid echoing sensitive env values in scripts | Engineering |

## Dependency Remediation Decision

1. Upgrade path attempted first: `googleapis` bumped from `^166.0.0` to `^171.4.0`.
2. Defense-in-depth override applied: `pnpm.overrides.qs = >=6.14.2`.
3. Verification: `pnpm audit --audit-level=low` returned no known vulnerabilities.

## Follow-up Controls

1. Re-run `pnpm audit --audit-level=low` in release verification.
2. Keep workflow action SHAs current via periodic dependency maintenance.
3. Review weekly SEO workflow permission needs quarterly.
