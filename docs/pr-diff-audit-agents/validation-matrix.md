# PR Diff Validation Matrix (Before vs After)

## Scope

Integration path based on `codex/staging-landing-seo-integration` with a11y delta replay.

## Before

| Gate                                                                        | Enforced in CI | Notes                         |
| --------------------------------------------------------------------------- | -------------- | ----------------------------- |
| `pnpm lint`                                                                 | Yes            | Existing required check       |
| `pnpm typecheck`                                                            | Yes            | Existing required check       |
| `NEXT_PUBLIC_SITE_URL=https://example.com pnpm build`                       | Yes            | Existing required check       |
| `pnpm format`                                                               | No             | Formatting drift can ship     |
| `pnpm seo:test`                                                             | No             | SEO unit regressions can ship |
| `NEXT_PUBLIC_SITE_URL=https://example.com SEO_MODE=advisory pnpm seo:check` | Yes            | Advisory by design            |

## After

| Gate                                                                        | Enforced in CI | Policy                      |
| --------------------------------------------------------------------------- | -------------- | --------------------------- |
| `pnpm lint`                                                                 | Yes            | Blocking                    |
| `pnpm format`                                                               | Yes            | Blocking                    |
| `pnpm typecheck`                                                            | Yes            | Blocking                    |
| `pnpm seo:test`                                                             | Yes            | Blocking                    |
| `NEXT_PUBLIC_SITE_URL=https://example.com pnpm build`                       | Yes            | Blocking                    |
| `NEXT_PUBLIC_SITE_URL=https://example.com SEO_MODE=advisory pnpm seo:check` | Yes            | Advisory output + artifacts |

## Release Verifier Add-on

Release verification must also run:

1. `NEXT_PUBLIC_SITE_URL=https://example.com SEO_MODE=strict pnpm seo:check`

Strict mode blocks only when critical checks fail.

## Residual Risk

1. SEO off-page and GSC checks remain non-blocking by default.
2. Interactive landing surfaces currently rely on lint/type checks plus manual verification until dedicated component/e2e tests are added.
