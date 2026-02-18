import { MotionWrap } from "@/components/landing/MotionWrap";
import { SEGMENT_CARDS } from "@/components/landing/constants";

export function SegmentUseCases() {
  return (
    <section id="use-cases" className="border-b border-white/10 py-20 md:py-28">
      <div className="section-shell">
        <MotionWrap>
          <h2 className="text-center text-3xl font-semibold tracking-tight text-zinc-100 md:text-[2.65rem]">
            Who this is for
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-sm leading-relaxed text-zinc-400 md:text-base">
            Next.js-first workflows are front and center, with the same manifest
            pattern usable in other frameworks and static pipelines.
          </p>
        </MotionWrap>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {SEGMENT_CARDS.map((segment, index) => (
            <MotionWrap key={segment.title} delayMs={index * 80}>
              <article className="panel-card ui-interact-card h-full p-6">
                <h3 className="text-xl font-semibold tracking-tight text-zinc-100">
                  {segment.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                  {segment.profile}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  {segment.pain}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  {segment.fit}
                </p>
                <p className="mt-4 font-mono text-sm text-emerald-300/90">
                  {segment.command}
                </p>
              </article>
            </MotionWrap>
          ))}
        </div>
      </div>
    </section>
  );
}
