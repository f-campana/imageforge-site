import { afterEach, describe, expect, it, vi } from "vitest";

import sitemap from "@/app/sitemap";
import { DOC_SLUGS } from "@/lib/docs/catalog";

describe("sitemap", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("includes every first-party guide with stable content dates", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://imageforge.dev");

    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain("https://imageforge.dev/");
    expect(urls).toContain("https://imageforge.dev/docs");
    expect(urls).toContain("https://imageforge.dev/contact");

    for (const slug of DOC_SLUGS) {
      expect(urls).toContain(`https://imageforge.dev/docs/${slug}`);
    }

    expect(entries).toHaveLength(DOC_SLUGS.length + 4);
    expect(
      Object.fromEntries(
        entries.slice(0, 4).map((entry) => [entry.url, entry.changeFrequency]),
      ),
    ).toEqual({
      "https://imageforge.dev/": "weekly",
      "https://imageforge.dev/benchmarks/latest": "daily",
      "https://imageforge.dev/docs": "weekly",
      "https://imageforge.dev/contact": "monthly",
    });
    expect(
      entries.find((entry) => entry.url.endsWith("/benchmarks/latest"))
        ?.lastModified,
    ).toEqual(new Date("2026-07-10T06:20:38.299Z"));
    for (const entry of entries) {
      expect(entry.lastModified).toBeInstanceOf(Date);
      expect((entry.lastModified as Date).getUTCFullYear()).toBe(2026);
    }
  });
});
