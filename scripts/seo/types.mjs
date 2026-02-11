import { z } from "zod";

export const SeoModeSchema = z.enum(["advisory", "strict"]);
export const SeoSuiteSchema = z.enum(["tech", "content", "offpage", "full"]);

export const CheckSeveritySchema = z.enum(["critical", "high", "medium", "low"]);
export const CheckStatusSchema = z.enum(["pass", "fail", "warn", "skip"]);
export const CheckSuiteSchema = z.enum(["technical", "content", "offpage", "gsc"]);

export const SeoCheckSchema = z.object({
  id: z.string().min(1),
  suite: CheckSuiteSchema,
  severity: CheckSeveritySchema,
  status: CheckStatusSchema,
  message: z.string().min(1),
  evidence: z.string().default(""),
  fixHint: z.string().default(""),
  file: z.string().optional(),
});

export const SeoOpportunitySchema = z.object({
  type: z.string().min(1),
  priority: z.enum(["high", "medium", "low"]),
  title: z.string().min(1),
  rationale: z.string().min(1),
  target: z.string().min(1),
});

export const SeoReportSchema = z.object({
  version: z.string().min(1),
  generatedAt: z.string().datetime(),
  mode: SeoModeSchema,
  summary: z.object({
    critical: z.number().int().nonnegative(),
    high: z.number().int().nonnegative(),
    medium: z.number().int().nonnegative(),
    low: z.number().int().nonnegative(),
    score: z.number().int().min(0).max(100),
  }),
  checks: z.array(SeoCheckSchema),
  opportunities: z.array(SeoOpportunitySchema),
  dataSources: z.object({
    public: z.boolean(),
    gsc: z.boolean(),
  }),
});

export function validateReport(report) {
  return SeoReportSchema.parse(report);
}

export function makeCheck(input) {
  return SeoCheckSchema.parse(input);
}

export function makeOpportunity(input) {
  return SeoOpportunitySchema.parse(input);
}
