import Link from "next/link";

import { MotionWrap } from "@/components/landing/MotionWrap";

const DECISION_SUMMARY = [
  {
    title: "Choose build-time generation",
    body: "Use ImageForge for repository-backed assets, fixed responsive candidates, reviewable generated files, and CI freshness enforcement.",
  },
  {
    title: "Choose a managed runtime",
    body: "Keep a managed image service for dynamic uploads, arbitrary transformations, media management, signed URLs, or an integrated delivery control plane.",
  },
  {
    title: "Compare the whole system",
    body: "Include build compute, storage, delivery, cache behavior, transfer, and operational ownership—not only transformation pricing.",
  },
];

export function ComparisonAndCost() {
  return (
    <section
      id="comparison"
      className="border-b border-white/10 py-20 md:py-28"
    >
      <div className="section-shell">
        <MotionWrap>
          <h2 className="text-center text-3xl font-semibold tracking-tight text-zinc-100 md:text-[2.65rem]">
            Choose the processing model that fits
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-sm leading-relaxed text-zinc-400 md:text-base">
            ImageForge is a build-time pipeline, not a replacement for every
            managed media platform. Start with how your images arrive and who
            should own transformation and delivery.
          </p>
        </MotionWrap>

        <div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-3">
          {DECISION_SUMMARY.map((item, index) => (
            <MotionWrap key={item.title} delayMs={index * 70}>
              <article className="panel-card ui-interact-card h-full p-5">
                <h3 className="text-lg font-semibold text-zinc-100">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  {item.body}
                </p>
              </article>
            </MotionWrap>
          ))}
        </div>

        <MotionWrap
          className="mx-auto mt-7 flex max-w-3xl flex-wrap justify-center gap-3 text-sm"
          delayMs={220}
        >
          <Link
            href="/docs/when-to-use"
            className="ui-interact-control ui-focus-ring inline-flex rounded-md border border-white/20 bg-white/5 px-4 py-2 font-medium text-zinc-200 hover:border-white/35 hover:bg-white/10 hover:text-white"
          >
            Check product fit
          </Link>
          <Link
            href="/docs/image-service-comparison"
            className="ui-interact-control ui-focus-ring inline-flex rounded-md border border-emerald-300/45 bg-emerald-300/10 px-4 py-2 font-semibold text-emerald-200 hover:border-emerald-200 hover:bg-emerald-300/20"
          >
            Open the sourced comparison
          </Link>
        </MotionWrap>
      </div>
    </section>
  );
}
