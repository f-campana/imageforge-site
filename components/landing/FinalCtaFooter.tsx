import { InstallCommands } from "@/components/landing/InstallCommands";
import { MotionWrap } from "@/components/landing/MotionWrap";
import { IMAGEFORGE_VERSION } from "@/components/landing/constants";

export function FinalCtaFooter() {
  return (
    <section className="py-20 md:py-28">
      <div className="section-shell">
        <MotionWrap className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-100 md:text-[2.65rem]">
            Build once. Ship fast. Keep costs at zero.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 md:text-base">
            Start with one command, add --check in CI, and keep deterministic
            image outputs in every deployment environment.
          </p>
        </MotionWrap>

        <MotionWrap className="mx-auto mt-8 max-w-xl" delayMs={120}>
          <InstallCommands showHelpText={false} includeRunOnce />
        </MotionWrap>

        <MotionWrap className="mt-5 text-center" delayMs={160}>
          <a
            href="https://github.com/f-campana/imageforge"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm font-medium text-zinc-400 transition hover:text-emerald-300"
          >
            View full docs on GitHub
          </a>
        </MotionWrap>

        <MotionWrap
          className="mt-11 flex flex-wrap items-center justify-center gap-3 text-sm text-zinc-500"
          delayMs={200}
        >
          <a
            href="https://github.com/f-campana/imageforge"
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-zinc-300"
          >
            GitHub
          </a>
          <span>·</span>
          <a
            href="https://www.npmjs.com/package/@imageforge/cli"
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-zinc-300"
          >
            npm
          </a>
          <span>·</span>
          <span className="font-mono">
            @imageforge/cli v{IMAGEFORGE_VERSION}
          </span>
          <span>·</span>
          <span className="font-mono">Node &gt;= 22</span>
        </MotionWrap>
      </div>
    </section>
  );
}
