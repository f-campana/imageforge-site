import Link from "next/link";

import { MotionWrap } from "@/components/landing/MotionWrap";
import { BENCHMARK_SEQUENCE_DELAYS_MS } from "@/lib/animation/config";
import type { SiteBenchmarkSnapshot } from "@/lib/benchmark/types";

type BenchmarkPageContentProps = {
  latest: SiteBenchmarkSnapshot | null;
  history: SiteBenchmarkSnapshot[];
};

const PROFILE_COLORS: Record<string, string> = {
  P1: "bg-sky-400/85",
  P2: "bg-emerald-400/85",
  P3: "bg-cyan-300/85",
};

const BENCHMARK_CARD_INTERACTION_CLASS = "ui-interact-card";
const BENCHMARK_TABLE_ROW_INTERACTION_CLASS =
  "border-b border-white/8 transition-colors duration-150 hover:bg-white/[0.02]";
const BENCHMARK_CONTROL_INTERACTION_CLASS = "ui-interact-control ui-focus-ring";
const BENCHMARK_LINK_INTERACTION_CLASS = "ui-interact-link ui-focus-ring";

function formatNumber(value: number, digits = 2): string {
  return Number.isFinite(value) ? value.toFixed(digits) : "0.00";
}

function formatMs(value: number): string {
  if (!Number.isFinite(value)) return "0 ms";
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)} s`;
  }
  return `${value.toFixed(1)} ms`;
}

function formatPct(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function metricClass(value: number): string {
  if (value < 0) return "text-emerald-300";
  if (value > 0) return "text-amber-300";
  return "text-zinc-300";
}

function pickHeadlineMetrics(snapshot: SiteBenchmarkSnapshot) {
  const profileId = snapshot.benchmark.headline.profileId;
  const scenario = snapshot.benchmark.headline.scenario;
  const metrics = snapshot.profileScenarioMetrics?.[profileId]?.[scenario];
  if (metrics) {
    return {
      profileId,
      scenario,
      metrics,
    };
  }

  const firstProfile = Object.keys(snapshot.profileScenarioMetrics)[0];
  const firstScenario = firstProfile
    ? Object.keys(snapshot.profileScenarioMetrics[firstProfile] ?? {})[0]
    : undefined;
  const fallbackMetrics =
    firstProfile && firstScenario
      ? snapshot.profileScenarioMetrics[firstProfile]?.[firstScenario]
      : null;

  return {
    profileId: firstProfile ?? "P2",
    scenario: firstScenario ?? "batch-all",
    metrics: fallbackMetrics,
  };
}

function renderBars(
  snapshot: SiteBenchmarkSnapshot,
  metricKey: "coldWallMs" | "warmP50Ms",
  unitLabel: string,
) {
  const scenarios = snapshot.benchmark.scenarios.map((entry) => entry.name);

  return Object.entries(snapshot.profileScenarioMetrics).map(
    ([profileId, scenarioMap]) => {
      const values = scenarios.map(
        (scenario) => scenarioMap?.[scenario]?.[metricKey] ?? 0,
      );
      const max = Math.max(...values, 1);

      return (
        <div key={`${metricKey}-${profileId}`} className="mb-5">
          <p className="mb-2 font-mono text-xs tracking-[0.12em] text-zinc-400 uppercase">
            {profileId}
          </p>
          <div className="space-y-2">
            {scenarios.map((scenario) => {
              const value = scenarioMap?.[scenario]?.[metricKey] ?? 0;
              const width = Math.max(4, Math.round((value / max) * 100));
              const fill = PROFILE_COLORS[profileId] ?? "bg-zinc-400/80";

              return (
                <div
                  key={`${metricKey}-${profileId}-${scenario}`}
                  className="grid grid-cols-[minmax(84px,96px)_minmax(0,1fr)_74px] items-center gap-2 sm:grid-cols-[120px_1fr_92px] sm:gap-3"
                >
                  <p className="truncate text-right font-mono text-[0.68rem] tracking-[0.08em] text-zinc-500 uppercase">
                    {scenario}
                  </p>
                  <div className="h-5 overflow-hidden rounded-sm bg-white/[0.06]">
                    <div
                      className={`h-full ${fill}`}
                      style={{ width: `${width.toString()}%` }}
                    />
                  </div>
                  <p className="text-right font-mono text-[0.68rem] text-zinc-200 sm:text-xs">
                    {metricKey === "coldWallMs"
                      ? formatMs(value)
                      : `${formatNumber(value, 2)} ${unitLabel}`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      );
    },
  );
}

export function BenchmarkPageContent({
  latest,
  history,
}: BenchmarkPageContentProps) {
  if (!latest) {
    return (
      <main className="border-b border-white/10 py-24">
        <div className="section-shell">
          <MotionWrap surface="benchmark">
            <div className="panel-card mx-auto max-w-3xl p-8 text-center md:p-10">
              <p className="font-mono text-[0.72rem] tracking-[0.2em] text-zinc-500 uppercase">
                Benchmark Evidence
              </p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-100 md:text-5xl">
                No approved benchmark snapshot yet.
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-400 md:text-base">
                This page is generated from approved benchmark sync PRs. Once
                the first snapshot is merged, detailed cold/warm performance and
                regression deltas will appear here.
              </p>
              <p className="mt-6">
                <Link
                  href="/"
                  className={`inline-flex rounded-md border border-emerald-300/45 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-200 hover:border-emerald-200 hover:bg-emerald-300/20 hover:text-emerald-100 ${BENCHMARK_CONTROL_INTERACTION_CLASS}`}
                >
                  Back to landing
                </Link>
              </p>
            </div>
          </MotionWrap>
        </div>
      </main>
    );
  }

  const headline = pickHeadlineMetrics(latest);
  const headlineMetrics = headline.metrics;

  const batchThroughput = Object.entries(latest.profileScenarioMetrics)
    .map(([profileId, scenarioMap]) => ({
      profileId,
      throughput: scenarioMap?.["batch-all"]?.warmImagesPerSec ?? 0,
    }))
    .sort((left, right) => right.throughput - left.throughput);

  const peakThroughput = batchThroughput[0]?.throughput ?? 0;
  const maxSpeedup = Math.max(
    ...Object.values(latest.profileScenarioMetrics)
      .flatMap((scenarioMap) => Object.values(scenarioMap))
      .map((entry) => entry.speedup),
    0,
  );

  const recent = history.slice(0, 8);

  return (
    <main>
      <section className="border-b border-white/10 py-16 md:py-20">
        <div className="section-shell">
          <MotionWrap surface="benchmark" mode="static">
            <p className="font-mono text-[0.72rem] tracking-[0.2em] text-zinc-500 uppercase">
              Benchmark Evidence
            </p>
            <h1 className="mt-4 text-4xl leading-tight font-semibold tracking-[-0.03em] text-zinc-100 md:text-6xl">
              Latest approved benchmark snapshot
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-zinc-400 md:text-base">
              Canonical source policy: nightly tier200 on main. Current
              snapshot: {latest.source.eventName} / {latest.source.tier} /{" "}
              {latest.source.refName} on {latest.source.runner} (Node{" "}
              {latest.source.nodeVersion}). Updates are synced via PR and
              require manual review before merge.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-emerald-300/35 bg-emerald-300/10 px-3 py-1 font-mono text-[0.66rem] tracking-[0.08em] text-emerald-200 uppercase">
                {latest.summary.alertCount.toString()} regression alerts
              </span>
              <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 font-mono text-[0.66rem] tracking-[0.08em] text-zinc-300 uppercase">
                snapshot {latest.snapshotId}
              </span>
              <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 font-mono text-[0.66rem] tracking-[0.08em] text-zinc-300 uppercase">
                as of {latest.asOfDate}
              </span>
            </div>
          </MotionWrap>

          <MotionWrap
            surface="benchmark"
            className="mt-10"
            delayMs={BENCHMARK_SEQUENCE_DELAYS_MS.summary}
          >
            <div className="grid gap-4 md:grid-cols-3">
              <div
                className={`panel-card h-full p-5 ${BENCHMARK_CARD_INTERACTION_CLASS}`}
              >
                <p className="font-mono text-[0.68rem] tracking-[0.15em] text-zinc-500 uppercase">
                  Peak throughput
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-100">
                  {formatNumber(peakThroughput)}
                  <span className="ml-1 text-sm font-medium text-zinc-400">
                    img/s
                  </span>
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  batch-all warm cache
                </p>
              </div>
              <div
                className={`panel-card h-full p-5 ${BENCHMARK_CARD_INTERACTION_CLASS}`}
              >
                <p className="font-mono text-[0.68rem] tracking-[0.15em] text-zinc-500 uppercase">
                  Max cold→warm speedup
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-100">
                  {formatNumber(maxSpeedup)}
                  <span className="ml-1 text-sm font-medium text-zinc-400">
                    x
                  </span>
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  across profiles and scenarios
                </p>
              </div>
              <div
                className={`panel-card h-full p-5 ${BENCHMARK_CARD_INTERACTION_CLASS}`}
              >
                <p className="font-mono text-[0.68rem] tracking-[0.15em] text-zinc-500 uppercase">
                  Headline scenario
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-100">
                  {headline.profileId} / {headline.scenario}
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  {headlineMetrics
                    ? `${formatMs(headlineMetrics.coldWallMs)} cold, ${formatNumber(headlineMetrics.warmP50Ms)} ms warm p50`
                    : "Not available"}
                </p>
              </div>
            </div>
          </MotionWrap>
        </div>
      </section>

      <section className="border-b border-white/10 py-16 md:py-20">
        <div className="section-shell">
          <MotionWrap surface="benchmark" mode="static">
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-100 md:text-4xl">
              Cold wall time
            </h2>
            <div
              className={`panel-card mt-6 p-5 md:p-6 ${BENCHMARK_CARD_INTERACTION_CLASS}`}
            >
              {renderBars(latest, "coldWallMs", "ms")}
            </div>
          </MotionWrap>
        </div>
      </section>

      <section className="border-b border-white/10 py-16 md:py-20">
        <div className="section-shell">
          <MotionWrap surface="benchmark" mode="static">
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-100 md:text-4xl">
              Warm p50 wall time
            </h2>
            <div
              className={`panel-card mt-6 p-5 md:p-6 ${BENCHMARK_CARD_INTERACTION_CLASS}`}
            >
              {renderBars(latest, "warmP50Ms", "ms")}
            </div>
          </MotionWrap>
        </div>
      </section>

      <section className="border-b border-white/10 py-16 md:py-20">
        <div className="section-shell">
          <MotionWrap
            surface="benchmark"
            delayMs={BENCHMARK_SEQUENCE_DELAYS_MS.deltas}
          >
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-100 md:text-4xl">
              Head vs base deltas
            </h2>
            <div className="mt-6 grid gap-3 md:hidden">
              {latest.deltas.map((entry) => (
                <article
                  key={`mobile-${entry.profileId}-${entry.scenario}`}
                  className={`panel-card p-4 ${BENCHMARK_CARD_INTERACTION_CLASS}`}
                  data-benchmark-mobile-delta-card="true"
                >
                  <p className="font-mono text-[0.68rem] tracking-[0.12em] text-zinc-500 uppercase">
                    {entry.profileId} / {entry.scenario}
                  </p>
                  <dl className="mt-3 space-y-2">
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <dt className="text-zinc-400">Warm p50</dt>
                      <dd
                        className={`font-mono text-xs ${metricClass(entry.warmP50Pct)}`}
                      >
                        {formatPct(entry.warmP50Pct)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <dt className="text-zinc-400">Warm p95</dt>
                      <dd
                        className={`font-mono text-xs ${metricClass(entry.warmP95Pct)}`}
                      >
                        {formatPct(entry.warmP95Pct)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <dt className="text-zinc-400">Cold</dt>
                      <dd
                        className={`font-mono text-xs ${metricClass(entry.coldPct)}`}
                      >
                        {formatPct(entry.coldPct)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <dt className="text-zinc-400">Alerts</dt>
                      <dd className="max-w-[62%] text-right font-mono text-[0.7rem] text-zinc-400">
                        {entry.alerts.length === 0
                          ? "none"
                          : entry.alerts.join(", ")}
                      </dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
            <div
              className={`panel-card mt-6 hidden overflow-x-auto p-0 md:block ${BENCHMARK_CARD_INTERACTION_CLASS}`}
            >
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03] text-left text-zinc-400">
                    <th className="px-4 py-3 font-mono text-[0.68rem] tracking-[0.12em] uppercase">
                      Profile
                    </th>
                    <th className="px-4 py-3 font-mono text-[0.68rem] tracking-[0.12em] uppercase">
                      Scenario
                    </th>
                    <th className="px-4 py-3 text-right font-mono text-[0.68rem] tracking-[0.12em] uppercase">
                      Warm p50 Δ
                    </th>
                    <th className="px-4 py-3 text-right font-mono text-[0.68rem] tracking-[0.12em] uppercase">
                      Warm p95 Δ
                    </th>
                    <th className="px-4 py-3 text-right font-mono text-[0.68rem] tracking-[0.12em] uppercase">
                      Cold Δ
                    </th>
                    <th className="px-4 py-3 text-right font-mono text-[0.68rem] tracking-[0.12em] uppercase">
                      Alerts
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {latest.deltas.map((entry) => (
                    <tr
                      key={`${entry.profileId}-${entry.scenario}`}
                      className={BENCHMARK_TABLE_ROW_INTERACTION_CLASS}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-zinc-200">
                        {entry.profileId}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-300">
                        {entry.scenario}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-mono text-xs ${metricClass(entry.warmP50Pct)}`}
                      >
                        {formatPct(entry.warmP50Pct)}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-mono text-xs ${metricClass(entry.warmP95Pct)}`}
                      >
                        {formatPct(entry.warmP95Pct)}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-mono text-xs ${metricClass(entry.coldPct)}`}
                      >
                        {formatPct(entry.coldPct)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-zinc-400">
                        {entry.alerts.length === 0
                          ? "none"
                          : entry.alerts.join(",")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </MotionWrap>
        </div>
      </section>

      <section className="border-b border-white/10 py-16 md:py-20">
        <div className="section-shell">
          <MotionWrap
            surface="benchmark"
            delayMs={BENCHMARK_SEQUENCE_DELAYS_MS.throughput}
          >
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-100 md:text-4xl">
              Throughput (batch-all, warm)
            </h2>
            <div
              className={`panel-card mt-6 p-5 md:p-6 ${BENCHMARK_CARD_INTERACTION_CLASS}`}
            >
              {batchThroughput.map((entry) => {
                const width =
                  peakThroughput > 0
                    ? Math.round((entry.throughput / peakThroughput) * 100)
                    : 0;
                const fill =
                  PROFILE_COLORS[entry.profileId] ?? "bg-zinc-400/80";

                return (
                  <div
                    key={entry.profileId}
                    className="mb-3 flex items-center gap-3 last:mb-0"
                  >
                    <p className="w-8 font-mono text-xs text-zinc-300">
                      {entry.profileId}
                    </p>
                    <div className="h-7 flex-1 overflow-hidden rounded-sm bg-white/[0.06]">
                      <div
                        className={`h-full ${fill}`}
                        style={{ width: `${Math.max(4, width).toString()}%` }}
                      />
                    </div>
                    <p className="w-28 text-right font-mono text-xs text-zinc-200">
                      {formatNumber(entry.throughput)} img/s
                    </p>
                  </div>
                );
              })}
            </div>
          </MotionWrap>
        </div>
      </section>

      <section className="border-b border-white/10 py-16 md:py-20">
        <div className="section-shell">
          <MotionWrap
            surface="benchmark"
            delayMs={BENCHMARK_SEQUENCE_DELAYS_MS.recent}
          >
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-100 md:text-4xl">
              Recent approved snapshots
            </h2>
            <div className="mt-6 grid gap-3 md:hidden">
              {recent.map((entry) => (
                <article
                  key={`recent-mobile-${entry.snapshotId}`}
                  className={`panel-card p-4 ${BENCHMARK_CARD_INTERACTION_CLASS}`}
                  data-benchmark-mobile-recent-card="true"
                >
                  <p className="font-mono text-[0.68rem] tracking-[0.12em] text-zinc-500 uppercase">
                    Snapshot
                  </p>
                  <p className="mt-1 font-mono text-sm text-zinc-100">
                    {entry.snapshotId}
                  </p>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-zinc-400">As of</dt>
                      <dd className="text-zinc-300">{entry.asOfDate}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-zinc-400">Tier</dt>
                      <dd className="font-mono text-xs text-zinc-300">
                        {entry.source.tier}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-zinc-400">Alerts</dt>
                      <dd className="font-mono text-xs text-zinc-300">
                        {entry.summary.alertCount.toString()}
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-4">
                    <a
                      href={entry.source.runUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex rounded-md border border-white/20 bg-white/[0.03] px-3 py-1.5 font-mono text-[0.68rem] tracking-[0.08em] text-zinc-200 uppercase hover:border-white/30 hover:text-zinc-100 ${BENCHMARK_CONTROL_INTERACTION_CLASS}`}
                    >
                      Open run
                    </a>
                  </p>
                </article>
              ))}
            </div>
            <div
              className={`panel-card mt-6 hidden overflow-x-auto p-0 md:block ${BENCHMARK_CARD_INTERACTION_CLASS}`}
            >
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03] text-left text-zinc-400">
                    <th className="px-4 py-3 font-mono text-[0.68rem] tracking-[0.12em] uppercase">
                      Snapshot
                    </th>
                    <th className="px-4 py-3 font-mono text-[0.68rem] tracking-[0.12em] uppercase">
                      As of
                    </th>
                    <th className="px-4 py-3 font-mono text-[0.68rem] tracking-[0.12em] uppercase">
                      Tier
                    </th>
                    <th className="px-4 py-3 text-right font-mono text-[0.68rem] tracking-[0.12em] uppercase">
                      Alerts
                    </th>
                    <th className="px-4 py-3 text-right font-mono text-[0.68rem] tracking-[0.12em] uppercase">
                      Run
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((entry) => (
                    <tr
                      key={entry.snapshotId}
                      className={BENCHMARK_TABLE_ROW_INTERACTION_CLASS}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-zinc-200">
                        {entry.snapshotId}
                      </td>
                      <td className="px-4 py-3 text-zinc-300">
                        {entry.asOfDate}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-300">
                        {entry.source.tier}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-zinc-300">
                        {entry.summary.alertCount.toString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <a
                          href={entry.source.runUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`font-mono text-xs text-emerald-300 hover:text-emerald-200 ${BENCHMARK_LINK_INTERACTION_CLASS}`}
                        >
                          open
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <div
                className={`panel-card p-5 ${BENCHMARK_CARD_INTERACTION_CLASS}`}
              >
                <p className="font-mono text-[0.68rem] tracking-[0.12em] text-zinc-500 uppercase">
                  Source workflow
                </p>
                <p className="mt-2 text-sm text-zinc-300">
                  {latest.source.workflowName}
                </p>
                <p className="mt-1 font-mono text-xs text-zinc-500">
                  {latest.source.workflowPath}
                </p>
              </div>
              <div
                className={`panel-card p-5 ${BENCHMARK_CARD_INTERACTION_CLASS}`}
              >
                <p className="font-mono text-[0.68rem] tracking-[0.12em] text-zinc-500 uppercase">
                  Governance owner
                </p>
                <p className="mt-2 text-sm text-zinc-300">{latest.owner}</p>
                <p className="mt-1 font-mono text-xs text-zinc-500">
                  dataset {latest.source.datasetVersion}
                </p>
              </div>
            </div>
          </MotionWrap>
        </div>
      </section>
    </main>
  );
}
