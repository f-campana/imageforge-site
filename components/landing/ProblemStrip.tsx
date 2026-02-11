import { MotionWrap } from "@/components/landing/MotionWrap";

export function ProblemStrip() {
  return (
    <section className="border-y border-white/10 bg-[#080b12]/85">
      <div className="section-shell py-11 md:py-12">
        <MotionWrap>
          <p className="text-center font-mono text-sm tracking-[0.14em] text-zinc-400 md:text-base">
            Per-request billing · first-hit latency · external-service
            compliance risk
          </p>
        </MotionWrap>
      </div>
    </section>
  );
}
