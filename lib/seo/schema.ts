import { IMAGEFORGE_CLI_VERSION } from "@/lib/release";

type StructuredData = Record<string, unknown>;

const PRODUCT_NAME = "ImageForge CLI";
const PRODUCT_DESCRIPTION =
  "Build-time image optimization for Next.js and modern web apps with WebP/AVIF conversion, blurDataURL placeholders, content-hash caching, and CI enforcement.";

export function buildWebsiteSchema(siteUrl: URL): StructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: PRODUCT_NAME,
    alternateName: ["ImageForge", "imageforge.dev"],
    description: PRODUCT_DESCRIPTION,
    url: siteUrl.origin,
    inLanguage: "en-US",
  };
}

export function buildSoftwareApplicationSchema(siteUrl: URL): StructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: PRODUCT_NAME,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Cross-platform",
    description: PRODUCT_DESCRIPTION,
    softwareVersion: IMAGEFORGE_CLI_VERSION,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    url: siteUrl.origin,
    sameAs: [
      "https://github.com/f-campana/imageforge",
      "https://www.npmjs.com/package/@imageforge/cli",
    ],
  };
}

export function buildHomepageSchemas(siteUrl: URL): StructuredData[] {
  return [buildWebsiteSchema(siteUrl), buildSoftwareApplicationSchema(siteUrl)];
}

export function serializeJsonLd(payload: StructuredData): string {
  return JSON.stringify(payload).replace(/</g, "\\u003c");
}
