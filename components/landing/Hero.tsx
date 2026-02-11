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
      <div className="section-shell relative pt-24 pb-20 md:pt-32 md:pb-28">
        <MotionWrap className="max-w-4xl" delayMs={40}>
          <h1 className="max-w-3xl text-5xl leading-[1.03] font-semibold tracking-[-0.03em] text-balance text-white md:text-7xl">
            Ship smaller images{" "}
            <span className="text-emerald-300">automatically</span>.
          </h1>
        </MotionWrap>

        <MotionWrap className="mt-6 max-w-3xl" delayMs={140}>
          <p className="text-lg leading-relaxed text-pretty text-zinc-300 md:text-[1.25rem] md:leading-relaxed">
            ImageForge CLI converts JPG/PNG assets to WebP and AVIF at build
            time, generates blurDataURL placeholders, writes{" "}
            <code className="font-mono text-zinc-100">imageforge.json</code>,
            and keeps reruns deterministic with hash-based caching.
          </p>
        </MotionWrap>

        <MotionWrap className="mt-9 max-w-5xl" delayMs={220}>
          <InstallCommands />
          <a
            href="https://github.com/f-campana/imageforge"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-sm font-medium text-zinc-400 transition hover:text-emerald-300"
          >
            View docs on GitHub
          </a>
        </MotionWrap>

        <MotionWrap className="mt-12 md:mt-16" delayMs={280}>
          <TerminalDemo />
        </MotionWrap>
      </div>
    </section>
  );
}
