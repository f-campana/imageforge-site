import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";

import { resolveSiteUrl } from "@/lib/seo/site-url";

import "./globals.css";

const siteUrl = resolveSiteUrl();

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: "ImageForge CLI | Ship Smaller Images Automatically",
  description:
    "ImageForge CLI is a build-time image pipeline for WebP/AVIF conversion, blurDataURL generation, hash-based caching, and deterministic CI checks.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ImageForge CLI",
    description:
      "Build-time image optimization with WebP/AVIF, blurDataURL placeholders, hash caching, and CI guardrails.",
    type: "website",
    url: "/",
    siteName: "ImageForge CLI",
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "ImageForge CLI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ImageForge CLI",
    description:
      "Ship smaller images automatically with deterministic build-time optimization and CI enforcement.",
    images: ["/twitter-image"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${headingFont.variable} ${monoFont.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
