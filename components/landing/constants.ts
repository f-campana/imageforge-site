import {
  BENCHMARK_EVIDENCE,
  formatMegabytes,
  reductionPercent,
} from "@/components/landing/benchmark-evidence";

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

export type ComparisonRow = {
  capability: string;
  imageforge: string;
  vercel: string;
  cloudinary: string;
  imgix: string;
  sourceIds?: string[];
};

export type SourceLink = {
  id: string;
  label: string;
  url: string;
};

export type SegmentCard = {
  title: string;
  profile: string;
  pain: string;
  fit: string;
  command: string;
};

export type LimitationItem = {
  title: string;
  limitation: string;
  mitigation: string;
};

export type NavItem = {
  label: string;
  href: string;
};

export const IMAGEFORGE_VERSION =
  process.env.NEXT_PUBLIC_IMAGEFORGE_VERSION ?? "local-dev";

export const EXAMPLE_TIMESTAMP = "2026-02-11T09:30:00.000Z";
export const PRICING_AS_OF = "February 11, 2026";
export const PRICING_OWNER = "ImageForge Maintainers (Product + Growth)";
const BENCHMARK_INPUT_MB = formatMegabytes(
  BENCHMARK_EVIDENCE.sampleSet.inputBytes,
);
const BENCHMARK_OUTPUT_MB = formatMegabytes(
  BENCHMARK_EVIDENCE.sampleSet.outputBytes,
);
const BENCHMARK_SAVED_PCT = reductionPercent(
  BENCHMARK_EVIDENCE.sampleSet.inputBytes,
  BENCHMARK_EVIDENCE.sampleSet.outputBytes,
);

export const NAV_ITEMS: NavItem[] = [
  { label: "Comparison", href: "#comparison" },
  { label: "Features", href: "#features" },
  { label: "Use cases", href: "#use-cases" },
  { label: "Limitations", href: "#limitations" },
];

export const TERMINAL_LINES: TerminalLine[] = [
  {
    text: `$ ${BENCHMARK_EVIDENCE.run.command}`,
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
    text: `Build-time optimization pass for ${BENCHMARK_EVIDENCE.sampleSet.imageCount.toString()} files`,
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
    text: "--------------------------------------------------",
    tone: "terminal-muted",
    delayMs: 2360,
  },
  { text: "", tone: "terminal-muted", delayMs: 2420 },
  {
    text: `Done in ${BENCHMARK_EVIDENCE.run.durationSeconds.toFixed(1)}s (example)`,
    tone: "terminal-strong",
    delayMs: 2500,
  },
  {
    text: `  ${BENCHMARK_EVIDENCE.run.processed.toString()} processed, ${BENCHMARK_EVIDENCE.run.cached.toString()} cached`,
    tone: "terminal-success",
    delayMs: 2660,
  },
  {
    text: `  Total: ${BENCHMARK_INPUT_MB.replace(" ", "")} -> ${BENCHMARK_OUTPUT_MB.replace(" ", "")} (-${BENCHMARK_SAVED_PCT.toString()}%)`,
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
    title: "Pay once at build time",
    description:
      "Generate deterministic WebP/AVIF assets before deploy so production traffic does not trigger transformation bills.",
    flag: "-f webp,avif",
  },
  {
    title: "CI guardrails by default",
    description:
      "Use --check to fail CI when source images changed without regenerated outputs.",
    flag: "--check",
  },
  {
    title: "Fast reruns with hash cache",
    description:
      "Content and options hashing skips unchanged files, keeping local and CI reruns predictable.",
    flag: "--cache",
  },
  {
    title: "Blur placeholders and metadata",
    description:
      "Emit blurDataURL, dimensions, and output paths in imageforge.json for direct next/image usage.",
    flag: "--blur",
  },
  {
    title: "Bounded parallelism",
    description:
      "Set --concurrency to keep large catalogs under control without overloading build workers.",
    flag: "--concurrency",
  },
  {
    title: "Machine-readable run output",
    description:
      "Use --json for structured logs in CI pipelines and internal automation tooling.",
    flag: "--json",
  },
];

export const HOW_IT_WORKS_STEPS: StepItem[] = [
  {
    number: "1",
    title: "Run",
    description:
      "Point ImageForge at your source directory to generate WebP/AVIF derivatives and blur placeholders at build time.",
    code: "imageforge ./public/images -f webp,avif",
    language: "bash",
  },
  {
    number: "2",
    title: "Check",
    description:
      "Add --check in CI so stale outputs fail the pipeline with a rerun command your team can copy and paste.",
    code: "imageforge ./public/images --check\n# fails if outputs are stale",
    language: "bash",
  },
  {
    number: "3",
    title: "Ship",
    description:
      "Read imageforge.json inside your app for dimensions, blurDataURL, and deterministic output paths.",
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
    value: BENCHMARK_INPUT_MB,
    subtext: `${BENCHMARK_EVIDENCE.sampleSet.imageCount.toString()} source images`,
  },
  {
    label: "Output",
    value: BENCHMARK_OUTPUT_MB,
    subtext: BENCHMARK_EVIDENCE.sampleSet.outputLabel,
  },
  {
    label: "Saved",
    value: `${BENCHMARK_SAVED_PCT.toString()}%`,
    subtext: "smaller static assets",
    accent: true,
  },
  {
    label: "Recurring",
    value: "$0",
    subtext: "runtime transform spend",
  },
];

