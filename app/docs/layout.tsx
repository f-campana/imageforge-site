import Link from "next/link";

import { DocsNav } from "@/components/docs/DocsNav";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-[var(--background)] text-[var(--foreground)]">
      <div className="site-grid-layer" aria-hidden="true" />
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#06080d]/92 backdrop-blur-md">
        <div className="section-shell flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="ui-interact-link ui-focus-ring font-mono text-lg font-semibold text-zinc-100 hover:text-white"
            >
              imageforge
            </Link>
            <span className="font-mono text-xs text-zinc-400">/ docs</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-zinc-300">
            <Link
              href="/benchmarks/latest"
              className="ui-interact-link ui-focus-ring hidden hover:text-white sm:inline"
            >
              Benchmarks
            </Link>
            <a
              href="https://github.com/f-campana/imageforge"
              target="_blank"
              rel="noopener noreferrer"
              className="ui-interact-link ui-focus-ring hover:text-white"
            >
              GitHub
            </a>
          </div>
        </div>
      </header>
      <div className="section-shell grid gap-10 py-10 md:grid-cols-[15rem_minmax(0,1fr)] md:py-14">
        <aside className="panel-card hidden h-fit p-3 md:sticky md:top-24 md:block">
          <DocsNav />
        </aside>
        <div className="min-w-0">
          <details className="panel-card mb-8 p-4 md:hidden">
            <summary className="ui-focus-ring cursor-pointer text-sm font-semibold text-zinc-100">
              Browse documentation
            </summary>
            <div className="mt-3 border-t border-white/10 pt-3">
              <DocsNav />
            </div>
          </details>
          <main id="main-content" className="max-w-3xl min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
