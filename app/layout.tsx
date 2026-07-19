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
  title: "ImageForge CLI | Build-Time Responsive Image Pipeline",
  description:
    "ImageForge CLI pre-generates responsive WebP/AVIF assets, writes imageforge.json, and adds CI freshness checks for Next.js and modern web apps.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ImageForge CLI",
    description:
      "Build-time responsive WebP/AVIF generation, manifest metadata, and CI freshness checks.",
    type: "website",
    url: "/",
    siteName: "ImageForge CLI",
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "ImageForge CLI showing build-time WebP and AVIF generation with CI guardrails",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ImageForge CLI",
    description:
      "Pre-generate responsive images and verify them before deploy.",
    images: [
      {
        url: "/twitter-image",
        alt: "ImageForge CLI build-time responsive image pipeline social card",
      },
    ],
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
        <a
          href="#main-content"
          className="ui-focus-ring fixed top-3 left-3 z-[100] -translate-y-24 rounded-md bg-emerald-300 px-4 py-2 text-sm font-semibold text-black focus:translate-y-0"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
