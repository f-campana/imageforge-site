import type { MetadataRoute } from "next";

import { resolveSiteUrl } from "@/lib/seo/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = resolveSiteUrl();

  return [
    {
      url: new URL("/", siteUrl).toString(),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: new URL("/benchmarks/latest", siteUrl).toString(),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: new URL("/docs", siteUrl).toString(),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: new URL("/contact", siteUrl).toString(),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
