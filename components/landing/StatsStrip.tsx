import { MotionWrap } from "@/components/landing/MotionWrap";
import { EXAMPLE_TIMESTAMP, STATS } from "@/components/landing/constants";

export function StatsStrip() {
  return (
    <section className="border-b border-white/10 py-20 md:py-24">
      <div className="section-shell">
        <MotionWrap>
          <p className="mb-8 text-center font-mono text-[0.68rem] tracking-[0.2em] text-zinc-500 uppercase md:mb-10">
            Example run at {EXAMPLE_TIMESTAMP}
          </p>
        </MotionWrap>
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {STATS.map((stat, index) => (
            <MotionWrap key={stat.label} delayMs={index * 90}>
              <div className="panel-card h-full p-4 text-center md:p-5">
                <p className="mb-1 font-mono text-[0.66rem] tracking-[0.18em] text-zinc-500 uppercase">
                  {stat.label}
                </p>
                <p
                  className={`text-2xl font-semibold tracking-tight md:text-[2rem] ${
                    stat.accent ? "text-emerald-300" : "text-zinc-100"
                  }`}
                >
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-zinc-500">{stat.subtext}</p>
              </div>
            </MotionWrap>
          ))}
        </div>
      </div>
    </section>
  );
}
