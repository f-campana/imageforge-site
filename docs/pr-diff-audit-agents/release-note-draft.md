# Release Note Draft (Site Integration)

## Draft

This update stabilizes the ImageForge landing and SEO integration stack with stronger CI guardrails and clearer claim governance. CI now enforces formatting and SEO unit tests, workflows are hardened with pinned GitHub Action SHAs and explicit permissions, and weekly SEO automation has timeout/concurrency controls. Product claims now include ownership metadata for time-sensitive pricing references, and responsive-width messaging is explicitly tied to a pinned CLI contract handshake before final claim publication.

## Follow-up Before Publish

1. Replace `PENDING_IMAGEFORGE_WAVE2_SHA` in `cli-contract-pin.md`.
2. Confirm responsive-width contract file exists at pinned commit.
3. Re-run strict SEO release verifier and attach report artifacts.
