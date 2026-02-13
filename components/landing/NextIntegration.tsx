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
            feed
            <code className="font-mono text-zinc-200"> blurDataURL </code>
            and dimensions into{" "}
            <code className="font-mono text-zinc-200">next/image</code>. The
            same manifest shape can be consumed in Astro, Nuxt, Remix, and
            static pipelines.
          </p>
        </MotionWrap>
        <MotionWrap className="mx-auto mt-10 max-w-3xl" delayMs={120}>
          <CodeBlock
            code={NEXT_INTEGRATION_EXAMPLE}
            title="lib/imageforge.ts"
            language="tsx"
          />
        </MotionWrap>
      </div>
    </section>
  );
}
