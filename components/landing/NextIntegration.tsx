import Link from "next/link";

import { CodeBlock } from "@/components/landing/CodeBlock";
import { MotionWrap } from "@/components/landing/MotionWrap";
import { NEXT_INTEGRATION_EXAMPLE } from "@/components/landing/constants";

export function NextIntegration() {
  return (
    <section id="nextjs" className="border-b border-white/10 py-20 md:py-28">
      <div className="section-shell">
        <MotionWrap>
          <h2 className="text-center text-3xl font-semibold tracking-tight text-zinc-100 md:text-[2.65rem]">
            Next.js-first integration
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-zinc-400">
            Import{" "}
            <code className="font-mono text-zinc-200">imageforge.json</code> and
            point <code className="font-mono text-zinc-200">src</code> to a
            generated derivative, and use its dimensions and blur data. The
            example bypasses a second Next.js runtime transformation. The
            manifest is framework-neutral JSON, but other framework adapters
            should be verified against their own image and asset conventions.
          </p>
        </MotionWrap>
        <MotionWrap className="mx-auto mt-10 max-w-3xl" delayMs={120}>
          <CodeBlock
            code={NEXT_INTEGRATION_EXAMPLE}
            title="lib/imageforge.ts"
            language="tsx"
          />
          <p className="mt-4 text-sm leading-relaxed text-zinc-400">
            Need multiple candidates? The{" "}
            <Link
              href="/docs/nextjs"
              className="ui-focus-ring font-medium text-emerald-300 underline decoration-emerald-300/40 underline-offset-4 hover:text-emerald-200"
            >
              responsive picture guide
            </Link>{" "}
            builds AVIF and WebP srcsets from manifest variants with a
            layout-aware <code className="font-mono text-zinc-200">sizes</code>{" "}
            attribute. For a framework-free path, follow the{" "}
            <Link
              href="/docs/static-html"
              className="ui-focus-ring font-medium text-emerald-300 underline decoration-emerald-300/40 underline-offset-4 hover:text-emerald-200"
            >
              native HTML guide
            </Link>
            .
          </p>
        </MotionWrap>
      </div>
    </section>
  );
}
