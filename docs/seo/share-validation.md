# Share Validation Playbook

Last updated: February 19, 2026

## Scope

Validate social sharing output for:

- `https://imageforge.dev`
- `https://imageforge.dev/benchmarks/latest`

## Platform Matrix

| Platform | Desktop | Mobile | Primary check                                   |
| -------- | ------- | ------ | ----------------------------------------------- |
| Slack    | Yes     | Yes    | Card title/description and image readability    |
| X        | Yes     | Yes    | Summary large image rendering and text clipping |
| LinkedIn | Yes     | Yes    | Open Graph title/description parity             |
| Facebook | Yes     | Yes    | Open Graph image, title, and URL correctness    |
| Discord  | Yes     | Yes    | Link embed card rendering and image crop        |
| iMessage | N/A     | Yes    | Preview title and image crop behavior           |
| WhatsApp | Web     | Yes    | Preview title/description and image legibility  |

## Expected Metadata Signals

For each tested URL, confirm:

1. `<link rel="canonical">` is present and absolute.
2. `og:url` matches the canonical URL.
3. `og:image` is absolute and fetches with HTTP `200`.
4. `twitter:image` is absolute and fetches with HTTP `200`.
5. Title and description in social previews match route intent.

## Route Expectations

### Homepage (`https://imageforge.dev`)

- Canonical: `https://imageforge.dev`
- `og:url`: `https://imageforge.dev`
- OG image: `https://imageforge.dev/opengraph-image`
- Twitter image: `https://imageforge.dev/twitter-image`

### Benchmark page (`https://imageforge.dev/benchmarks/latest`)

- Canonical: `https://imageforge.dev/benchmarks/latest`
- `og:url`: `https://imageforge.dev/benchmarks/latest`
- OG image: `https://imageforge.dev/benchmarks/latest/opengraph-image`
- Twitter image: `https://imageforge.dev/benchmarks/latest/twitter-image`

## Cache Refresh and Debuggers

Use platform debuggers to force re-scrape when previews are stale:

- Facebook Sharing Debugger: <https://developers.facebook.com/tools/debug/>
- LinkedIn Post Inspector: <https://www.linkedin.com/post-inspector/>
- X Card Validator (availability varies): <https://cards-dev.twitter.com/validator>

For Slack/Discord/iMessage/WhatsApp:

1. Change URL query string only for temporary cache busting in manual checks.
2. Re-post in a new message/thread to avoid stale preview reuse.
3. Confirm preview re-fetch after metadata changes are deployed.

## Validation Checklist

1. Run metadata endpoint checks:
   - `curl -sI https://imageforge.dev/opengraph-image`
   - `curl -sI https://imageforge.dev/twitter-image`
   - `curl -sI https://imageforge.dev/benchmarks/latest/opengraph-image`
   - `curl -sI https://imageforge.dev/benchmarks/latest/twitter-image`
2. Confirm `https://www.imageforge.dev` redirects to apex with valid TLS.
3. Share each URL in Slack and Discord (desktop + mobile) and verify crop-safe readability.
4. Validate each URL in LinkedIn and Facebook inspectors after refresh.
5. Validate X card preview flow for both URLs.
