import type { MetadataRoute } from "next";

import latestBenchmark from "@/data/benchmarks/latest.json";
import { DOC_SLUGS } from "@/lib/docs/catalog";
import { resolveSiteUrl } from "@/lib/seo/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = resolveSiteUrl();

  const contentUpdated = new Date("2026-07-18T00:00:00.000Z");
  const parsedBenchmarkUpdated = new Date(latestBenchmark.generatedAt);
  const benchmarkUpdated = Number.isNaN(parsedBenchmarkUpdated.getTime())
    ? contentUpdated
    : parsedBenchmarkUpdated;

  return [
    {
      url: new URL("/", siteUrl).toString(),
      lastModified: contentUpdated,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: new URL("/benchmarks/latest", siteUrl).toString(),
      lastModified: benchmarkUpdated,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: new URL("/docs", siteUrl).toString(),
      lastModified: contentUpdated,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: new URL("/contact", siteUrl).toString(),
      lastModified: contentUpdated,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...DOC_SLUGS.map((slug) => ({
      url: new URL(`/docs/${slug}`, siteUrl).toString(),
      lastModified: contentUpdated,
      changeFrequency: "monthly" as const,
      priority: 0.65,
    })),
  ];
}
