import { MotionWrap } from "@/components/landing/MotionWrap";
import { FEATURES } from "@/components/landing/constants";

export function FeaturesGrid() {
  return (
    <section id="features" className="border-b border-white/10 py-20 md:py-28">
      <div className="section-shell">
        <MotionWrap>
          <h2 className="text-center text-3xl font-semibold tracking-tight text-zinc-100 md:text-[2.65rem]">
            Features
          </h2>
        </MotionWrap>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {FEATURES.map((feature, index) => (
            <MotionWrap key={feature.title} delayMs={index * 70}>
              <article className="panel-card h-full p-6">
                <h3 className="text-2xl font-semibold tracking-tight text-zinc-100">
                  {feature.title}
                </h3>
                <p className="mt-2 text-[1.02rem] leading-relaxed text-zinc-400">
                  {feature.description}
                </p>
                <p className="mt-4 font-mono text-base text-emerald-300/90">
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
