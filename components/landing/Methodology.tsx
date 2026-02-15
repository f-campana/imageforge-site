import { MotionWrap } from "@/components/landing/MotionWrap";
import {
  BENCHMARK_EVIDENCE,
  formatMegabytes,
  reductionPercent,
} from "@/components/landing/benchmark-evidence";

const inputMb = formatMegabytes(BENCHMARK_EVIDENCE.sampleSet.inputBytes);
const outputMb = formatMegabytes(BENCHMARK_EVIDENCE.sampleSet.outputBytes);
const savedPct = reductionPercent(
  BENCHMARK_EVIDENCE.sampleSet.inputBytes,
  BENCHMARK_EVIDENCE.sampleSet.outputBytes,
);

export function Methodology() {
  return (
    <section
      id="methodology"
      className="border-b border-white/10 py-20 md:py-24"
    >
      <div className="section-shell">
        <MotionWrap>
          <h2 className="text-center text-3xl font-semibold tracking-tight text-zinc-100 md:text-[2.65rem]">
            Methodology
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-sm leading-relaxed text-zinc-400 md:text-base">
            Headline benchmark numbers are sourced from a documented benchmark
            evidence record and are updated via monthly claim governance.
          </p>
        </MotionWrap>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <MotionWrap>
            <article className="panel-card h-full p-6">
              <h3 className="text-lg font-semibold text-zinc-100">
                Sample Set
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                {BENCHMARK_EVIDENCE.sampleSet.imageCount.toString()} source
                images with a combined input size of {inputMb}. Output target
                formats are WebP and AVIF under profile{" "}
                {BENCHMARK_EVIDENCE.profileId}.
              </p>
            </article>
          </MotionWrap>

          <MotionWrap delayMs={70}>
            <article className="panel-card h-full p-6">
              <h3 className="text-lg font-semibold text-zinc-100">
                Runtime Environment
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                CLI v{BENCHMARK_EVIDENCE.cliVersion}, Node{" "}
                {BENCHMARK_EVIDENCE.nodeVersion}, {BENCHMARK_EVIDENCE.runner},
                dataset {BENCHMARK_EVIDENCE.datasetVersion}, scenario{" "}
                {BENCHMARK_EVIDENCE.scenario}.
              </p>
            </article>
          </MotionWrap>

          <MotionWrap delayMs={120}>
            <article className="panel-card h-full p-6">
              <h3 className="text-lg font-semibold text-zinc-100">
                Command and Options
              </h3>
              <p className="mt-2 font-mono text-xs leading-relaxed text-zinc-300 md:text-sm">
                {BENCHMARK_EVIDENCE.run.command}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                Benchmark evidence source: {BENCHMARK_EVIDENCE.sourceWorkflow}.
                Manual sync path: monthly governance review.
              </p>
            </article>
          </MotionWrap>

          <MotionWrap delayMs={180}>
            <article className="panel-card h-full p-6">
              <h3 className="text-lg font-semibold text-zinc-100">
                What the Headline Numbers Mean
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                <strong>{savedPct.toString()}%</strong> is the size delta from{" "}
                {inputMb} input to {outputMb} generated outputs in this evidence
                snapshot.{" "}
                <strong>
                  {BENCHMARK_EVIDENCE.run.durationSeconds.toFixed(1)}s
                </strong>{" "}
                is the associated run duration shown in the example output.
              </p>
              <p className="mt-3 text-xs leading-relaxed text-zinc-500">
                As of {BENCHMARK_EVIDENCE.asOfDate}. Owner:{" "}
                {BENCHMARK_EVIDENCE.owner}. Artifact:{" "}
                <a
                  href={BENCHMARK_EVIDENCE.artifactUrl}
                  className="text-emerald-300 transition hover:text-emerald-200"
                >
                  benchmark workflow
                </a>
                .
              </p>
            </article>
          </MotionWrap>
        </div>
      </div>
    </section>
  );
}
