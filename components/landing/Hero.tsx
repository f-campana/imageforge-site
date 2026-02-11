import { InstallCommands } from "@/components/landing/InstallCommands";
import { MotionWrap } from "@/components/landing/MotionWrap";
import { TerminalDemo } from "@/components/landing/TerminalDemo";

export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden border-b border-white/10"
    >
      <div className="hero-grid-overlay" aria-hidden="true" />
      <div className="section-shell relative pt-24 pb-20 md:pt-36 md:pb-32">
        <MotionWrap className="max-w-5xl" delayMs={40}>
          <p className="mb-5 inline-flex items-center rounded-full border border-emerald-300/35 bg-emerald-300/10 px-3 py-1 font-mono text-[0.68rem] tracking-[0.18em] text-emerald-200 uppercase">
            Build-time image pipeline
          </p>
          <h1 className="max-w-4xl text-5xl leading-[1.02] font-semibold tracking-[-0.03em] text-balance text-white md:text-7xl">
            Ship smaller images{" "}
            <span className="text-emerald-300">automatically</span>.
          </h1>
        </MotionWrap>

        <MotionWrap className="mt-7 max-w-3xl" delayMs={140}>
          <p className="text-lg leading-relaxed text-pretty text-zinc-300 md:text-[1.35rem] md:leading-relaxed">
            ImageForge CLI converts JPG/PNG assets to WebP and AVIF at build
            time, generates blurDataURL placeholders, writes{" "}
            <code className="font-mono text-zinc-100">imageforge.json</code>,
            and keeps reruns fast with hash-based caching.
          </p>
        </MotionWrap>

        <MotionWrap className="mt-10 max-w-3xl" delayMs={220}>
          <InstallCommands />
          <a
            href="https://github.com/f-campana/imageforge"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-sm font-medium text-zinc-400 transition hover:text-emerald-300"
          >
            Read docs and source on GitHub
          </a>
        </MotionWrap>

        <MotionWrap className="mt-14 md:mt-20" delayMs={280}>
          <TerminalDemo />
        </MotionWrap>
      </div>
    </section>
  );
}
