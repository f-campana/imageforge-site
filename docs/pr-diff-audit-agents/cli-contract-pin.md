# CLI Contract Pin (Cross-Repo Handshake)

- Status: Pinned
- Last updated: 2026-02-13

## Source of Truth

Target contract file:

`/Users/fabiencampana/Documents/ImageForge/docs/product/responsive-widths-contract.md`

## Pin Record

- ImageForge commit SHA: `022957c640615c3abb45d1a7e3fb4cba961be558`
- Contract file exists at pinned SHA: `yes`
- Reviewed by: `f-campana`

## Invariants to Mirror on Site Claims

1. Requested widths are targets; generated widths are effective outputs.
2. No upscaling beyond source width.
3. Width-set count is bounded (expected cap: 16 when enabled in the finalized CLI contract).

## Unblock Criteria

1. ImageForge Wave 2 gate passes (`pnpm run check && pnpm run test:e2e`).
2. Contract file exists on the chosen ImageForge commit.
3. This document is updated with the exact commit SHA and reviewer.
