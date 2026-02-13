import assert from "node:assert/strict";
import test from "node:test";

import { resolveSiteUrlFromEnv } from "../config.mjs";

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
