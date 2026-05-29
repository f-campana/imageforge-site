import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { resolveSiteUrl } from "@/lib/seo/site-url";

const ENV_KEYS = [
  "CI",
  "GITHUB_ACTIONS",
  "NEXT_PUBLIC_SITE_URL",
  "NODE_ENV",
  "SITE_URL",
  "VERCEL",
  "VERCEL_PROJECT_PRODUCTION_URL",
  "VERCEL_URL",
] as const;

type EnvKey = (typeof ENV_KEYS)[number];

const originalEnv = new Map<EnvKey, string | undefined>();

function setNodeEnv(value: string): void {
  setEnv("NODE_ENV", value);
}

function setEnv(key: EnvKey, value: string): void {
  Reflect.set(process.env, key, value);
}

function deleteEnv(key: EnvKey): void {
  Reflect.deleteProperty(process.env, key);
}

describe("resolveSiteUrl", () => {
  beforeEach(() => {
    originalEnv.clear();
    for (const key of ENV_KEYS) {
      originalEnv.set(key, process.env[key]);
      deleteEnv(key);
    }
  });

  afterEach(() => {
    for (const key of ENV_KEYS) {
      const value = originalEnv.get(key);
      if (value === undefined) {
        deleteEnv(key);
      } else {
        setEnv(key, value);
      }
    }
  });

  it("uses NEXT_PUBLIC_SITE_URL when configured", () => {
    setEnv("NEXT_PUBLIC_SITE_URL", "https://imageforge.dev");
    setNodeEnv("production");

    expect(resolveSiteUrl().toString()).toBe("https://imageforge.dev/");
  });

  it("falls back to localhost for local non-CI production checks", () => {
    setNodeEnv("production");

    expect(resolveSiteUrl().toString()).toBe("http://localhost:3000/");
  });

  it("keeps CI production checks strict when no URL is configured", () => {
    setEnv("CI", "true");
    setNodeEnv("production");

    expect(() => resolveSiteUrl()).toThrow(/Unable to resolve site URL/u);
  });

  it("keeps Vercel production checks strict when no URL is configured", () => {
    setEnv("VERCEL", "1");
    setNodeEnv("production");

    expect(() => resolveSiteUrl()).toThrow(/Unable to resolve site URL/u);
  });
});
