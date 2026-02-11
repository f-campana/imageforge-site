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
      <div className="relative mx-auto w-full max-w-6xl px-6 pt-20 pb-16 md:pt-28 md:pb-24">
        <MotionWrap className="max-w-4xl" delayMs={40}>
          <p className="mb-4 inline-flex items-center rounded-full border border-emerald-400/25 bg-emerald-400/8 px-3 py-1 font-mono text-xs tracking-[0.2em] text-emerald-300 uppercase">
            Build-time image pipeline
          </p>
          <h1 className="text-4xl leading-tight font-semibold tracking-tight text-balance text-white md:text-6xl">
            Ship smaller images automatically, with deterministic CI.
          </h1>
        </MotionWrap>

        <MotionWrap className="mt-6 max-w-3xl" delayMs={140}>
          <p className="text-lg leading-relaxed text-pretty text-zinc-300 md:text-xl">
            ImageForge CLI converts JPG/PNG assets to WebP and AVIF at build
            time, generates blurDataURL placeholders, writes{" "}
            <code className="font-mono text-zinc-100">imageforge.json</code>,
            and keeps reruns fast with hash-based caching.
          </p>
        </MotionWrap>

        <MotionWrap className="mt-8 max-w-3xl" delayMs={220}>
          <InstallCommands />
          <a
            href="https://github.com/f-campana/imageforge"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-sm text-zinc-400 transition hover:text-emerald-300"
          >
            Read docs and source on GitHub
          </a>
        </MotionWrap>

        <MotionWrap className="mt-12 md:mt-16" delayMs={280}>
          <TerminalDemo />
        </MotionWrap>
      </div>
    </section>
  );
}
