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
            Optimize once, deploy everywhere,{" "}
            <span className="text-emerald-300">pay nothing monthly</span>.
          </h1>
        </MotionWrap>

        <MotionWrap className="mt-6 max-w-3xl" delayMs={140}>
          <p className="text-lg leading-relaxed text-pretty text-zinc-300 md:text-[1.25rem] md:leading-relaxed">
            ImageForge is a <strong>build-time</strong> image pipeline that
            pre-generates <strong>WebP/AVIF</strong> assets, writes{" "}
            <code className="font-mono text-zinc-100">imageforge.json</code>,
            and enforces freshness in CI with{" "}
            <code className="font-mono text-zinc-100">--check</code>.
          </p>
        </MotionWrap>

        <MotionWrap className="mt-9 max-w-5xl" delayMs={220}>
          <InstallCommands />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <a
              href="https://www.npmjs.com/package/@imageforge/cli"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md border border-emerald-300/45 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:border-emerald-200 hover:bg-emerald-300/20 hover:text-emerald-100"
            >
              Get Started (npm)
            </a>
            <a
              href="https://github.com/f-campana/imageforge"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-white/35 hover:bg-white/10 hover:text-white"
            >
              Read Docs (GitHub)
            </a>
          </div>
        </MotionWrap>

        <MotionWrap className="mt-12 md:mt-16" delayMs={280}>
          <TerminalDemo />
        </MotionWrap>
      </div>
    </section>
  );
}
