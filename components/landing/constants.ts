export type TerminalLine = {
  text: string;
  tone: string;
  delayMs: number;
};

export type FeatureItem = {
  title: string;
  description: string;
  flag: string;
};

export type StepItem = {
  number: "1" | "2" | "3";
  title: string;
  description: string;
  code: string;
  language: "bash" | "json";
};

export type StatItem = {
  label: string;
  value: string;
  subtext: string;
  accent?: boolean;
};

export const IMAGEFORGE_VERSION =
  process.env.NEXT_PUBLIC_IMAGEFORGE_VERSION ?? "local-dev";

export const EXAMPLE_TIMESTAMP = "2026-02-11T09:30:00.000Z";

export const TERMINAL_LINES: TerminalLine[] = [
  {
    text: "$ imageforge ./public/images -f webp,avif",
    tone: "terminal-command",
    delayMs: 0,
  },
  { text: "", tone: "terminal-muted", delayMs: 220 },
  {
    text: `imageforge v${IMAGEFORGE_VERSION}`,
    tone: "terminal-muted",
    delayMs: 340,
  },
  {
    text: `Run started at (example): ${EXAMPLE_TIMESTAMP}`,
    tone: "terminal-muted",
    delayMs: 500,
  },
  {
    text: "Build-time optimization pass for 12 files",
    tone: "terminal-default",
    delayMs: 680,
  },
  {
    text: "Formats: webp,avif  Blur placeholders: enabled",
    tone: "terminal-dim",
    delayMs: 840,
  },
  {
    text: "Cache: hash-based  Concurrency: 4",
    tone: "terminal-dim",
    delayMs: 980,
  },
  { text: "", tone: "terminal-muted", delayMs: 1120 },
  {
    text: "  [1/12] ok hero.jpg -> hero.webp, hero.avif (345KB -> 98KB)",
    tone: "terminal-default",
    delayMs: 1260,
  },
  {
    text: "  [2/12] ok about.png -> about.webp, about.avif (1.2MB -> 180KB)",
    tone: "terminal-default",
    delayMs: 1460,
  },
  {
    text: "  [3/12] cached logo.png",
    tone: "terminal-muted",
    delayMs: 1640,
  },
  {
    text: "  [4/12] ok team/alice.jpg -> team/alice.webp, team/alice.avif",
    tone: "terminal-default",
    delayMs: 1840,
  },
  {
    text: "  ...",
    tone: "terminal-muted",
    delayMs: 1980,
  },
  {
    text: "  [12/12] ok banner.jpg -> banner.webp, banner.avif",
    tone: "terminal-default",
    delayMs: 2140,
  },
  { text: "", tone: "terminal-muted", delayMs: 2300 },
  {
    text: "──────────────────────────────────────────────────",
    tone: "terminal-muted",
    delayMs: 2360,
  },
  { text: "", tone: "terminal-muted", delayMs: 2420 },
  {
    text: "Done in 2.1s (example)",
    tone: "terminal-strong",
    delayMs: 2500,
  },
  {
    text: "  9 processed, 3 cached",
    tone: "terminal-success",
    delayMs: 2660,
  },
  {
    text: "  Total: 8.4MB -> 1.9MB (-77%)",
    tone: "terminal-success",
    delayMs: 2800,
  },
  {
    text: "  Manifest: imageforge.json",
    tone: "terminal-accent",
    delayMs: 2940,
  },
];

export const FEATURES: FeatureItem[] = [
  {
    title: "WebP + AVIF",
    description:
      "Convert source images to modern formats with deterministic output paths.",
    flag: "-f webp,avif",
  },
  {
    title: "Blur placeholders",
    description:
      "Generate blurDataURL values and dimensions for fast progressive rendering in Next.js.",
    flag: "--blur",
  },
  {
    title: "Hash cache",
    description:
      "Content and options hashing skips unchanged images so reruns stay fast and predictable.",
    flag: "--cache",
  },
  {
    title: "CI guard",
    description:
      "Use --check to exit non-zero when images need processing in CI.",
    flag: "--check",
  },
  {
    title: "Bounded concurrency",
    description:
      "Control parallel processing with --concurrency for stable local and CI resource usage.",
    flag: "--concurrency",
  },
  {
    title: "JSON output",
    description:
      "Use --json to emit a structured run report to stdout for CI logs and automation.",
    flag: "--json",
  },
];

export const HOW_IT_WORKS_STEPS: StepItem[] = [
  {
    number: "1",
    title: "Run",
    description:
      "Point ImageForge at your source directory. It converts files to WebP/AVIF and generates blurDataURL placeholders.",
    code: "imageforge ./public/images -f webp,avif",
    language: "bash",
  },
  {
    number: "2",
    title: "Cache",
    description:
      "Future runs reuse hash-based cache data so only modified images are processed.",
    code: "imageforge ./public/images --concurrency 4\n# example: 3 processed, 47 cached",
    language: "bash",
  },
  {
    number: "3",
    title: "Ship",
    description:
      "Consume imageforge.json in app code for dimensions, format outputs, and placeholders.",
    code: `{
  "generated": "${EXAMPLE_TIMESTAMP}",
  "images": {
    "hero.jpg": {
      "blurDataURL": "data:image/png;base64,iVBOR...",
      "outputs": {
        "webp": { "path": "hero.webp", "size": 98765 },
        "avif": { "path": "hero.avif", "size": 65432 }
      }
    }
  }
}`,
    language: "json",
  },
];

export const STATS: StatItem[] = [
  {
    label: "Input",
    value: "8.4 MB",
    subtext: "12 JPEGs + PNGs",
  },
  { label: "Output", value: "1.9 MB", subtext: "WebP/AVIF derivatives" },
  {
    label: "Saved",
    value: "77%",
    subtext: "smaller on disk",
    accent: true,
  },
  { label: "Time", value: "2.1s", subtext: "example run duration" },
];

export const MANIFEST_EXAMPLE = `{
  "version": "1.0",
  "generated": "${EXAMPLE_TIMESTAMP}",
  "images": {
    "hero.jpg": {
      "width": 1200,
      "height": 800,
      "aspectRatio": 1.5,
      "blurDataURL": "data:image/png;base64,iVBOR...",
      "originalSize": 345678,
      "outputs": {
        "webp": { "path": "hero.webp", "size": 98765 },
        "avif": { "path": "hero.avif", "size": 65432 }
      },
      "hash": "a1b2c3d4e5f67890"
    }
  }
}`;

export const CI_FAIL_EXAMPLE = `$ imageforge ./public/images --check

[1/3] cached logo.png
[2/3] needs processing hero.jpg
[3/3] needs processing new-banner.png

2 image(s) need processing.
Run: imageforge ./public/images -f webp,avif
Exit code: 1`;

export const CI_PASS_EXAMPLE = `$ imageforge ./public/images --check

[1/3] cached logo.png
[2/3] cached hero.jpg
[3/3] cached new-banner.png

All images up to date.
Exit code: 0`;

export const NEXT_INTEGRATION_EXAMPLE = `// lib/imageforge.ts
import manifest from "../imageforge.json";

export function getImageMeta(src: string) {
  return manifest.images[src];
}

// app/page.tsx
import Image from "next/image";
import { getImageMeta } from "@/lib/imageforge";

const hero = getImageMeta("hero.jpg");
const heroSrc = "/images/hero.jpg";

<Image
  src={heroSrc}
  alt="Hero"
  width={hero.width}
  height={hero.height}
  placeholder="blur"
  blurDataURL={hero.blurDataURL}
/>;`;
