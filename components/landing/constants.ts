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
    text: "$ imageforge ./public/images -f webp,avif --json",
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
    text: "Done in 2.1s (example)",
    tone: "terminal-strong",
    delayMs: 2440,
  },
  {
    text: "  9 processed, 3 cached",
    tone: "terminal-success",
    delayMs: 2600,
  },
  {
    text: "  Total: 8.4MB -> 1.9MB (-77%)",
    tone: "terminal-success",
    delayMs: 2740,
  },
  {
    text: "  Manifest: imageforge.json",
    tone: "terminal-accent",
    delayMs: 2880,
  },
  {
    text: "  JSON report: stdout (--json)",
    tone: "terminal-accent",
    delayMs: 3040,
  },
];

export const FEATURES: FeatureItem[] = [
  {
    title: "Build-time only",
    description:
      "Runs during development or CI to produce ready-to-ship assets before deploy. No runtime image generation.",
    flag: "imageforge ./public/images",
  },
  {
    title: "WebP + AVIF outputs",
    description:
      "Convert source JPG/PNG assets to modern formats with deterministic output paths.",
    flag: "-f webp,avif",
  },
  {
    title: "blurDataURL placeholders",
    description:
      "Generate tiny blur placeholders and dimensions for fast progressive rendering in Next.js.",
    flag: "--blur",
  },
  {
    title: "Hash-based caching",
    description:
      "Only changed inputs or option changes reprocess. Unchanged files are skipped reliably.",
    flag: "--cache",
  },
  {
    title: "Bounded concurrency",
    description:
      "Control parallel work for local machines and CI runners to avoid resource spikes.",
    flag: "--concurrency 4",
  },
  {
    title: "Deterministic CI guard",
    description:
      "Use --check to fail builds when assets are stale and force reproducible image pipelines.",
    flag: "--check",
  },
  {
    title: "Machine-readable run report",
    description:
      "Use --json to emit a structured report to stdout for CI logs, bots, or dashboards.",
    flag: "--json",
  },
  {
    title: "Manifest by default",
    description:
      "Writes imageforge.json with dimensions, outputs, hashes, and placeholder metadata.",
    flag: "imageforge.json",
  },
];

export const HOW_IT_WORKS_STEPS: StepItem[] = [
  {
    number: "1",
    title: "Run once",
    description:
      "Point ImageForge at your source directory. It converts files to WebP/AVIF and generates blurDataURL placeholders.",
    code: "imageforge ./public/images -f webp,avif",
    language: "bash",
  },
  {
    number: "2",
    title: "Cache intelligently",
    description:
      "Future runs reuse hash-based cache data so only modified images are processed.",
    code: "imageforge ./public/images --concurrency 4\n# example: 3 processed, 47 cached",
    language: "bash",
  },
  {
    number: "3",
    title: "Integrate manifest",
    description:
      "Consume imageforge.json in app code for dimensions, format outputs, and placeholders.",
    code: `{
  "generatedAt": "${EXAMPLE_TIMESTAMP}",
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
    subtext: "12 source images (example run)",
  },
  { label: "Output", value: "1.9 MB", subtext: "WebP + AVIF derivatives" },
  {
    label: "Saved",
    value: "77%",
    subtext: "smaller image payload",
    accent: true,
  },
  { label: "Duration", value: "2.1s", subtext: "example run with warm cache" },
];

export const MANIFEST_EXAMPLE = `{
  "version": "1.0",
  "generatedAt": "${EXAMPLE_TIMESTAMP}",
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

<Image
  src={hero.outputs.webp.path}
  alt="Hero"
  width={hero.width}
  height={hero.height}
  placeholder="blur"
  blurDataURL={hero.blurDataURL}
/>;`;
