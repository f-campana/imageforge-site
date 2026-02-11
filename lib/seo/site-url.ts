const DEFAULT_LOCAL_URL = "http://localhost:3000";

type ResolveSiteUrlOptions = {
  strict?: boolean;
  fallbackUrl?: string | URL;
};

function parseAbsoluteHttpUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

function parseDeploymentUrl(value: string | undefined): URL | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return parseAbsoluteHttpUrl(trimmed);
  }

  return parseAbsoluteHttpUrl(`https://${trimmed}`);
}

export function resolveSiteUrl(options: ResolveSiteUrlOptions = {}): URL {
  const strict = options.strict ?? false;

  const candidates: Array<{ label: string; value: string | undefined }> = [
    { label: "NEXT_PUBLIC_SITE_URL", value: process.env.NEXT_PUBLIC_SITE_URL },
    { label: "SITE_URL", value: process.env.SITE_URL },
  ];

  for (const candidate of candidates) {
    if (!candidate.value) {
      continue;
    }

    const parsed = parseAbsoluteHttpUrl(candidate.value.trim());
    if (parsed) {
      return parsed;
    }

    if (strict) {
      throw new Error(
        `Invalid ${candidate.label}: expected an absolute http(s) URL, received \"${candidate.value}\".`,
      );
    }
  }

  const deploymentUrl =
    parseDeploymentUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    parseDeploymentUrl(process.env.VERCEL_URL);

  if (deploymentUrl) {
    return deploymentUrl;
  }

  if (options.fallbackUrl) {
    const fallback =
      typeof options.fallbackUrl === "string"
        ? parseAbsoluteHttpUrl(options.fallbackUrl)
        : options.fallbackUrl;

    if (fallback) {
      return fallback;
    }

    if (strict) {
      throw new Error(
        `Invalid fallbackUrl: expected an absolute http(s) URL, received \"${String(options.fallbackUrl)}\".`,
      );
    }
  }

  if (strict) {
    throw new Error(
      "Unable to resolve site URL. Set NEXT_PUBLIC_SITE_URL (preferred) or provide a deployment URL (VERCEL_PROJECT_PRODUCTION_URL / VERCEL_URL).",
    );
  }

  if (process.env.NODE_ENV === "development") {
    return new URL(DEFAULT_LOCAL_URL);
  }

  throw new Error(
    "Unable to resolve site URL in non-development mode. Set NEXT_PUBLIC_SITE_URL (preferred) or provide a deployment URL (VERCEL_PROJECT_PRODUCTION_URL / VERCEL_URL).",
  );
}

export function resolveSiteUrlString(options: ResolveSiteUrlOptions = {}): string {
  return resolveSiteUrl(options).toString();
}
