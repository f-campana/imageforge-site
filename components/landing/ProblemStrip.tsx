import { MotionWrap } from "@/components/landing/MotionWrap";

export function ProblemStrip() {
  return (
    <section className="border-y border-white/10 bg-black/20">
      <div className="mx-auto w-full max-w-6xl px-6 py-10 md:py-12">
        <MotionWrap>
          <p className="text-center font-mono text-sm tracking-[0.12em] text-zinc-400 md:text-base">
            Stale image outputs · missing placeholders · CI drift across teams
          </p>
        </MotionWrap>
      </div>
    </section>
  );
}
