import { MotionWrap } from "@/components/landing/MotionWrap";
import { IMAGEFORGE_VERSION } from "@/components/landing/constants";

export function Methodology() {
  return (
    <section id="methodology" className="border-b border-white/10 py-20 md:py-24">
      <div className="section-shell">
        <MotionWrap>
          <h2 className="text-center text-3xl font-semibold tracking-tight text-zinc-100 md:text-[2.65rem]">
            Methodology
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-sm leading-relaxed text-zinc-400 md:text-base">
            The headline benchmark numbers on this page represent one documented
            example run. They are a reproducible reference point, not a
            universal guarantee.
          </p>
        </MotionWrap>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <MotionWrap>
            <article className="panel-card h-full p-6">
              <h3 className="text-lg font-semibold text-zinc-100">Sample Set</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                12 JPEG/PNG source images with a combined input size of 8.4 MB.
                Output target formats are WebP and AVIF.
              </p>
            </article>
          </MotionWrap>
          <MotionWrap delayMs={70}>
            <article className="panel-card h-full p-6">
              <h3 className="text-lg font-semibold text-zinc-100">
                Runtime Environment
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                ImageForge CLI v{IMAGEFORGE_VERSION}, Node &gt;= 22, local build
                pipeline. Example values are captured from the terminal demo in
                this landing page.
              </p>
            </article>
          </MotionWrap>
          <MotionWrap delayMs={120}>
            <article className="panel-card h-full p-6">
              <h3 className="text-lg font-semibold text-zinc-100">
                Command and Options
              </h3>
              <p className="mt-2 font-mono text-xs leading-relaxed text-zinc-300 md:text-sm">
                imageforge ./public/images -f webp,avif
              </p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                Example run includes hash-based cache support and blur placeholder
                generation enabled in the workflow.
              </p>
            </article>
          </MotionWrap>
          <MotionWrap delayMs={180}>
            <article className="panel-card h-full p-6">
              <h3 className="text-lg font-semibold text-zinc-100">
                What 77% and 2.1s Mean
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                <strong>77%</strong> is the size reduction from 8.4 MB input to
                1.9 MB generated outputs in that sample run. <strong>2.1s</strong>{" "}
                is the total reported duration for that single example run.
              </p>
            </article>
          </MotionWrap>
        </div>
      </div>
    </section>
  );
}
