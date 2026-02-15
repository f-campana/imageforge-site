# Animation Agent Output Contract

Use this contract for all animation audit outputs.

## Format Requirements

1. Always output a single summary block followed by a flat list of findings.
2. Every finding must include all required fields.
3. In cycle 1, set `status` to `advisory` for every finding.
4. Keep IDs stable across reruns when the same underlying issue persists.

## Types

### AnimationFinding

Required fields:

- `id` (`string`): stable identifier, format `anim-<area>-<nnn>`
- `category` (`"entry" | "loop" | "timeline" | "interaction" | "seo" | "a11y" | "performance"`)
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

### AnimationAuditSummary

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
## Animation Audit Summary

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
    "affected_areas": ["entry", "timeline", "a11y"],
    "blocking_recommendations": [],
    "advisory_recommendations": [
      "Reduce hero-adjacent reveal density and preserve immediate CTA readability.",
      "Align JS and CSS reduced-motion handling for all non-essential animations."
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
      "id": "anim-entry-001",
      "category": "entry",
      "severity": "high",
      "confidence": 0.84,
      "viewport": "320-767",
      "files": [
        "/Users/fabiencampana/Documents/imageforge-site/components/landing/MotionWrap.tsx",
        "/Users/fabiencampana/Documents/imageforge-site/app/globals.css"
      ],
      "evidence": "Repeated reveal timing can stack in first-view sections and reduce immediate readability on small screens.",
      "user_impact": "Early comprehension of the value proposition can slow down.",
      "perf_impact": "Potential extra main-thread and paint pressure when many elements animate together.",
      "seo_impact": "Indirect risk if core content appears visually delayed versus static render expectations.",
      "a11y_impact": "Motion intensity can increase discomfort for motion-sensitive users if not fully reduced.",
      "fix_direction": "Limit above-the-fold reveal density and guarantee immediate static readability path.",
      "verification_steps": [
        "Validate first-view readability at 320/360/390 in default motion mode.",
        "Validate reduced-motion mode disables non-essential entry animation."
      ],
      "status": "advisory"
    }
  ]
}
```
