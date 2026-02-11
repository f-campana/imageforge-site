import { CodeBlock } from "@/components/landing/CodeBlock";
import { MotionWrap } from "@/components/landing/MotionWrap";
import { HOW_IT_WORKS_STEPS } from "@/components/landing/constants";

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="border-b border-white/10 py-20 md:py-24"
    >
      <div className="mx-auto w-full max-w-6xl px-6">
        <MotionWrap>
          <h2 className="text-center text-3xl font-semibold tracking-tight text-zinc-100 md:text-4xl">
            How it works
          </h2>
        </MotionWrap>
        <div className="mt-12 grid gap-7 md:grid-cols-3">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <MotionWrap key={step.number} delayMs={index * 110}>
              <article className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <div className="mb-4 flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-emerald-300/45 bg-emerald-400/10 font-mono text-sm font-semibold text-emerald-300">
                    {step.number}
                  </span>
                  <h3 className="text-lg font-semibold tracking-tight text-zinc-100">
                    {step.title}
                  </h3>
                </div>
                <p className="mb-5 text-sm leading-relaxed text-zinc-400">
                  {step.description}
                </p>
                <div className="mt-auto">
                  <CodeBlock code={step.code} language={step.language} />
                </div>
              </article>
            </MotionWrap>
          ))}
        </div>
      </div>
    </section>
  );
}
