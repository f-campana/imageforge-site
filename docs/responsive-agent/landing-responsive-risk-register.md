# Landing Responsive Risk Register

Date: 2026-02-13
Scope: Landing-focused (`/` and `/components/landing/*`)
Status model: Advisory-only (cycle 1)

## Usage

- This register tracks baseline responsive risks discovered through static analysis before implementation work.
- Every row is advisory in cycle 1, including `critical` severity rows.
- Severity and confidence scoring must follow:
  `/Users/fabiencampana/Documents/imageforge-site/.codex/skills/responsive-agent/references/severity-rubric.md`

## Baseline Issues

| id                     | area                              | viewport_range                   | severity | confidence | evidence                                                                                                                                                                                                                    | impact                                                                                                                 | recommended_direction                                                                                  | validation                                                                                                                                                  |
| ---------------------- | --------------------------------- | -------------------------------- | -------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `resp-nav-001`         | navigation discoverability        | `< md` (`320-767`)               | high     | 0.86       | `/Users/fabiencampana/Documents/imageforge-site/components/landing/HeaderNav.tsx` hides primary section links via `hidden ... md:flex`; no dedicated mobile menu pattern present.                                           | Mobile users may miss key section pathways; reduced internal-link discovery and weaker conversion flow.                | Add explicit mobile navigation pattern that preserves section-link parity and keyboard/touch access.   | Check at 320/360/375/390/412 widths in portrait and landscape; verify all key section links reachable by keyboard and touch without horizontal page scroll. |
| `resp-content-001`     | content parity drift              | split at `md`                    | medium   | 0.88       | `/Users/fabiencampana/Documents/imageforge-site/components/landing/ComparisonAndCost.tsx` renders separate table (`md:block`) and card (`md:hidden`) markup branches.                                                       | Separate branches can diverge in copy, sources, or links over time, creating SEO and trust inconsistency.              | Unify shared content source and enforce parity checks between table/card variants.                     | Compare mobile and desktop rendered text/links/source references for each row; confirm factual parity after updates.                                        |
| `resp-layout-001`      | viewport density                  | `< md` (`320-767`)               | medium   | 0.82       | `/Users/fabiencampana/Documents/imageforge-site/components/landing/TerminalDemo.tsx` uses `min-h-[420px]` and animated line reveal.                                                                                         | Above-the-fold scroll budget can be consumed on smaller screens, delaying access to conversion actions below the hero. | Use adaptive min-height rules and/or condensed mobile rendering while preserving meaning.              | Verify first-scroll experience on 320/360 widths; confirm downstream section discovery without excessive scrolling and without causing CLS.                 |
| `resp-interaction-001` | horizontal interaction dependence | `< md` (`320-767`)               | medium   | 0.84       | `/Users/fabiencampana/Documents/imageforge-site/components/landing/InstallCommands.tsx` and `/Users/fabiencampana/Documents/imageforge-site/components/landing/CodeBlock.tsx` rely on `overflow-x-auto` for key command UI. | Users may need horizontal panning to access controls/content, increasing friction and reducing completion.             | Rework narrow-width layout to minimize horizontal scrolling for critical actions and labels.           | Test command tablist and code surfaces at 320-412 widths; verify primary actions usable without required horizontal panning.                                |
| `resp-a11y-001`        | touch target sizing               | all (height-sensitive on mobile) | medium   | 0.79       | `/Users/fabiencampana/Documents/imageforge-site/components/landing/CopyButton.tsx` sets `h-8` (32px) and compact horizontal padding.                                                                                        | Tap accuracy may degrade depending on spacing context and adjacent controls, especially for coarse pointer input.      | Increase effective target area to align with WCAG 2.2 minimum target-size guidance and verify spacing. | Validate with emulated coarse pointer and real-device tap checks; confirm target dimensions and no overlap/focus ambiguity.                                 |

## Operating Notes

1. Advisory-only behavior means no automatic merge blocking from this register in cycle 1.
2. Fix sequencing should follow:
   1. user-impact blockers
   2. SEO discoverability risks
   3. performance regression risks
3. Convert to hard-gate mode only after one full audit + remediation loop validates metric stability.
