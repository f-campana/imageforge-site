import { CodeBlock } from "@/components/landing/CodeBlock";
import { MotionWrap } from "@/components/landing/MotionWrap";
import { HOW_IT_WORKS_STEPS } from "@/components/landing/constants";

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="border-b border-white/10 py-24 md:py-32"
    >
      <div className="section-shell">
        <MotionWrap>
          <h2 className="text-center text-3xl font-semibold tracking-tight text-zinc-100 md:text-[2.65rem]">
            How it works
          </h2>
        </MotionWrap>
        <div className="mt-14 space-y-9 md:space-y-11">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <MotionWrap key={step.number} delayMs={index * 110}>
              <article className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-emerald-300/40 bg-emerald-300/10 font-mono text-sm font-semibold text-emerald-200">
                    {step.number}
                  </span>
                  <h3 className="text-lg font-semibold tracking-tight text-zinc-100">
                    {step.title}
                  </h3>
                </div>
                <p className="max-w-4xl text-lg leading-relaxed text-zinc-400">
                  {step.description}
                </p>
                <CodeBlock
                  code={step.code}
                  language={step.language}
                  showHeader={false}
                  allowCopy={false}
                  kind="default"
                />
              </article>
            </MotionWrap>
          ))}
        </div>
      </div>
    </section>
  );
}
