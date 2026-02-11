import { CodeBlock } from "@/components/landing/CodeBlock";
import { MotionWrap } from "@/components/landing/MotionWrap";
import {
  CI_FAIL_EXAMPLE,
  CI_PASS_EXAMPLE,
} from "@/components/landing/constants";

export function CICheckExample() {
  return (
    <section id="ci" className="border-b border-white/10 py-20 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-6">
        <MotionWrap>
          <h2 className="text-center text-3xl font-semibold tracking-tight text-zinc-100 md:text-4xl">
            CI enforcement with --check
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-zinc-400">
            Use <code className="font-mono text-zinc-200">--check</code> in CI
            to fail when source images need processing and keep output
            deterministic across branches.
          </p>
        </MotionWrap>
        <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-2">
          <MotionWrap delayMs={110}>
            <div>
              <p className="mb-3 font-mono text-xs tracking-[0.16em] text-rose-300 uppercase">
                Failing run
              </p>
              <CodeBlock code={CI_FAIL_EXAMPLE} language="bash" />
            </div>
          </MotionWrap>
          <MotionWrap delayMs={200}>
            <div>
              <p className="mb-3 font-mono text-xs tracking-[0.16em] text-emerald-300 uppercase">
                Passing run
              </p>
              <CodeBlock code={CI_PASS_EXAMPLE} language="bash" />
            </div>
          </MotionWrap>
        </div>
      </div>
    </section>
  );
}
