import { PUBLISHED_RELEASE_COPY } from "@/lib/docs/release-copy";
import { DOC_CATALOG, type DocSlug } from "@/lib/docs/catalog";
import { IMAGEFORGE_CLI_VERSION } from "@/lib/release";

export type DocSection = {
  heading: string;
  body: string[];
  code?: string;
  bullets?: string[];
  links?: { label: string; url: string }[];
};

export type DocEntry = {
  slug: DocSlug;
  label: string;
  title: string;
  description: string;
  intent: string;
  sections: DocSection[];
};

const {
  checkContract,
  checkReference,
  checkWriteContract,
  deletedSourceContract,
  dryRunContract,
  dryRunReference,
  manifestContract,
  manifestReviewChecklist,
} = PUBLISHED_RELEASE_COPY;

const DOC_CONTENT = {
  "getting-started": {
    title: "Get started with ImageForge CLI",
    description:
      "Preview and generate responsive WebP and AVIF image derivatives with ImageForge CLI.",
    intent: "Install, preview, generate, and verify your first image pipeline.",
    sections: [
      {
        heading: "1. Preview safely",
        body: [
          `ImageForge CLI requires Node.js 20 or newer. Start from a project with at least one supported source such as public/images/hero.jpg, then preview the planned work. ${dryRunContract}`,
        ],
        code: "npx @imageforge/cli ./public/images --dry-run",
      },
      {
        heading: "2. Generate derivatives",
        body: [
          "Run the same command without --dry-run. This example writes responsive WebP and AVIF derivatives, blur placeholders, a cache, and imageforge.json.",
        ],
        code: "npx @imageforge/cli ./public/images --formats webp,avif --widths 320,640,960,1280",
      },
      {
        heading: "3. Verify generated state",
        body: [
          `${checkContract} ${checkWriteContract} Add the exact same options used to generate your files.`,
        ],
        code: "npx @imageforge/cli ./public/images --formats webp,avif --widths 320,640,960,1280 --check",
      },
      {
        heading: "4. Inspect the expected change",
        body: [
          "A responsive run produces source-bounded candidates next to the source by default, plus cache state inside the input directory and a manifest at the project root. This tree is illustrative: a source narrower than a requested width produces fewer candidates.",
        ],
        code: `.
├── imageforge.json
└── public/images
    ├── .imageforge-cache.json
    ├── hero.jpg
    ├── hero.w320.avif
    ├── hero.w320.webp
    ├── hero.w640.avif
    └── hero.w640.webp`,
      },
      {
        heading: "5. Confirm first success",
        body: [
          `Open imageforge.json and confirm the hero.jpg entry contains intrinsic dimensions, blurDataURL, outputs, and responsive variants. Then rerun the check command: a zero exit status confirms the published ${PUBLISHED_RELEASE_COPY.checkReference}. ${checkWriteContract}`,
          "If the check still reports work, confirm the generation and check commands use identical formats, quality, widths, filters, output path, and output directory. Do not edit generated metadata by hand.",
        ],
        code: "echo $? # 0 after a successful --check on macOS/Linux shells",
      },
      {
        heading: "What to commit",
        body: [
          "For a reviewable generated-assets workflow, commit the source changes and generated state together.",
        ],
        bullets: [
          "Generated WebP/AVIF derivatives",
          "imageforge.json",
          ".imageforge-cache.json",
          "The package-manager lockfile when ImageForge is a project dependency",
        ],
      },
    ],
  },
  nextjs: {
    title: "Use ImageForge CLI with Next.js",
    description:
      "Serve ImageForge's pre-generated responsive images in Next.js without redundant runtime optimization.",
    intent:
      "Connect manifest output to next/image or a responsive picture element.",
    sections: [
      {
        heading: "1. Add a repository-backed source",
        body: [
          "This example starts with public/images/hero.jpg in a Next.js project. Install an exact CLI version in the project so the lockfile selects the same implementation locally and in CI.",
        ],
        code: "pnpm add --save-dev --save-exact @imageforge/cli",
      },
      {
        heading: "2. Generate and inspect",
        body: [
          "Generate responsive candidates, then review imageforge.json and the new files under public/images before changing application markup.",
        ],
        code: "pnpm exec imageforge ./public/images --formats webp,avif --widths 320,640,960,1280",
      },
      {
        heading: "3. Serve the generated file",
        body: [
          "Read dimensions, blur data, and output paths from imageforge.json. Point src at a generated derivative—not the original source—and set unoptimized so Next.js does not transform the pre-generated file again.",
        ],
        code: `import Image from "next/image";
import manifest from "../../imageforge.json";

const hero = manifest.images["hero.jpg"];

<Image
  src={\`/images/\${hero.outputs.webp.path}\`}
  width={hero.width}
  height={hero.height}
  alt="Product dashboard"
  placeholder="blur"
  blurDataURL={hero.blurDataURL}
  unoptimized
/>;`,
      },
      {
        heading: "4. Add responsive variants",
        body: [
          "Use manifest variants to build srcset values for a native picture element. Supply a sizes value that reflects the rendered layout; otherwise browsers can download a larger candidate than necessary.",
          "Static imports already give Next.js intrinsic dimensions and optional blur metadata for supported local images. ImageForge is most useful when you need committed derivatives, controlled width sets, framework-independent metadata, or CI freshness enforcement.",
        ],
        code: `const avif = hero.variants?.avif ?? [];
const webp = hero.variants?.webp ?? [];
const srcSet = (items: typeof avif) =>
  items.map(({ path, width }) => \`/images/\${path} \${width}w\`).join(", ");

<picture>
  <source
    type="image/avif"
    srcSet={srcSet(avif)}
    sizes="(min-width: 1024px) 50vw, 100vw"
  />
  <source
    type="image/webp"
    srcSet={srcSet(webp)}
    sizes="(min-width: 1024px) 50vw, 100vw"
  />
  <img
    src="/images/hero.jpg"
    width={hero.width}
    height={hero.height}
    alt="Product dashboard"
  />
</picture>;`,
      },
      {
        heading: "5. Verify the integration",
        body: [
          "Run the application, inspect the rendered image request, and confirm it resolves to a generated path under /images rather than /_next/image. Test the actual sizes breakpoints so the browser does not select an unnecessarily large candidate.",
          `${checkContract} ${checkWriteContract} The published release does not validate imageforge.json, so review and commit the manifest with the generated files.`,
        ],
        code: "pnpm exec imageforge ./public/images --formats webp,avif --widths 320,640,960,1280 --check",
      },
      {
        heading: "Troubleshoot the first render",
        body: [
          "A missing manifest key means the lookup string does not match the input-relative POSIX path. A 404 usually means the manifest-relative output path was mapped to the wrong public URL. If requests still use /_next/image, confirm the rendered Image has unoptimized enabled or use the native picture example.",
        ],
        bullets: [
          "Keep width, height, and alt on the rendered image",
          "Use a sizes value that matches the layout",
          "Do not send an already-generated derivative through a second optimizer",
          "Keep generation and CI check options identical",
        ],
      },
    ],
  },
  "static-html": {
    title: "Use ImageForge CLI with static HTML",
    description:
      "Generate responsive WebP and AVIF files with ImageForge CLI and serve them from a native HTML picture element.",
    intent:
      "Complete a framework-free first integration using generated static assets.",
    sections: [
      {
        heading: "1. Preview and generate",
        body: [
          `Start with public/images/hero.jpg and preview the bounded derivative set before generating it. ${dryRunContract}`,
        ],
        code: "npx @imageforge/cli ./public/images --formats webp,avif --widths 320,640,960,1280 --dry-run\nnpx @imageforge/cli ./public/images --formats webp,avif --widths 320,640,960,1280",
      },
      {
        heading: "2. Inspect the manifest and files",
        body: [
          "Use imageforge.json as the source of truth for effective widths and paths. Requested widths are targets, so do not assume every candidate below exists when the original is smaller.",
        ],
        code: `public/images/
├── hero.jpg
├── hero.w320.avif
├── hero.w320.webp
├── hero.w640.avif
└── hero.w640.webp`,
      },
      {
        heading: "3. Render native responsive markup",
        body: [
          "Build each srcset from the variants recorded in imageforge.json. This abbreviated markup shows the resulting browser contract for candidates that actually exist; keep the original source as the final fallback.",
        ],
        code: `<picture>
  <source
    type="image/avif"
    srcset="/images/hero.w320.avif 320w, /images/hero.w640.avif 640w"
    sizes="(min-width: 48rem) 50vw, 100vw"
  />
  <source
    type="image/webp"
    srcset="/images/hero.w320.webp 320w, /images/hero.w640.webp 640w"
    sizes="(min-width: 48rem) 50vw, 100vw"
  />
  <img src="/images/hero.jpg" width="1200" height="800" alt="Product dashboard" />
</picture>`,
      },
      {
        heading: "4. Verify before deploy",
        body: [
          `${checkContract} ${checkWriteContract} Preview the page at its real breakpoints and use the browser network panel to confirm a generated AVIF or WebP candidate is selected.`,
        ],
        code: "npx @imageforge/cli ./public/images --formats webp,avif --widths 320,640,960,1280 --check",
      },
    ],
  },
  ci: {
    title: "Enforce image freshness in CI",
    description:
      "Pin ImageForge CLI in your project and add a repeatable GitHub Actions image freshness check.",
    intent:
      "Make stale generated images fail pull-request checks before merge.",
    sections: [
      {
        heading: "Pin the tool",
        body: [
          "Use an exact project dependency instead of a floating one-off download. The lockfile then selects the same CLI locally and in CI.",
        ],
        code: "pnpm add --save-dev --save-exact @imageforge/cli",
      },
      {
        heading: "Add scripts",
        body: ["Keep build and check options identical."],
        code: `{
  "scripts": {
    "images:build": "imageforge ./public/images -f webp,avif --widths 320,640,960,1280",
    "images:check": "imageforge ./public/images -f webp,avif --widths 320,640,960,1280 --check"
  }
}`,
      },
      {
        heading: "Add the pull-request workflow",
        body: [
          "Commit the generated derivatives, imageforge.json, and .imageforge-cache.json with their source changes. A clean runner needs that complete baseline before --check can verify freshness.",
          "The readable action tags below are a starting point. Replace them with reviewed full commit SHAs when your repository requires immutable workflow dependencies.",
        ],
        code: `# .github/workflows/images.yml
name: Image freshness
on:
  pull_request:

permissions:
  contents: read

jobs:
  imageforge:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm run images:check`,
      },
      {
        heading: "Reproduce a failed check",
        body: [
          "A failed check prints a build command with the effective options. Review shell quoting for your terminal, regenerate, inspect the diff, and commit the refreshed state.",
        ],
        code: "pnpm install --frozen-lockfile\npnpm run images:check",
      },
    ],
  },
  "cli-reference": {
    title: "ImageForge CLI command reference",
    description:
      "Reference for ImageForge CLI formats, quality, responsive widths, cache, check, dry-run, filtering, and output options.",
    intent:
      "Choose and reproduce the options that define your generated image contract.",
    sections: [
      {
        heading: "Commands and exit status",
        body: [
          "Run imageforge against a directory containing supported source images. Normal generation exits 1 if a file fails. Check mode exits 1 when processing is needed and 0 when the checked source, cache, and derivative state is current.",
        ],
        code: "imageforge <directory> [options]\nimageforge init [--force]\nimageforge --help\nimageforge --version",
      },
      {
        heading: "Published defaults",
        body: [
          `Version ${IMAGEFORGE_CLI_VERSION} defaults to a root imageforge.json manifest, WebP at quality 80, blur placeholders with sample size 4, cache enabled, and derivatives next to their sources. Concurrency defaults to the smaller of 8 and the available parallelism. Responsive widths and a separate output directory are opt-in.`,
        ],
      },
      {
        heading: "Generation options",
        body: [],
        bullets: [
          "-f, --formats <formats>: webp, avif, or both",
          "-q, --quality <number>: output quality from 1 to 100",
          "--widths <list>: up to 16 source-bounded responsive widths",
          "--blur / --no-blur: enable or disable blurDataURL generation",
          "--out-dir <path>: place derivatives in a separate directory",
          "-o, --output <path>: set the manifest path",
          "--blur-size <number>: blur sample dimension from 1 to 256; default 4",
          "--concurrency <number>: bounded parallel work from 1 to 64",
        ],
      },
      {
        heading: "Workflow options",
        body: [],
        bullets: [
          dryRunReference,
          checkReference,
          "--json: machine-readable report on stdout",
          "--include / --exclude: repeatable input-relative glob filters",
          "--concurrency <number>: bounded parallel work from 1 to 64",
          "--config <path>: select an explicit JSON config",
          "--cache / --no-cache: enable or disable the persistent cache",
          "--force-overwrite: allow no-cache runs to replace owned outputs",
          "--verbose / --no-verbose: enable or disable detailed output",
          "--quiet / --no-quiet: enable or disable non-error output",
          "-V, --version: print the installed CLI version",
          "-h, --help: print command help",
        ],
      },
      {
        heading: "Guardrails and incompatibilities",
        body: [
          "Check and dry-run modes cannot be combined. Width lists allow at most 16 unique positive targets and never upscale beyond source dimensions. Discovery skips symlinks, output collision checks are case-insensitive, and existing conflicting outputs are protected unless overwrite is explicitly authorized.",
          "Include and exclude globs are input-relative. Keep generation and check options identical; changing formats, quality, widths, filters, output path, or output directory changes the generated-state contract.",
        ],
      },
      {
        heading: "Initialize configuration",
        body: [
          "imageforge init creates imageforge.config.json and refuses to replace an existing file. Review the existing file or pass --force intentionally.",
        ],
        code: "imageforge init\nimageforge init --force",
      },
    ],
  },
  configuration: {
    title: "Configure ImageForge CLI",
    description:
      "Create and resolve ImageForge CLI JSON configuration for repeatable local and CI image generation.",
    intent:
      "Keep options reviewable and identical across developers and automation.",
    sections: [
      {
        heading: "Create a starter file",
        body: [
          "The init command refuses to overwrite an existing config unless you pass --force.",
        ],
        code: "imageforge init",
      },
      {
        heading: "Example config",
        body: [],
        code: `{
  "output": "imageforge.json",
  "formats": ["webp", "avif"],
  "quality": 80,
  "blur": true,
  "widths": [320, 640, 960, 1280],
  "outDir": "public/generated",
  "concurrency": 4
}`,
      },
      {
        heading: "Resolution order",
        body: [
          "Internal defaults are applied first, then an explicit --config file, imageforge.config.json, or package.json#imageforge. CLI flags win last. Unknown keys fail fast instead of being ignored.",
        ],
      },
    ],
  },
  manifest: {
    title: "Understand imageforge.json",
    description:
      "Use ImageForge manifest dimensions, blur placeholders, hashes, output paths, and responsive variants.",
    intent: "Turn generated files into reliable application image metadata.",
    sections: [
      {
        heading: "Entry contract",
        body: [
          "Each input-relative source key records dimensions, aspect ratio, original size, source/options hash, blurDataURL, and one output per format. Responsive runs also record ordered variants; outputs.<format> points to the largest effective variant.",
        ],
      },
      {
        heading: "Representative manifest",
        body: [
          "This abbreviated 1.0 document shows one responsive WebP entry. Actual hashes, sizes, dimensions, timestamps, paths, and candidate counts come from the source and effective options.",
        ],
        code: `{
  "version": "1.0",
  "generated": "2026-02-08T00:00:00.000Z",
  "images": {
    "hero.jpg": {
      "width": 1920,
      "height": 1280,
      "aspectRatio": 1.5,
      "blurDataURL": "data:image/png;base64,...",
      "originalSize": 345678,
      "outputs": {
        "webp": { "path": "hero.w640.webp", "size": 17654 }
      },
      "variants": {
        "webp": [
          { "width": 320, "height": 213, "path": "hero.w320.webp", "size": 9012 },
          { "width": 640, "height": 427, "path": "hero.w640.webp", "size": 17654 }
        ]
      },
      "hash": "abc123..."
    }
  }
}`,
      },
      {
        heading: "Path contract",
        body: [
          "Manifest keys and output paths use POSIX separators and are relative to the input directory. If public/images is mounted at /images, hero.webp maps to /images/hero.webp. An external out-dir may produce ../ segments, so resolve URLs deliberately.",
        ],
      },
      {
        heading: "Freshness contract",
        body: [manifestContract],
      },
      {
        heading: "JSON run-report contract",
        body: [
          "The --json flag writes a machine-readable run report to stdout with effective options, per-image status, summary counters, size totals, responsive variant widths when present, and a remediation command for failed checks. Keep diagnostics on stderr separate from the JSON consumer.",
        ],
        code: "imageforge ./public/images --json > imageforge-report.json",
      },
      {
        heading: "Versioning boundary",
        body: [
          `Published CLI ${IMAGEFORGE_CLI_VERSION} identifies the manifest format as 1.0, but it does not publish standalone JSON Schema files or a separate backward-compatibility guarantee for every manifest and run-report field. Pin the CLI exactly, validate the version field, and review manifest/report changes during upgrades before treating fields as a long-lived external API.`,
        ],
      },
    ],
  },
  troubleshooting: {
    title: "Troubleshoot ImageForge CLI",
    description:
      "Resolve stale checks, output collisions, missing derivatives, deleted sources, and unexpected Next.js image delivery.",
    intent:
      "Diagnose common failures without editing generated metadata by hand.",
    sections: [
      {
        heading: "Check mode fails",
        body: [
          "Use the effective-option command printed in the failure output after reviewing shell quoting for your terminal, inspect the generated diff, and rerun --check. Build and check commands must use identical formats, quality, widths, filters, and output directories.",
        ],
      },
      {
        heading: "A source was deleted",
        body: [deletedSourceContract],
      },
      {
        heading: "Next.js still transforms the image",
        body: [
          "Confirm src points to the generated WebP/AVIF path. Add unoptimized or an equivalent custom loader; otherwise next/image can send the already-generated file through its runtime optimizer.",
        ],
      },
      {
        heading: "Output collision",
        body: [
          "Rename colliding sources or choose a disjoint output directory. Collision checks are case-insensitive to keep behavior portable across filesystems.",
        ],
      },
      {
        heading: "Sharp cannot install or load",
        body: [
          "ImageForge depends on Sharp's native binaries. Confirm Node.js 20 or newer, the target platform support, and that the package manager was allowed to install required native artifacts. Reproduce from a clean frozen install before changing image options.",
        ],
        links: [
          {
            label: "Sharp installation and platform support",
            url: "https://sharp.pixelplumbing.com/install/",
          },
        ],
      },
      {
        heading: "Permission or overwrite failure",
        body: [
          "Confirm the process can read the input tree and write the manifest, cache, output directory, and derivative parents. Do not bypass an existing-output warning until you have identified which source owns the target; use --force-overwrite only after that review.",
        ],
      },
      {
        heading: "Unsupported or animated input",
        body: [
          `Published version ${IMAGEFORGE_CLI_VERSION} discovers jpg, jpeg, png, gif, tiff, and tif sources. WebP and AVIF are output formats, not source inputs. GIF handling is static and uses the first frame, so use a different workflow when animation must be preserved.`,
        ],
      },
      {
        heading: "Large catalog or memory pressure",
        body: [
          "Lower --concurrency, narrow discovery with include/exclude globs, or process bounded directories separately. Keep each width set intentional because every effective width and format adds derivative work.",
        ],
        code: "imageforge ./public/images --concurrency 2 --include '**/*.jpg' --include '**/*.png'",
      },
      {
        heading: "A requested width is missing",
        body: [
          "Widths are source-bounded targets, not guaranteed output dimensions. ImageForge filters candidates that would upscale the source, caps each run at 16 unique widths, and records the effective widths in imageforge.json.",
        ],
      },
    ],
  },
  "when-to-use": {
    title: "When ImageForge CLI is the right fit",
    description:
      "Compare build-time image generation with runtime image services and framework-native static image handling.",
    intent: "Choose ImageForge for the workflows it actually serves well.",
    sections: [
      {
        heading: "Strong fit",
        body: [],
        bullets: [
          "Static or moderately changing image catalogs",
          "Teams that want generated assets reviewed and committed",
          "Multiple frameworks consuming one manifest contract",
          "Controlled responsive widths and no runtime transformation service",
          "Air-gapped or predictable build environments",
        ],
      },
      {
        heading: "Consider another approach",
        body: [],
        bullets: [
          "User-generated or rapidly changing media that cannot wait for builds",
          "Dynamic cropping, focal-point editing, or URL-based transformations",
          "A team that prefers a managed media library, delivery CDN, and analytics",
          "A small Next.js project already satisfied by static imports and its built-in optimizer",
        ],
      },
      {
        heading: "Cost language",
        body: [
          "ImageForge is open-source software and does not charge runtime transformation fees. Your build compute, repository/storage, CDN, and egress costs still depend on your hosting setup.",
        ],
      },
    ],
  },
  "build-time-vs-runtime": {
    title: "Build-time vs runtime image optimization",
    description:
      "Compare build-time image generation with request-time image optimization for static assets, dynamic media, CI review, and delivery tradeoffs.",
    intent:
      "Choose where image transformation belongs based on how your media changes and ships.",
    sections: [
      {
        heading: "Choose build time for reviewable assets",
        body: [
          "Build-time generation fits source-controlled catalogs that change with application releases. Derivatives, responsive candidates, and metadata can be reviewed together, checked in CI, and served by any static host or CDN.",
        ],
        bullets: [
          "Marketing, documentation, product, and editorial images released with code",
          "Controlled width and format sets shared across frameworks",
          "Teams that want a source-to-derivative diff before deploy",
          "Deployments that should not depend on a request-time transformation service",
        ],
      },
      {
        heading: "Choose runtime for dynamic media",
        body: [
          "Request-time services fit user-generated or rapidly changing media, dynamic crops, remote catalogs, and teams that want managed storage, delivery, editing, or analytics. They can generate device-specific variants without rebuilding the application.",
        ],
        bullets: [
          "Uploads or remote sources that arrive after the application build",
          "Dynamic focal points, crops, overlays, or signed delivery URLs",
          "Large media libraries managed outside the source repository",
          "Operations teams that prefer a managed transformation and CDN control plane",
        ],
      },
      {
        heading: "Use a hybrid deliberately",
        body: [
          "A project can pre-generate stable application assets while leaving user media to a runtime service. Define ownership by directory or source system so one image is not transformed twice and cache invalidation remains understandable.",
        ],
        links: [
          {
            label: "Next.js image optimization overview",
            url: "https://nextjs.org/docs/app/getting-started/images",
          },
          {
            label: "Vercel image optimization behavior",
            url: "https://vercel.com/docs/image-optimization",
          },
        ],
      },
    ],
  },
  "vercel-image-optimization": {
    title: "ImageForge and Vercel Image Optimization",
    description:
      "Decide between ImageForge build-time derivatives and Vercel request-time Image Optimization, with a reversible migration checklist for stable assets.",
    intent:
      "Evaluate a migration without implying that every Vercel or Next.js workload should move.",
    sections: [
      {
        heading: "Keep Vercel optimization when it fits",
        body: [
          "Vercel transforms and caches images through framework image components. Keep that workflow when sources or required dimensions are dynamic, managed delivery is valuable, or the current usage and operational model already fits your application.",
        ],
        links: [
          {
            label: "Vercel Image Optimization",
            url: "https://vercel.com/docs/image-optimization",
          },
          {
            label: "Current Vercel limits and pricing",
            url: "https://vercel.com/docs/image-optimization/limits-and-pricing",
          },
        ],
      },
      {
        heading: "Evaluate ImageForge for stable assets",
        body: [
          "ImageForge is a candidate when the assets ship with the repository, the team wants generated files in pull-request review, and a fixed responsive set is sufficient. ImageForge itself has no runtime transformation fee; build compute, storage, CDN, requests, and transfer still belong to your hosting stack.",
        ],
        code: "npx @imageforge/cli ./public/images --formats webp,avif --widths 320,640,960,1280 --dry-run",
      },
      {
        heading: "Migrate one bounded directory",
        body: [
          "Start with a stable directory rather than changing the whole application. Generate and inspect derivatives, switch markup to generated paths, preserve intrinsic dimensions, add responsive srcsets, and bypass a second runtime transformation with unoptimized or an equivalent loader. Compare bytes, visual quality, build time, cache behavior, and delivery cost before expanding.",
        ],
        bullets: [
          "Keep the original route available during the evaluation",
          "Test the exact production layout and sizes values",
          "Add the same ImageForge options to build and CI check scripts",
          manifestReviewChecklist,
          "Retain Vercel optimization for dynamic or remote media when it remains the better fit",
        ],
        links: [
          {
            label: "Next.js Image component reference",
            url: "https://nextjs.org/docs/app/api-reference/components/image",
          },
          {
            label: "Vercel usage and cost controls",
            url: "https://vercel.com/docs/image-optimization/managing-image-optimization-costs",
          },
        ],
      },
    ],
  },
  "image-service-comparison": {
    title: "Compare ImageForge with managed image services",
    description:
      "Compare ImageForge's build-time workflow with Vercel Image Optimization, Cloudinary, and imgix using dated primary sources.",
    intent:
      "Use a scoped factual matrix without treating different product categories as interchangeable.",
    sections: [
      {
        heading: "Start with the processing model",
        body: [
          "ImageForge pre-generates repository-backed assets during development or CI. Vercel Image Optimization transforms through a framework-integrated runtime service, while Cloudinary and imgix provide broader managed transformation and delivery platforms. The right choice depends on source volatility, media-management needs, delivery architecture, and operational ownership—not one price row.",
        ],
      },
      {
        heading: "Read pricing as dated context",
        body: [
          "Provider units are not equivalent: transformations, cache operations, storage, delivery, and media-management features can be bundled differently. Use the linked primary sources and your account calculator for a current estimate. ImageForge has no runtime transformation fee, but build compute, repository or object storage, CDN requests, transfer, and operations remain.",
        ],
      },
      {
        heading: "Know when a managed service is better",
        body: [],
        bullets: [
          "Images arrive after the application build",
          "Arbitrary crops, focal points, overlays, or signed URLs are required",
          "A managed media library and delivery control plane are valuable",
          "The team does not want generated files in source review",
        ],
      },
    ],
  },
  "imageforge-and-sharp": {
    title: "ImageForge CLI vs direct Sharp scripts",
    description:
      "Understand when to use ImageForge's opinionated Sharp-based pipeline and when a custom Sharp script is the more appropriate image workflow.",
    intent:
      "Choose an adoption layer without presenting the underlying image library as a competitor.",
    sections: [
      {
        heading: "ImageForge uses Sharp",
        body: [
          "Sharp is the image-processing dependency behind ImageForge's decoding and encoding. ImageForge adds a directory-oriented CLI contract: discovery, collision checks, responsive width sets, cache ownership, blur placeholders, a manifest, structured reports, dry-run, and CI freshness checks.",
        ],
        links: [
          {
            label: "Sharp installation and platform support",
            url: "https://sharp.pixelplumbing.com/install/",
          },
        ],
      },
      {
        heading: "Use ImageForge for a standard pipeline",
        body: [],
        bullets: [
          "The source-to-output contract should be shared across projects or frameworks",
          "You want manifest dimensions, hashes, blur data, and output paths",
          "Generated state belongs in review and must be checked in CI",
          "Responsive WebP/AVIF conversion covers the required transformations",
        ],
      },
      {
        heading: "Use Sharp directly for custom transforms",
        body: [
          "A direct Sharp script is the better layer when the pipeline needs custom compositing, metadata handling, colorspace work, dynamic crops, unusual formats, storage integration, or application-specific orchestration. ImageForge is intentionally not a replacement for Sharp's full API.",
        ],
        links: [
          {
            label: "Sharp output API",
            url: "https://sharp.pixelplumbing.com/api-output/",
          },
          {
            label: "Sharp resize API",
            url: "https://sharp.pixelplumbing.com/api-resize/",
          },
        ],
      },
    ],
  },
} satisfies Record<DocSlug, Omit<DocEntry, "slug" | "label">>;

export const DOCS: DocEntry[] = DOC_CATALOG.map((entry) => ({
  ...entry,
  ...DOC_CONTENT[entry.slug],
}));

export function getDoc(slug: string): DocEntry | undefined {
  return DOCS.find((entry) => entry.slug === slug);
}
