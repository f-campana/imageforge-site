import { CodeBlock } from "@/components/landing/CodeBlock";
import { MotionWrap } from "@/components/landing/MotionWrap";
import { HOW_IT_WORKS_STEPS } from "@/components/landing/constants";

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="border-b border-white/10 py-24 md:py-28"
    >
      <div className="section-shell">
        <MotionWrap>
          <h2 className="text-center text-3xl font-semibold tracking-tight text-zinc-100 md:text-[2.65rem]">
            How it works
          </h2>
        </MotionWrap>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <MotionWrap key={step.number} delayMs={index * 110}>
              <article className="panel-card flex h-full flex-col p-5 md:p-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-emerald-300/40 bg-emerald-300/10 font-mono text-sm font-semibold text-emerald-200">
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
