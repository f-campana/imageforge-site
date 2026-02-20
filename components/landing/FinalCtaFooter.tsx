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
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-zinc-400">
            <a
              href="https://github.com/f-campana/imageforge#readme"
              target="_blank"
              rel="noopener noreferrer"
              className="ui-interact-link ui-focus-ring hover:text-emerald-300"
            >
              Docs
            </a>
            <span>·</span>
            <a
              href="https://github.com/f-campana/imageforge/blob/main/CHANGELOG.md"
              target="_blank"
              rel="noopener noreferrer"
              className="ui-interact-link ui-focus-ring hover:text-emerald-300"
            >
              Changelog
            </a>
            <span>·</span>
            <a
              href="https://github.com/f-campana/imageforge/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="ui-interact-link ui-focus-ring hover:text-emerald-300"
            >
              Issues
            </a>
            <span>·</span>
            <a
              href="https://github.com/f-campana/imageforge/blob/main/SECURITY.md"
              target="_blank"
              rel="noopener noreferrer"
              className="ui-interact-link ui-focus-ring hover:text-emerald-300"
            >
              Security
            </a>
          </div>
        </MotionWrap>

        <MotionWrap
          className="mt-11 flex flex-wrap items-center justify-center gap-3 text-sm text-zinc-400"
          delayMs={200}
        >
          <a
            href="https://github.com/f-campana/imageforge"
            target="_blank"
            rel="noopener noreferrer"
            className="ui-interact-link ui-focus-ring hover:text-zinc-200"
          >
            GitHub
          </a>
          <span>·</span>
          <a
            href="https://www.npmjs.com/package/@imageforge/cli"
            target="_blank"
            rel="noopener noreferrer"
            className="ui-interact-link ui-focus-ring hover:text-zinc-200"
          >
            npm package
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
