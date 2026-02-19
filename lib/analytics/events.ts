export type AnalyticsPropertyValue =
  | string
  | number
  | boolean
  | null
  | undefined;

export type AnalyticsEventProperties = Record<string, AnalyticsPropertyValue>;

export const ANALYTICS_EVENT_NAMES = {
  heroGetStartedClick: "hero_get_started_click",
  heroReadDocsClick: "hero_read_docs_click",
  installCommandCopied: "install_command_copied",
  installPackageManagerSelected: "install_package_manager_selected",
  headerNavItemClick: "header_nav_item_click",
  headerGithubClick: "header_github_click",
  headerNpmClick: "header_npm_click",
  footerDocsClick: "footer_docs_click",
  footerChangelogClick: "footer_changelog_click",
  footerIssuesClick: "footer_issues_click",
  footerSecurityClick: "footer_security_click",
  footerGithubClick: "footer_github_click",
  footerNpmClick: "footer_npm_click",
  benchmarkBackToLandingClick: "benchmark_back_to_landing_click",
} as const;

export type AnalyticsEventName =
  (typeof ANALYTICS_EVENT_NAMES)[keyof typeof ANALYTICS_EVENT_NAMES];
