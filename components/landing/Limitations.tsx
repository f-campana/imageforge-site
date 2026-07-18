import Link from "next/link";

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
            ImageForge is optimized for reviewable build-time pipelines. These
            tradeoffs keep costs predictable and operations simple.
          </p>
        </MotionWrap>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
          {LIMITATIONS.map((item, index) => (
            <MotionWrap key={item.title} delayMs={index * 70}>
              <article className="panel-card ui-interact-card h-full p-6">
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
        <MotionWrap
          className="mx-auto mt-6 max-w-2xl text-center"
          delayMs={240}
        >
          <p className="text-sm text-zinc-400">
            Check the constraints against your workload in the{" "}
            <Link
              href="/docs/when-to-use"
              className="ui-focus-ring font-medium text-emerald-300 underline decoration-emerald-300/40 underline-offset-4 hover:text-emerald-200"
            >
              when-to-use decision guide
            </Link>
            .
          </p>
        </MotionWrap>
      </div>
    </section>
  );
}
