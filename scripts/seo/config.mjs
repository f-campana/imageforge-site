import path from "node:path";
import { fileURLToPath } from "node:url";

import { z } from "zod";

import { SeoModeSchema, SeoSuiteSchema } from "./types.mjs";

const SiteResolutionSchema = z.object({
  url: z.string().url().nullable(),
  source: z.string().nullable(),
  error: z.string().nullable(),
});

const ArgsSchema = z.object({
  mode: SeoModeSchema.optional(),
  suite: SeoSuiteSchema.optional(),
});

const ConfigSchema = z.object({
  mode: SeoModeSchema,
  suite: SeoSuiteSchema,
  locale: z.string().min(1),
  competitorUrls: z.array(z.string().url()),
  rootDir: z.string().min(1),
  appDir: z.string().min(1),
  componentsDir: z.string().min(1),
  outputDir: z.string().min(1),
  site: SiteResolutionSchema,
  gsc: z.object({
    clientEmail: z.string().trim(),
    privateKey: z.string().trim(),
    propertyUri: z.string().trim(),
  }),
});

function parseCliArgs(argv) {
  const raw = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--mode" && argv[index + 1]) {
      raw.mode = argv[index + 1];
      index += 1;
      continue;
    }

    if (token === "--suite" && argv[index + 1]) {
      raw.suite = argv[index + 1];
      index += 1;
    }
  }

  return ArgsSchema.parse(raw);
}

function parseSiteUrlCandidate(value) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function parseDeploymentCandidate(value) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const withProtocol =
    trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;

  return parseSiteUrlCandidate(withProtocol);
}

export function resolveSiteUrlFromEnv(env = process.env) {
  const invalidCandidates = [];

  const primaryRaw = env.NEXT_PUBLIC_SITE_URL?.trim();
  if (primaryRaw) {
    const primary = parseSiteUrlCandidate(primaryRaw);
    if (primary) {
      return SiteResolutionSchema.parse({
        url: primary.toString(),
        source: "NEXT_PUBLIC_SITE_URL",
        error: null,
      });
    }

    invalidCandidates.push({
      source: "NEXT_PUBLIC_SITE_URL",
      error:
        "NEXT_PUBLIC_SITE_URL is present but invalid. Use an absolute http(s) URL.",
    });
  }

  const secondaryRaw = env.SITE_URL?.trim();
  if (secondaryRaw) {
    const secondary = parseSiteUrlCandidate(secondaryRaw);
    if (secondary) {
      return SiteResolutionSchema.parse({
        url: secondary.toString(),
        source: "SITE_URL",
        error: null,
      });
    }

    invalidCandidates.push({
      source: "SITE_URL",
      error: "SITE_URL is present but invalid. Use an absolute http(s) URL.",
    });
  }

  const deployment =
    parseDeploymentCandidate(env.VERCEL_PROJECT_PRODUCTION_URL) ??
    parseDeploymentCandidate(env.VERCEL_URL);

  if (deployment) {
    return SiteResolutionSchema.parse({
      url: deployment.toString(),
      source: env.VERCEL_PROJECT_PRODUCTION_URL
        ? "VERCEL_PROJECT_PRODUCTION_URL"
        : "VERCEL_URL",
      error: null,
    });
  }

  if (invalidCandidates.length > 0) {
    const highestPriorityInvalid = invalidCandidates[0];
    return SiteResolutionSchema.parse({
      url: null,
      source: highestPriorityInvalid.source,
      error: highestPriorityInvalid.error,
    });
  }

  return SiteResolutionSchema.parse({
    url: null,
    source: null,
    error:
      "No canonical site URL found. Set NEXT_PUBLIC_SITE_URL (preferred) or a deployment URL.",
  });
}

export function loadConfig(argv = process.argv.slice(2), env = process.env) {
  const args = parseCliArgs(argv);
  const mode = args.mode ?? SeoModeSchema.parse(env.SEO_MODE ?? "advisory");
  const suite = args.suite ?? "full";

  const locale = env.SEO_LOCALE?.trim() || "en-US";
  const competitorUrls = (env.SEO_COMPETITOR_URLS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value) => {
      try {
        const parsed = new URL(value);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    });

  const thisFilePath = fileURLToPath(import.meta.url);
  const seoDir = path.dirname(thisFilePath);
  const rootDir = path.resolve(seoDir, "../..");

  return ConfigSchema.parse({
    mode,
    suite,
    locale,
    competitorUrls,
    rootDir,
    appDir: path.join(rootDir, "app"),
    componentsDir: path.join(rootDir, "components"),
    outputDir: path.join(rootDir, ".tmp", "seo"),
    site: resolveSiteUrlFromEnv(env),
    gsc: {
      clientEmail: env.SEO_GSC_CLIENT_EMAIL ?? "",
      privateKey: env.SEO_GSC_PRIVATE_KEY ?? "",
      propertyUri: env.SEO_GSC_PROPERTY_URI ?? "",
    },
  });
}
