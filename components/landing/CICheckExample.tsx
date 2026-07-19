import Link from "next/link";

import { CodeBlock } from "@/components/landing/CodeBlock";
import { MotionWrap } from "@/components/landing/MotionWrap";
import {
  CI_FAIL_EXAMPLE,
  CI_PASS_EXAMPLE,
} from "@/components/landing/constants";
import { PUBLISHED_RELEASE_COPY } from "@/lib/docs/release-copy";

export function CICheckExample() {
  return (
    <section id="ci" className="border-b border-white/10 py-20 md:py-28">
      <div className="section-shell">
        <MotionWrap>
          <h2 className="text-center text-3xl font-semibold tracking-tight text-zinc-100 md:text-[2.65rem]">
            CI enforcement with --check
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-zinc-400">
            Use <code className="font-mono text-zinc-200">--check</code> in CI
            to fail when source, cache, or derivative state needs processing
            across branches. {PUBLISHED_RELEASE_COPY.ciCheckCaveat}
          </p>
        </MotionWrap>
        <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-2">
          <MotionWrap delayMs={110}>
            <div>
              <p className="mb-3 font-mono text-[0.68rem] tracking-[0.16em] text-rose-300 uppercase">
                Failing run
              </p>
              <CodeBlock code={CI_FAIL_EXAMPLE} language="bash" />
            </div>
          </MotionWrap>
          <MotionWrap delayMs={200}>
            <div>
              <p className="mb-3 font-mono text-[0.68rem] tracking-[0.16em] text-emerald-300 uppercase">
                Passing run
              </p>
              <CodeBlock code={CI_PASS_EXAMPLE} language="bash" />
            </div>
          </MotionWrap>
        </div>
        <MotionWrap
          className="mx-auto mt-6 max-w-2xl text-center"
          delayMs={240}
        >
          <p className="text-sm text-zinc-400">
            Copy the complete workflow and generated-state policy from the{" "}
            <Link
              href="/docs/ci"
              className="ui-focus-ring font-medium text-emerald-300 underline decoration-emerald-300/40 underline-offset-4 hover:text-emerald-200"
            >
              CI integration guide
            </Link>
            .
          </p>
        </MotionWrap>
      </div>
    </section>
  );
}
