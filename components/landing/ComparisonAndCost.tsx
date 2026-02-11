import { MotionWrap } from "@/components/landing/MotionWrap";
import {
  COMPARISON_ROWS,
  PRICING_AS_OF,
  PRICING_SOURCES,
} from "@/components/landing/constants";

function findSourceLabel(id: string) {
  return PRICING_SOURCES.find((source) => source.id === id)?.label ?? id;
}

function findSourceUrl(id: string) {
  return PRICING_SOURCES.find((source) => source.id === id)?.url ?? "#";
}

function SourceLinks({ ids }: { ids: string[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
      {ids.map((id) => (
        <a
          key={id}
          href={findSourceUrl(id)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-emerald-300/90 transition hover:text-emerald-200"
        >
          [{findSourceLabel(id)}]
        </a>
      ))}
    </div>
  );
}

export function ComparisonAndCost() {
  return (
    <section
      id="comparison"
      className="border-b border-white/10 py-20 md:py-28"
    >
      <div className="section-shell">
        <MotionWrap>
          <h2 className="text-center text-3xl font-semibold tracking-tight text-zinc-100 md:text-[2.65rem]">
            Comparison and cost
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-sm leading-relaxed text-zinc-400 md:text-base">
            Direct factual comparison of ImageForge, Vercel Image Optimization,
            Cloudinary, and imgix. Pricing references are shown inline and dated
            for context.
          </p>
          <p className="mx-auto mt-3 max-w-3xl text-center font-mono text-xs tracking-[0.1em] text-zinc-500 uppercase">
            As of {PRICING_AS_OF}
          </p>
        </MotionWrap>

        <MotionWrap className="mt-10" delayMs={120}>
          <div className="hidden overflow-x-auto md:block">
            <table className="panel-card w-full min-w-[940px] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="px-4 py-3 font-mono text-xs tracking-[0.12em] text-zinc-400 uppercase">
                    Capability
                  </th>
                  <th className="px-4 py-3 font-mono text-xs tracking-[0.12em] text-emerald-300 uppercase">
                    ImageForge
                  </th>
                  <th className="px-4 py-3 font-mono text-xs tracking-[0.12em] text-zinc-400 uppercase">
                    Vercel Image Optimization
                  </th>
                  <th className="px-4 py-3 font-mono text-xs tracking-[0.12em] text-zinc-400 uppercase">
                    Cloudinary
                  </th>
                  <th className="px-4 py-3 font-mono text-xs tracking-[0.12em] text-zinc-400 uppercase">
                    imgix
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr
                    key={row.capability}
                    className="border-b border-white/8 last:border-b-0"
                  >
                    <th className="px-4 py-4 align-top text-sm font-medium text-zinc-200">
                      <p>{row.capability}</p>
                      {row.sourceIds ? (
                        <SourceLinks ids={row.sourceIds} />
                      ) : null}
                    </th>
                    <td className="px-4 py-4 align-top text-sm text-zinc-300">
                      {row.imageforge}
                    </td>
                    <td className="px-4 py-4 align-top text-sm text-zinc-400">
                      {row.vercel}
                    </td>
                    <td className="px-4 py-4 align-top text-sm text-zinc-400">
                      {row.cloudinary}
                    </td>
                    <td className="px-4 py-4 align-top text-sm text-zinc-400">
                      {row.imgix}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 md:hidden">
            {COMPARISON_ROWS.map((row) => (
              <article key={row.capability} className="panel-card p-4">
                <h3 className="text-base font-semibold text-zinc-100">
                  {row.capability}
                </h3>
                {row.sourceIds ? <SourceLinks ids={row.sourceIds} /> : null}
                <dl className="mt-3 space-y-2 text-sm">
                  <div>
                    <dt className="font-mono text-[0.68rem] tracking-[0.12em] text-emerald-300 uppercase">
                      ImageForge
                    </dt>
                    <dd className="text-zinc-300">{row.imageforge}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[0.68rem] tracking-[0.12em] text-zinc-500 uppercase">
                      Vercel Image Optimization
                    </dt>
                    <dd className="text-zinc-400">{row.vercel}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[0.68rem] tracking-[0.12em] text-zinc-500 uppercase">
                      Cloudinary
                    </dt>
                    <dd className="text-zinc-400">{row.cloudinary}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[0.68rem] tracking-[0.12em] text-zinc-500 uppercase">
                      imgix
                    </dt>
                    <dd className="text-zinc-400">{row.imgix}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </MotionWrap>

        <MotionWrap className="mx-auto mt-5 max-w-4xl" delayMs={180}>
          <p className="text-center text-xs leading-relaxed text-zinc-500">
            Illustrative scenario values are directional and depend on plan,
            region, and request patterns. Use provider calculators and account
            analytics for exact billing projections.
          </p>
        </MotionWrap>
      </div>
    </section>
  );
}
