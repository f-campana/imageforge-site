import type { MetadataRoute } from "next";

import { resolveSiteUrl } from "@/lib/seo/site-url";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = resolveSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteUrl.origin}/sitemap.xml`,
    host: siteUrl.host,
  };
}
