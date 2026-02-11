import { CodeBlock } from "@/components/landing/CodeBlock";
import { MotionWrap } from "@/components/landing/MotionWrap";
import { NEXT_INTEGRATION_EXAMPLE } from "@/components/landing/constants";

export function NextIntegration() {
  return (
    <section id="nextjs" className="border-b border-white/10 py-20 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-6">
        <MotionWrap>
          <h2 className="text-center text-3xl font-semibold tracking-tight text-zinc-100 md:text-4xl">
            Next.js integration
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-zinc-400">
            Import{" "}
            <code className="font-mono text-zinc-200">imageforge.json</code> and
            feed
            <code className="font-mono text-zinc-200"> blurDataURL </code>
            and dimensions into{" "}
            <code className="font-mono text-zinc-200">next/image</code>.
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
