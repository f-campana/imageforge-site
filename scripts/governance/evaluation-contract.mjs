import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { z } from "zod";

export const GovernanceCheckSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["pass", "fail", "warn"]),
  severity: z.enum(["critical", "high", "medium", "low"]),
  message: z.string().min(1),
  evidence: z.string().default(""),
});

export const GovernanceEvaluationSchema = z.object({
  version: z.literal("1.0"),
  kind: z.enum(["seo-weekly", "claims-monthly"]),
  periodKey: z.string().min(1),
  generatedAt: z.string().datetime(),
  result: z.enum(["pass", "fail"]),
  blockingFailures: z.number().int().nonnegative(),
  checks: z.array(GovernanceCheckSchema),
  notes: z.array(z.string()),
});

export function validateEvaluation(value) {
  return GovernanceEvaluationSchema.parse(value);
}

export function countBlockingFailures(checks) {
  return checks.filter(
    (check) => check.severity === "critical" && check.status === "fail",
  ).length;
}

export function buildEvaluation({ kind, periodKey, checks, notes = [] }) {
  const blockingFailures = countBlockingFailures(checks);
  const result = blockingFailures === 0 ? "pass" : "fail";

  return validateEvaluation({
    version: "1.0",
    kind,
    periodKey,
    generatedAt: new Date().toISOString(),
    result,
    blockingFailures,
    checks,
    notes,
  });
}

export async function writeEvaluation(filePath, evaluation) {
  const valid = validateEvaluation(evaluation);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(valid, null, 2)}\n`, "utf8");
  return valid;
}
