# Adoption and discoverability measurement contract

This contract defines how ImageForge evaluates whether first-party documentation improves real
discovery and activation. It intentionally avoids invented baselines, vanity-only targets, and CLI
telemetry.

## Decisions this should support

- Which search intent deserves the next first-party guide?
- Where do evaluators fail between a search result, a safe preview, and CI adoption?
- Are messaging changes attracting qualified developers without weakening trust or site quality?

Review monthly until query volume supports a weekly cadence. Do not set numeric growth targets
until at least eight complete weeks of comparable data exist.

## Primary KPIs

### 1. Qualified organic discovery

**Definition:** Google Search Console clicks to first-party docs from non-brand queries aligned with
the product's supported use cases, reported with impressions, click-through rate, and average
position.

**Source:** the existing Search Console adapter configured through `SEO_GSC_*` credentials. Keep
brand queries (`imageforge`, `@imageforge/cli`) separate from category queries such as build-time
image optimization, responsive WebP/AVIF generation, Next.js generated images, and CI image
freshness.

**Decision:** expand or improve a guide only when its query/impression evidence and product fit
agree. A ranking increase without relevant clicks is not sufficient.

### 2. Safe-evaluation activation

**Definition:** the share of consented site sessions that copy or intentionally follow the
dry-run-first command, followed by a visit to a framework or CI guide within the same consented
session.

**Source:** no trustworthy source exists today. Instrument only after selecting a privacy-reviewed
analytics provider and documenting consent, retention, bot filtering, and event semantics. Until
then, do not substitute page views or CTA impressions as successful CLI runs.

**Decision:** use this KPI to compare onboarding copy and navigation, not to claim CLI adoption.

### 3. Verified workflow adoption

**Definition:** successful `imageforge ... --check` execution in a real project after a generated
build, measured only through an explicit opt-in mechanism or a user-controlled CI integration.

**Source:** unavailable by design because the CLI sends no telemetry. npm downloads and GitHub
stars are context, not proof of successful generation or CI activation.

**Decision:** do not add covert CLI telemetry. If future opt-in measurement is proposed, it needs a
separate privacy/security review and a product decision before implementation.

## Drivers

- Indexed canonical guide count with zero broken internal links.
- Search impressions by supported intent cluster and landing route.
- Visits from the docs hub to getting-started, Next.js, and CI guides when a consented web source is
  available.
- Dry-run command copies and package-manager tab selection when a consented event source is
  available.
- Time from first docs visit to CI-guide visit when a consented event source is available.

## Guardrails

- Deterministic SEO checks remain at 100 with no critical/high findings.
- Lighthouse accessibility and SEO remain at or above the repository thresholds.
- Public claims remain versioned and source-backed; no metric justifies unsupported copy.
- No personally identifiable CLI telemetry, source paths, filenames, manifests, or image metadata
  may leave a user's machine.
- Search growth must not come from generic glossary or competitor-farming pages with no direct
  adoption value.

## Baseline procedure

1. Configure the existing Search Console service account with read-only property access.
2. Record eight full weeks using stable route and query-cluster definitions.
3. Separate brand/category queries and new/returning routes where the source allows it.
4. Annotate releases, major copy changes, and indexing changes.
5. Set a provisional target range only after reviewing median weekly levels, variance, seasonality,
   and known bot/data-quality issues.
6. Revisit definitions before comparing periods if routes, consent rules, or data sources change.

## AI-search visibility

Google's current guidance says the same crawlability, people-first content, structured data, and
technical SEO foundations apply to its generative search features. It does not require a special
AI text file or AI-only page format. ImageForge therefore should not add `llms.txt`, duplicate guide
variants, or machine-targeted pages without a distinct user need. Keep each guide answer-first,
technically verifiable, and useful to someone completing a real integration.

When the verified property exposes Search Console's generative-AI performance report, review it
alongside—not merged into—the classic web-search baseline. Record cited-page visibility, visits,
and query themes, but do not infer successful CLI use from a citation or click. Until the existing
adapter exposes that report, preserve a dated manual export and its filters with the monthly review.

References:

- [Google Search: AI features and your website](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- [Google Search Central: generative AI performance reporting](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports)

## External launch actions

These actions require account access, a separate repository, or real-user evidence and are not
safe to simulate in this codebase:

1. Verify the production Search Console property, submit `/sitemap.xml`, and inspect the homepage,
   getting-started, Next.js, CI, comparison, and when-to-use routes after deployment.
2. Review and maintain the existing accurate GitHub topics, and verify the current social-preview
   image through repository settings; keep the repository description, npm description, README
   opening, and homepage category statement consistent.
3. Create a separate minimal starter repository only after its supported package version can pass
   generate and `--check` in CI from a clean clone. Link it from first-party docs once that proof is
   public.
4. Request and document real adoption stories with permission, exact versions, reproducible setup,
   and measurable outcomes. Never convert hypothetical examples into testimonials or case studies.
5. Review query evidence before creating another landing page. A new route needs a distinct user
   task and supported workflow, not merely a keyword variant.

References:

- [Google: build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [GitHub: classify a repository with topics](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/classifying-your-repository-with-topics)
- [GitHub: customize a social media preview](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/customizing-your-repositorys-social-media-preview)

## Known limitations

- Search Console is sampled/aggregated and does not prove downstream product use.
- npm downloads include CI caches, mirrors, bots, and upgrades; treat them as ecosystem reach only.
- GitHub stars and repository traffic are interest signals, not activation.
- Without a consented web event source or opt-in CI signal, safe evaluation and workflow adoption
  remain deliberately unmeasured rather than estimated.
