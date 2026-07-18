import { describe, expect, it } from "vitest";

import { buildPageMetadata } from "@/lib/seo/metadata";

describe("page metadata helper", () => {
  it("keeps canonical and social URLs specific to the route", () => {
    const metadata = buildPageMetadata({
      title: "Next.js guide | ImageForge CLI",
      description: "Serve pre-generated ImageForge derivatives in Next.js.",
      path: "/docs/nextjs",
    });

    expect(metadata.alternates).toEqual({ canonical: "/docs/nextjs" });
    expect(metadata.openGraph).toMatchObject({
      title: "Next.js guide | ImageForge CLI",
      description: "Serve pre-generated ImageForge derivatives in Next.js.",
      type: "website",
      url: "/docs/nextjs",
      siteName: "ImageForge CLI",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: "Next.js guide | ImageForge CLI — ImageForge CLI",
        },
      ],
    });
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      title: "Next.js guide | ImageForge CLI",
      description: "Serve pre-generated ImageForge derivatives in Next.js.",
      images: [
        {
          url: "/twitter-image",
          alt: "Next.js guide | ImageForge CLI — ImageForge CLI",
        },
      ],
    });
  });
});
