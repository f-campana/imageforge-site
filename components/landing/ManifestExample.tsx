import { CodeBlock } from "@/components/landing/CodeBlock";
import { MotionWrap } from "@/components/landing/MotionWrap";
import {
  EXAMPLE_TIMESTAMP,
  MANIFEST_EXAMPLE,
} from "@/components/landing/constants";

export function ManifestExample() {
  return (
    <section id="manifest" className="border-b border-white/10 py-20 md:py-28">
      <div className="section-shell">
        <MotionWrap>
          <h2 className="text-center text-3xl font-semibold tracking-tight text-zinc-100 md:text-[2.65rem]">
            Manifest output
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-zinc-400">
            Every run writes{" "}
            <code className="font-mono text-zinc-200">imageforge.json</code>{" "}
            with source dimensions, format outputs, blurDataURL, and cache hash
            metadata. Example timestamp: {EXAMPLE_TIMESTAMP}.
          </p>
        </MotionWrap>
        <MotionWrap className="mx-auto mt-10 max-w-3xl" delayMs={120}>
          <CodeBlock
            code={MANIFEST_EXAMPLE}
            title="imageforge.json"
            language="json"
          />
        </MotionWrap>
      </div>
    </section>
  );
}
