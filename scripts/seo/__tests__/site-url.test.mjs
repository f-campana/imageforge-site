import assert from "node:assert/strict";
import test from "node:test";

import {
  resolveAuditBaseUrlFromEnv,
  resolveSiteUrlFromEnv,
} from "../config.mjs";

test("resolveSiteUrlFromEnv uses NEXT_PUBLIC_SITE_URL when valid", () => {
  const result = resolveSiteUrlFromEnv({
    NEXT_PUBLIC_SITE_URL: "https://imageforge.dev",
  });

  assert.equal(result.url, "https://imageforge.dev/");
  assert.equal(result.source, "NEXT_PUBLIC_SITE_URL");
  assert.equal(result.error, null);
});

test("resolveSiteUrlFromEnv uses deployment fallback when needed", () => {
  const result = resolveSiteUrlFromEnv({
    VERCEL_URL: "imageforge-site.vercel.app",
  });

  assert.equal(result.url, "https://imageforge-site.vercel.app/");
  assert.equal(result.source, "VERCEL_URL");
});

test("resolveSiteUrlFromEnv continues to SITE_URL when NEXT_PUBLIC_SITE_URL is invalid", () => {
  const result = resolveSiteUrlFromEnv({
    NEXT_PUBLIC_SITE_URL: "not-a-url",
    SITE_URL: "https://imageforge.dev",
  });

  assert.equal(result.url, "https://imageforge.dev/");
  assert.equal(result.source, "SITE_URL");
  assert.equal(result.error, null);
});

test("resolveSiteUrlFromEnv continues to VERCEL_URL when NEXT_PUBLIC_SITE_URL is invalid", () => {
  const result = resolveSiteUrlFromEnv({
    NEXT_PUBLIC_SITE_URL: "not-a-url",
    VERCEL_URL: "imageforge-site.vercel.app",
  });

  assert.equal(result.url, "https://imageforge-site.vercel.app/");
  assert.equal(result.source, "VERCEL_URL");
  assert.equal(result.error, null);
});

test("resolveSiteUrlFromEnv reports highest-priority invalid env when all candidates fail", () => {
  const result = resolveSiteUrlFromEnv({
    NEXT_PUBLIC_SITE_URL: "not-a-url",
    SITE_URL: "also-not-a-url",
    VERCEL_URL: "invalid domain value with spaces",
  });

  assert.equal(result.url, null);
  assert.equal(result.source, "NEXT_PUBLIC_SITE_URL");
  assert.ok(
    result.error?.includes("NEXT_PUBLIC_SITE_URL is present but invalid"),
  );
});

test("resolveSiteUrlFromEnv reports missing URL when no sources exist", () => {
  const result = resolveSiteUrlFromEnv({});

  assert.equal(result.url, null);
  assert.equal(result.source, null);
  assert.ok(result.error?.includes("No canonical site URL found"));
});

test("resolveAuditBaseUrlFromEnv returns null when not configured", () => {
  const result = resolveAuditBaseUrlFromEnv({});
  assert.equal(result, null);
});

test("resolveAuditBaseUrlFromEnv returns normalized absolute URL", () => {
  const result = resolveAuditBaseUrlFromEnv({
    SEO_AUDIT_BASE_URL: "https://imageforge.dev",
  });

  assert.equal(result, "https://imageforge.dev/");
});

test("resolveAuditBaseUrlFromEnv throws when URL is invalid", () => {
  assert.throws(
    () => resolveAuditBaseUrlFromEnv({ SEO_AUDIT_BASE_URL: "not-a-url" }),
    /SEO_AUDIT_BASE_URL is present but invalid/,
  );
});
