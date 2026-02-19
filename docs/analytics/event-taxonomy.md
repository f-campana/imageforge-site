# Analytics Event Taxonomy (Planned)

This document defines the initial custom event taxonomy for the landing site.
All events below are **planned** and are **not emitted in phase 1**.

## Status

- Tracking in production today: pageviews only (Vercel Web Analytics).
- Custom events: gated by `NEXT_PUBLIC_ANALYTICS_CUSTOM_EVENTS=1`.
- Default gate value: `0` (disabled).
- Owner browser opt-out: visit with `?analytics=off` once to stop counting
  traffic in that browser. Re-enable with `?analytics=on`.

## Event contract

- Event name type source: `lib/analytics/events.ts`
- Tracking helper: `lib/analytics/track-event.ts`
- Property values: `string | number | boolean | null | undefined`

## Planned events

| Event name                         | Status  | Planned properties                                                                                           |
| ---------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------ |
| `hero_get_started_click`           | planned | `target` (`"npm"`), `section` (`"hero"`), `href`                                                             |
| `hero_read_docs_click`             | planned | `target` (`"github"`), `section` (`"hero"`), `href`                                                          |
| `install_command_copied`           | planned | `packageManager`, `commandType` (`"install"` \| `"run_once"`), `surface` (`"hero"` \| `"footer"`), `success` |
| `install_package_manager_selected` | planned | `packageManager`, `surface` (`"hero"` \| `"footer"`), `previousPackageManager`                               |
| `header_nav_item_click`            | planned | `label`, `href`, `section` (`"header"`), `isExternal`                                                        |
| `header_github_click`              | planned | `section` (`"header"`), `href`                                                                               |
| `header_npm_click`                 | planned | `section` (`"header"`), `href`                                                                               |
| `footer_docs_click`                | planned | `section` (`"footer"`), `href`                                                                               |
| `footer_changelog_click`           | planned | `section` (`"footer"`), `href`                                                                               |
| `footer_issues_click`              | planned | `section` (`"footer"`), `href`                                                                               |
| `footer_security_click`            | planned | `section` (`"footer"`), `href`                                                                               |
| `footer_github_click`              | planned | `section` (`"footer"`), `href`                                                                               |
| `footer_npm_click`                 | planned | `section` (`"footer"`), `href`                                                                               |
| `benchmark_back_to_landing_click`  | planned | `section` (`"benchmark_header"`), `href`                                                                     |

## Future instrumentation targets

- `/Users/fabiencampana/Documents/imageforge-site/components/landing/Hero.tsx`
- `/Users/fabiencampana/Documents/imageforge-site/components/landing/CopyButton.tsx`
- `/Users/fabiencampana/Documents/imageforge-site/components/landing/InstallCommands.tsx`
- `/Users/fabiencampana/Documents/imageforge-site/components/landing/HeaderNav.tsx`
- `/Users/fabiencampana/Documents/imageforge-site/components/landing/FinalCtaFooter.tsx`
- `/Users/fabiencampana/Documents/imageforge-site/app/benchmarks/latest/page.tsx`
