import Link from "next/link";

import { DOCS } from "@/lib/docs/content";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "ImageForge CLI Documentation",
  description:
    "First-party guides for ImageForge CLI installation, Next.js and static HTML responsive images, CI checks, manifests, troubleshooting, and product fit.",
  path: "/docs",
});

export default function DocsPage() {
  return (
    <>
      <p className="font-mono text-xs tracking-[0.14em] text-emerald-300 uppercase">
        ImageForge CLI documentation
      </p>
      <h1 className="mt-4 text-4xl leading-tight font-semibold tracking-tight text-zinc-100 md:text-6xl">
        Build the image pipeline. Verify it in CI.
      </h1>
      <p className="mt-5 text-base leading-relaxed text-zinc-300 md:text-lg">
        Start with a non-destructive preview, generate WebP/AVIF derivatives and
        metadata, then enforce image freshness without runtime image
        transformation fees.
      </p>

      <div className="panel-card-strong mt-8 overflow-x-auto p-5">
        <p className="font-mono text-xs text-zinc-400">Safe first command</p>
        <code className="mt-3 block min-w-max font-mono text-sm text-emerald-200">
          npx @imageforge/cli ./public/images --dry-run
        </code>
      </div>

      <section aria-labelledby="doc-guides" className="mt-12">
        <h2 id="doc-guides" className="text-2xl font-semibold text-zinc-100">
          Guides
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {DOCS.map((doc) => (
            <Link
              key={doc.slug}
              href={`/docs/${doc.slug}`}
              className="panel-card ui-interact-card ui-focus-ring p-5"
            >
              <h3 className="font-semibold text-zinc-100">{doc.label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                {doc.intent}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
