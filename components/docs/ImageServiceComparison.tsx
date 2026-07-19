import {
  COMPARISON_ROWS,
  PRICING_AS_OF,
  PRICING_OWNER,
  PRICING_SOURCES,
} from "@/components/landing/constants";

function getSource(id: string) {
  return PRICING_SOURCES.find((source) => source.id === id);
}

function SourceLinks({ ids }: { ids: string[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
      {ids.map((id) => {
        const source = getSource(id);
        if (!source) return null;

        return (
          <a
            key={source.id}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ui-interact-link ui-focus-ring text-xs text-emerald-300/90 hover:text-emerald-200"
          >
            [{source.label}]
          </a>
        );
      })}
    </div>
  );
}

export function ImageServiceComparison() {
  return (
    <section aria-labelledby="comparison-matrix" className="mt-12">
      <h2
        id="comparison-matrix"
        className="text-2xl font-semibold text-zinc-100"
      >
        Dated comparison matrix
      </h2>
      <p className="mt-3 font-mono text-xs tracking-[0.1em] text-zinc-500 uppercase">
        As of {PRICING_AS_OF} · Owner: {PRICING_OWNER}
      </p>

      <div className="mt-5 hidden w-full max-w-full overflow-x-auto md:block">
        <table className="panel-card w-full min-w-[940px] border-collapse text-left">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              {[
                "Capability",
                "ImageForge",
                "Vercel Image Optimization",
                "Cloudinary",
                "imgix",
              ].map((label) => (
                <th
                  key={label}
                  className="px-4 py-3 font-mono text-xs tracking-[0.12em] text-zinc-400 uppercase first:text-emerald-300"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row) => (
              <tr
                key={row.capability}
                className="border-b border-white/8 last:border-b-0"
              >
                <th className="px-4 py-4 align-top text-sm font-medium text-zinc-200">
                  {row.capability}
                  {row.sourceIds ? <SourceLinks ids={row.sourceIds} /> : null}
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

      <div className="mt-5 grid gap-4 md:hidden">
        {COMPARISON_ROWS.map((row) => (
          <article key={row.capability} className="panel-card p-4">
            <h3 className="text-base font-semibold text-zinc-100">
              {row.capability}
            </h3>
            {row.sourceIds ? <SourceLinks ids={row.sourceIds} /> : null}
            <dl className="mt-3 space-y-2 text-sm">
              {[
                ["ImageForge", row.imageforge],
                ["Vercel Image Optimization", row.vercel],
                ["Cloudinary", row.cloudinary],
                ["imgix", row.imgix],
              ].map(([label, value], index) => (
                <div key={label}>
                  <dt
                    className={`font-mono text-[0.68rem] tracking-[0.12em] uppercase ${
                      index === 0 ? "text-emerald-300" : "text-zinc-500"
                    }`}
                  >
                    {label}
                  </dt>
                  <dd className="text-zinc-300">{value}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
