import { MotionWrap } from "@/components/landing/MotionWrap";
import { LIMITATIONS } from "@/components/landing/constants";

export function Limitations() {
  return (
    <section
      id="limitations"
      className="border-b border-white/10 py-20 md:py-28"
    >
      <div className="section-shell">
        <MotionWrap>
          <h2 className="text-center text-3xl font-semibold tracking-tight text-zinc-100 md:text-[2.65rem]">
            Honest limitations
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-sm leading-relaxed text-zinc-400 md:text-base">
            ImageForge is optimized for deterministic build-time pipelines.
            These tradeoffs keep costs predictable and operations simple.
          </p>
        </MotionWrap>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
          {LIMITATIONS.map((item, index) => (
            <MotionWrap key={item.title} delayMs={index * 70}>
              <article className="panel-card h-full p-6">
                <h3 className="text-lg font-semibold tracking-tight text-zinc-100">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  {item.limitation}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                  <span className="font-medium text-zinc-200">Mitigation:</span>{" "}
                  {item.mitigation}
                </p>
              </article>
            </MotionWrap>
          ))}
        </div>
      </div>
    </section>
  );
}
