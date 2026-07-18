import type { Metadata } from "next";

export function buildPageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      type: "website",
      url: path,
      siteName: "ImageForge CLI",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: `${title} — ImageForge CLI`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: "/twitter-image", alt: `${title} — ImageForge CLI` }],
    },
  };
}
