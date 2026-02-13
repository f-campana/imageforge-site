# Responsive Agent Output Contract

Use this contract for all responsive audit outputs.

## Format Requirements

1. Always output a single summary block followed by a flat list of findings.
2. Every finding must include all required fields.
3. In cycle 1, set `status` to `advisory` for every finding.
4. Keep IDs stable across reruns when the same underlying issue persists.

## Types

### ResponsiveFinding

Required fields:

- `id` (`string`): stable identifier, format `resp-<area>-<nnn>`
- `category` (`"layout" | "interaction" | "media" | "motion" | "seo" | "a11y" | "performance" | "content-parity"`)
- `severity` (`"critical" | "high" | "medium" | "low"`)
- `confidence` (`number`, `0..1`)
- `viewport` (`string`): impacted viewport range(s)
- `files` (`string[]`): absolute or repo-resolvable paths
- `evidence` (`string`): concise, reproducible observation
- `user_impact` (`string`)
- `perf_impact` (`string`)
- `seo_impact` (`string`)
- `a11y_impact` (`string`)
- `fix_direction` (`string`): implementation direction, not full patch
- `verification_steps` (`string[]`)
- `status` (`"advisory" | "proposed-gate" | "gated"`)

### ResponsiveAuditSummary

Required fields:

- `scope` (`string`)
- `mode` (`"advisory" | "strict"`)
- `totals` (`object`): `critical`, `high`, `medium`, `low`, `overall`
- `affected_areas` (`string[]`)
- `blocking_recommendations` (`string[]`)
- `advisory_recommendations` (`string[]`)
- `commands_run` (`string[]`)
- `notes` (`string[]`)

## Markdown Report Shape

```md
## Responsive Audit Summary

- Scope: ...
- Mode: advisory
- Totals: critical=X, high=Y, medium=Z, low=W
- Affected areas: ...
- Commands run: ...

## Findings

1. [SEVERITY] <title> (`id`)

- Category: ...
- Viewport: ...
- Files: ...
- Evidence: ...
- User impact: ...
- Perf impact: ...
- SEO impact: ...
- A11y impact: ...
- Fix direction: ...
- Verification:
  - ...
  - ...
- Status: advisory
```

## JSON Example

```json
{
  "summary": {
    "scope": "landing-focused",
    "mode": "advisory",
    "totals": {
      "critical": 0,
      "high": 1,
      "medium": 2,
      "low": 1,
      "overall": 4
    },
    "affected_areas": ["navigation", "content-parity", "interaction"],
    "blocking_recommendations": [],
    "advisory_recommendations": [
      "Add explicit mobile nav with section-link parity.",
      "Reduce horizontal interaction dependency in command surfaces."
    ],
    "commands_run": [
      "pnpm lint",
      "pnpm typecheck",
      "NEXT_PUBLIC_SITE_URL=https://example.com pnpm build",
      "NEXT_PUBLIC_SITE_URL=https://example.com pnpm seo:full -- --mode advisory"
    ],
    "notes": ["Cycle 1 is advisory-only."]
  },
  "findings": [
    {
      "id": "resp-nav-001",
      "category": "interaction",
      "severity": "high",
      "confidence": 0.86,
      "viewport": "320-767",
      "files": [
        "/Users/fabiencampana/Documents/imageforge-site/components/landing/HeaderNav.tsx"
      ],
      "evidence": "Primary section links are hidden below md with no explicit mobile menu implementation.",
      "user_impact": "Mobile users may miss navigation pathways.",
      "perf_impact": "Neutral direct impact; indirect impact via increased exploratory scrolling.",
      "seo_impact": "Reduced internal-link discoverability consistency on mobile presentation.",
      "a11y_impact": "Potential keyboard/touch discoverability gap.",
      "fix_direction": "Add a mobile navigation pattern with keyboard and touch parity.",
      "verification_steps": [
        "Check 320-412 portrait and 667x375 landscape.",
        "Verify all section links are reachable via keyboard and touch."
      ],
      "status": "advisory"
    }
  ]
}
```
