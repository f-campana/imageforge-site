import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ImageForge Contact | Support and Feedback",
  description:
    "Contact and feedback entry points for ImageForge CLI support, bug reports, feature requests, and security reporting.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-[var(--background)] text-[var(--foreground)]">
      <div className="site-grid-layer" aria-hidden="true" />
      <main className="section-shell py-20 md:py-28">
        <h1 className="max-w-3xl text-4xl leading-tight font-semibold tracking-tight text-zinc-100 md:text-6xl">
          Contact and feedback
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-zinc-300 md:text-lg">
          Use these channels for support, bug reports, roadmap discussion, and
          coordinated security disclosure.
        </p>

        <section className="mt-10 grid gap-4 md:grid-cols-2">
          <a
            href="https://github.com/f-campana/imageforge/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="ui-interact-control ui-focus-ring rounded-2xl border border-white/10 bg-white/5 p-5 hover:border-white/20 hover:bg-white/10"
          >
            <h2 className="text-lg font-semibold text-zinc-100">
              Bug reports and feature requests
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">
              Open or search GitHub issues for product feedback and engineering
              support.
            </p>
          </a>

          <a
            href="https://github.com/f-campana/imageforge/blob/main/SECURITY.md"
            target="_blank"
            rel="noopener noreferrer"
            className="ui-interact-control ui-focus-ring rounded-2xl border border-white/10 bg-white/5 p-5 hover:border-white/20 hover:bg-white/10"
          >
            <h2 className="text-lg font-semibold text-zinc-100">
              Security reporting
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">
              Follow the coordinated disclosure process documented in
              SECURITY.md.
            </p>
          </a>
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-semibold text-zinc-100">Documentation</h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">
            Start with first-party docs, then follow links to full GitHub
            technical references and changelog details.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/docs"
              className="ui-interact-control ui-focus-ring inline-flex rounded-md border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 hover:border-white/35 hover:bg-white/10 hover:text-white"
            >
              Open docs
            </Link>
            <Link
              href="/"
              className="ui-interact-control ui-focus-ring inline-flex rounded-md border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 hover:border-white/35 hover:bg-white/10 hover:text-white"
            >
              Back to landing
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
