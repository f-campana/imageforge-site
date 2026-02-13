# Output Contract

## JSON Artifact

Path: `.tmp/seo/report.json`

Fields:

1. `version: string`
2. `generatedAt: string` (ISO 8601)
3. `mode: "advisory" | "strict"`
4. `summary: { critical, high, medium, low, score }`
5. `checks: Array<{ id, suite, severity, status, message, evidence, fixHint, file? }>`
6. `opportunities: Array<{ type, priority, title, rationale, target }>`
7. `dataSources: { public, gsc }`

## Markdown Artifact

Path: `.tmp/seo/report.md`

Required sections:

1. Executive Summary
2. Blocking Issues
3. Highest-Impact Opportunities
4. File-by-File Remediation Map
5. Data Source Notes
