import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";

import "./globals.css";

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
  title: "ImageForge CLI | Build-Time Image Optimization, Zero Monthly Cost",
  description:
    "ImageForge CLI pre-generates WebP/AVIF assets, writes imageforge.json, and adds --check CI enforcement so teams ship optimized images with zero recurring runtime cost.",
  openGraph: {
    title: "ImageForge CLI",
    description:
      "Build-time image optimization with WebP/AVIF, CI guardrails, and zero recurring runtime image optimization cost.",
    type: "website",
    siteName: "ImageForge CLI",
  },
  twitter: {
    card: "summary",
    title: "ImageForge CLI",
    description:
      "Optimize once, deploy everywhere, and keep recurring image optimization costs at zero.",
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
