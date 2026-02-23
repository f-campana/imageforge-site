import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ImageForge Docs | Getting Started",
  description:
    "Quick-start docs for ImageForge CLI: install, run, CI check mode, and benchmark evidence references.",
  alternates: {
    canonical: "/docs",
  },
};

export default function DocsPage() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-[var(--background)] text-[var(--foreground)]">
      <div className="site-grid-layer" aria-hidden="true" />
      <main className="section-shell py-20 md:py-28">
        <h1 className="max-w-3xl text-4xl leading-tight font-semibold tracking-tight text-zinc-100 md:text-6xl">
          ImageForge docs
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-zinc-300 md:text-lg">
          ImageForge is a build-time image optimization CLI for WebP/AVIF
          derivatives, blur placeholders, and deterministic CI freshness checks.
        </p>

        <section className="mt-10 space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-zinc-100">Quick start</h2>
          <pre className="overflow-x-auto rounded-lg border border-white/10 bg-black/30 p-4 font-mono text-sm text-zinc-100">
            <code>{`npx @imageforge/cli ./public/images\nimageforge ./public/images --check`}</code>
          </pre>
          <p className="text-sm leading-relaxed text-zinc-300">
            Use <code className="font-mono text-zinc-100">--check</code> in CI
            to fail when image outputs are stale, and run without{" "}
            <code className="font-mono text-zinc-100">--check</code> to apply
            updates.
          </p>
        </section>

        <section className="mt-8 space-y-3 text-sm text-zinc-300">
          <h2 className="text-xl font-semibold text-zinc-100">References</h2>
          <ul className="space-y-2">
            <li>
              <a
                href="https://github.com/f-campana/imageforge#readme"
                target="_blank"
                rel="noopener noreferrer"
                className="ui-interact-link ui-focus-ring hover:text-emerald-300"
              >
                GitHub README
              </a>
            </li>
            <li>
              <a
                href="https://github.com/f-campana/imageforge/blob/main/CHANGELOG.md"
                target="_blank"
                rel="noopener noreferrer"
                className="ui-interact-link ui-focus-ring hover:text-emerald-300"
              >
                Changelog
              </a>
            </li>
            <li>
              <Link
                href="/benchmarks/latest"
                className="ui-interact-link ui-focus-ring hover:text-emerald-300"
              >
                Benchmark evidence
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="ui-interact-link ui-focus-ring hover:text-emerald-300"
              >
                Contact
              </Link>
            </li>
          </ul>
        </section>

        <div className="mt-10">
          <Link
            href="/"
            className="ui-interact-control ui-focus-ring inline-flex rounded-md border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 hover:border-white/35 hover:bg-white/10 hover:text-white"
          >
            Back to landing
          </Link>
        </div>
      </main>
    </div>
  );
}