export const COMPARISON_ROWS: ComparisonRow[] = [
  {
    capability: "Processing model",
    imageforge: "Build-time pre-generation",
    vercel: "Runtime/on-demand optimization",
    cloudinary: "Runtime API transformations",
    imgix: "Runtime URL transformations",
  },
  {
    capability: "Entry pricing",
    imageforge: "$0 (open source)",
    vercel: "Free tier + paid usage beyond limits",
    cloudinary: "Plus plan from about $89-$99/mo",
    imgix: "Credit bundles from $25/mo + custom enterprise",
    sourceIds: ["vercel-pricing", "cloudinary-pricing", "imgix-pricing"],
  },
  {
    capability: "Illustrative 28K-image monthly scenario",
    imageforge: "$0 recurring",
    vercel: "About $115 overage on top of a Pro plan in one reported case",
    cloudinary: "$224+ estimated at similar scale",
    imgix: "Custom quote, often modeled as high three-figure+ monthly",
    sourceIds: [
      "howdygo-case",
      "vercel-pricing",
      "cloudinary-pricing",
      "imgix-pricing",
    ],
  },
  {
    capability: "CI quality gate",
    imageforge: "Built-in --check",
    vercel: "Not a CLI check mode",
    cloudinary: "Not a CLI check mode",
    imgix: "Not a CLI check mode",
  },
  {
    capability: "Air-gapped compatibility",
    imageforge: "Local processing, no external image API",
    vercel: "Requires external runtime service",
    cloudinary: "Managed external service",
    imgix: "Managed external service",
  },
];

export const PRICING_SOURCES: SourceLink[] = [
  {
    id: "vercel-pricing",
    label: "Vercel limits and pricing",
    url: "https://vercel.com/docs/image-optimization/limits-and-pricing",
  },
  {
    id: "cloudinary-pricing",
    label: "Cloudinary pricing",
    url: "https://cloudinary.com/pricing",
  },
  {
    id: "imgix-pricing",
    label: "imgix pricing",
    url: "https://www.imgix.com/pricing",
  },
  {
    id: "howdygo-case",
    label: "HowdyGo cost case study",
    url: "https://www.howdygo.com/blog/cutting-howdygos-vercel-costs-by-80-without-compromising-ux-or-dx",
  },
  {
    id: "next-discussion",
    label: "Next.js build-time discussion #19065",
    url: "https://github.com/vercel/next.js/discussions/19065",
  },
];

export const SEGMENT_CARDS: SegmentCard[] = [
  {
    title: "cost-conscious teams",
    profile:
      "Profile: small product teams and agencies that need predictable hosting costs.",
    pain: "Pain: per-request optimization pricing grows faster than traffic budgets.",
    fit: "ImageForge fit: pre-generate optimized assets once and keep recurring image optimization spend at $0.",
    command: "npx @imageforge/cli ./public/images -f webp,avif",
  },
  {
    title: "CI/CD teams",
    profile:
      "Profile: engineering orgs that already enforce lint, typecheck, and formatting in pipeline gates.",
    pain: "Pain: unoptimized assets slip into deploys because image checks are manual.",
    fit: "ImageForge fit: add --check so stale images fail fast with an exact remediation command.",
    command: "imageforge ./public/images --check",
  },
  {
    title: "air-gapped/compliance teams",
    profile:
      "Profile: security-sensitive environments with strict data residency and egress controls.",
    pain: "Pain: external image APIs can violate compliance boundaries or security policy.",
    fit: "ImageForge fit: all processing is local in the build environment, with no third-party upload path.",
    command: "imageforge ./secure-assets -f webp,avif --concurrency 4",
  },
  {
    title: "Vercel-to-self-host migrations",
    profile:
      "Profile: teams moving to VPS, Kubernetes, or self-managed hosting for cost and control.",
    pain: "Pain: runtime image optimization becomes migration friction and infrastructure overhead.",
    fit: "ImageForge fit: generate static derivatives at build time and serve from any CDN or static host.",
    command: "imageforge ./public/images --out-dir ./public/optimized",
  },
];

export const LIMITATIONS: LimitationItem[] = [
  {
    title: "Responsive widths are target-based and bounded",
    limitation:
      "In responsive width-set mode, requested widths are treated as targets. Effective generated widths can clamp to source dimensions and do not upscale.",
    mitigation:
      "Set width targets intentionally, inspect generated outputs, and keep width-set counts within the documented cap for your CLI version.",
  },
  {
    title: "No runtime responsive resizing",
    limitation:
      "ImageForge generates a fixed derivative set at build time. It does not resize images on-the-fly per request.",
    mitigation:
      "Generate the sizes you need ahead of time or pair outputs with a CDN strategy.",
  },
  {
    title: "No bundled global CDN",
    limitation:
      "ImageForge writes static assets and metadata, but it does not include global delivery infrastructure.",
    mitigation:
      "Deploy outputs behind Cloudflare, CloudFront, Fastly, or your existing CDN layer.",
  },
  {
    title: "First run scales with catalog size",
    limitation:
      "Large first-time catalogs can take minutes to process because work scales with source file count.",
    mitigation:
      "Hash caching keeps subsequent runs fast by processing only changed files.",
  },
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
  alt="Product hero banner"
  width={hero.width}
  height={hero.height}
  placeholder="blur"
  blurDataURL={hero.blurDataURL}
/>;`;
