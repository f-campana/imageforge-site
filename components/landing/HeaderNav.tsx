import { MotionWrap } from "@/components/landing/MotionWrap";
import { NAV_ITEMS } from "@/components/landing/constants";

export function HeaderNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#06080d]/86 backdrop-blur-md">
      <div className="section-shell flex items-center justify-between gap-3 py-4 md:py-5">
        <a
          href="#top"
          className="shrink-0 font-mono text-lg font-semibold tracking-tight text-zinc-100"
        >
          imageforge
        </a>
        <MotionWrap
          className="flex items-center gap-3 text-sm text-zinc-400 md:gap-5"
          delayMs={120}
        >
          <div className="hidden items-center gap-4 md:flex md:gap-5">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="transition hover:text-zinc-100"
              >
                {item.label}
              </a>
            ))}
          </div>
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
            className="hidden transition hover:text-zinc-100 sm:inline"
          >
            npm package
          </a>
        </MotionWrap>
      </div>
    </header>
  );
}
