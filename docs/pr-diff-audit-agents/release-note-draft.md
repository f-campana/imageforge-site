# Release Note Draft (Site Integration)

## Draft

This update stabilizes the ImageForge landing and SEO integration stack with stronger CI guardrails and clearer claim governance. CI now enforces formatting and SEO unit tests, workflows are hardened with pinned GitHub Action SHAs and explicit permissions, and weekly SEO automation has timeout/concurrency controls. Product claims now include ownership metadata for time-sensitive pricing references, and responsive-width messaging is explicitly tied to a pinned CLI contract handshake before final claim publication.

## Post-release Verification Checklist

1. Confirm npm serves `@imageforge/cli@0.1.6`.
2. Confirm `cli-contract-pin.md` remains pinned to `022957c640615c3abb45d1a7e3fb4cba961be558` until the next contract change.
3. Re-run strict SEO release verifier and attach report artifacts.
4. Confirm production env has `NEXT_PUBLIC_IMAGEFORGE_VERSION=0.1.6`.
