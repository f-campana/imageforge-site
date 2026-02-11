import { MotionWrap } from "@/components/landing/MotionWrap";

export function HeaderNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#06080d]/86 backdrop-blur-md">
      <div className="section-shell flex items-center justify-between py-4 md:py-5">
        <a
          href="#top"
          className="font-mono text-lg font-semibold tracking-tight text-zinc-100"
        >
          imageforge
        </a>
        <MotionWrap
          className="flex items-center gap-5 text-sm text-zinc-400"
          delayMs={120}
        >
          <a href="#features" className="transition hover:text-zinc-100">
            Features
          </a>
          <a
            href="https://github.com/f-campana/imageforge"
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-zinc-100"
          >
            GitHub
          </a>
          <a
            href="https://www.npmjs.com/package/@imageforge/cli"
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-zinc-100"
          >
            npm
          </a>
        </MotionWrap>
      </div>
    </header>
  );
}
