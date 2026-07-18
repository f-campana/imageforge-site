export const DOC_CATALOG = [
  { slug: "getting-started", label: "Getting started" },
  { slug: "nextjs", label: "Next.js" },
  { slug: "static-html", label: "Static HTML" },
  { slug: "ci", label: "CI and GitHub Actions" },
  { slug: "cli-reference", label: "CLI reference" },
  { slug: "configuration", label: "Configuration" },
  { slug: "manifest", label: "Manifest and responsive images" },
  { slug: "troubleshooting", label: "Troubleshooting" },
  { slug: "when-to-use", label: "When to use ImageForge" },
  { slug: "build-time-vs-runtime", label: "Build time vs runtime" },
  { slug: "vercel-image-optimization", label: "Vercel decision guide" },
  { slug: "image-service-comparison", label: "Image service comparison" },
  { slug: "imageforge-and-sharp", label: "ImageForge and Sharp" },
] as const;

export type DocSlug = (typeof DOC_CATALOG)[number]["slug"];

export const DOC_SLUGS = DOC_CATALOG.map((entry) => entry.slug);
