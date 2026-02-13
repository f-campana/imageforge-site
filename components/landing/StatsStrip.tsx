import { MotionWrap } from "@/components/landing/MotionWrap";
import { STATS } from "@/components/landing/constants";

export function StatsStrip() {
  return (
    <section className="border-b border-white/10 py-20 md:py-24">
      <div className="section-shell">
        <MotionWrap>
          <p className="mb-9 text-center font-mono text-[0.72rem] tracking-[0.2em] text-zinc-400 uppercase md:mb-10">
            Example run proof - 12 source images, one command, zero runtime cost
          </p>
          <p className="mb-8 text-center text-sm text-zinc-400 md:mb-10">
            See benchmark details in{" "}
            <a
              href="#methodology"
              className="font-medium text-emerald-300 transition hover:text-emerald-200"
            >
              Methodology
            </a>
            .
          </p>
        </MotionWrap>
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
          {STATS.map((stat, index) => (
            <MotionWrap key={stat.label} delayMs={index * 90}>
              <div className="panel-card h-full p-5 text-center md:p-6">
                <p className="mb-1 font-mono text-[0.7rem] tracking-[0.16em] text-zinc-400 uppercase">
                  {stat.label}
                </p>
                <p
                  className={`text-4xl font-semibold tracking-tight ${
                    stat.accent ? "text-emerald-300" : "text-zinc-100"
                  }`}
                >
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-zinc-400">{stat.subtext}</p>
              </div>
            </MotionWrap>
          ))}
        </div>
      </div>
    </section>
  );
}
