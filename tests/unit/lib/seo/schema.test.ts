import { describe, expect, it } from "vitest";

import {
  buildHomepageSchemas,
  buildSoftwareApplicationSchema,
  buildWebsiteSchema,
  serializeJsonLd,
} from "@/lib/seo/schema";

describe("SEO schema helpers", () => {
  const siteUrl = new URL("https://imageforge.dev");

  it("builds a website schema with canonical origin", () => {
    const schema = buildWebsiteSchema(siteUrl) as {
      "@type": string;
      url: string;
      name: string;
      inLanguage: string;
    };

    expect(schema["@type"]).toBe("WebSite");
    expect(schema.url).toBe("https://imageforge.dev");
    expect(schema.name).toBe("ImageForge CLI");
    expect(schema.inLanguage).toBe("en-US");
  });

  it("builds a software application schema with zero-cost offer", () => {
    const schema = buildSoftwareApplicationSchema(siteUrl) as {
      "@type": string;
      url: string;
      offers: {
        "@type": string;
        price: string;
        priceCurrency: string;
      };
      sameAs: string[];
    };

    expect(schema["@type"]).toBe("SoftwareApplication");
    expect(schema.url).toBe("https://imageforge.dev");
    expect(schema.offers).toMatchObject({
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    });
    expect(schema.sameAs).toContain("https://github.com/f-campana/imageforge");
    expect(schema.sameAs).toContain(
      "https://www.npmjs.com/package/@imageforge/cli",
    );
  });

  it("returns homepage schema bundle with escaped JSON-LD serialization", () => {
    const schemas = buildHomepageSchemas(siteUrl) as Array<{ "@type": string }>;

    expect(schemas).toHaveLength(2);
    expect(schemas.map((schema) => schema["@type"])).toEqual([
      "WebSite",
      "SoftwareApplication",
    ]);

    const serialized = serializeJsonLd({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "<unsafe>",
    });

    expect(serialized).toContain('"name":"\\u003cunsafe>"');
  });
});
