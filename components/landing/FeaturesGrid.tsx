import { MotionWrap } from "@/components/landing/MotionWrap";
import { FEATURES } from "@/components/landing/constants";

export function FeaturesGrid() {
  return (
    <section id="features" className="border-b border-white/10 py-20 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-6">
        <MotionWrap>
          <h2 className="text-center text-3xl font-semibold tracking-tight text-zinc-100 md:text-4xl">
            Features that hold up in production
          </h2>
        </MotionWrap>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, index) => (
            <MotionWrap key={feature.title} delayMs={index * 70}>
              <article className="h-full rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <h3 className="text-base font-semibold tracking-tight text-zinc-100">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {feature.description}
                </p>
                <p className="mt-3 font-mono text-xs text-emerald-300/90">
                  {feature.flag}
                </p>
              </article>
            </MotionWrap>
          ))}
        </div>
      </div>
    </section>
  );
}
