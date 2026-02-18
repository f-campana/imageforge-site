import fs from "node:fs";
import path from "node:path";

type MotionMode = "default" | "reduced";

type MatrixRow = {
  route: string;
  viewport: string;
  width: number;
  height: number;
  motionMode: MotionMode;
  hasRootOverflow: boolean;
  scrollWidth: number;
  innerWidth: number;
  prefersReducedMotionMatch: boolean;
  motionWrapCount: number;
  heroClaimPresent: boolean | null;
  primaryCtaPresent: boolean | null;
  primaryCtaHref: string | null;
  benchmarkHeadingPresent: boolean | null;
};

type MatrixOutput = {
  generatedAt: string;
  baseUrl: string;
  routes: string[];
  rows: MatrixRow[];
};

function readArg(flag: string): string | undefined {
  const index = process.argv.findIndex((entry) => entry === flag);
  if (index < 0) {
    return undefined;
  }

  return process.argv[index + 1];
}

function loadMatrix(filePath: string): MatrixOutput {
  const resolvedPath = path.resolve(process.cwd(), filePath);
  const source = fs.readFileSync(resolvedPath, "utf8");
  const parsed = JSON.parse(source) as Partial<MatrixOutput>;

  if (!Array.isArray(parsed.rows)) {
    throw new Error(`Invalid matrix payload at ${resolvedPath}: rows missing`);
  }

  return {
    generatedAt: String(parsed.generatedAt ?? ""),
    baseUrl: String(parsed.baseUrl ?? ""),
    routes: Array.isArray(parsed.routes) ? parsed.routes.map(String) : [],
    rows: parsed.rows as MatrixRow[],
  };
}

function formatRow(row: MatrixRow): string {
  return `${row.route} ${row.viewport} ${row.motionMode}`;
}

function assertCoreSafety(matrix: MatrixOutput): void {
  const rows = matrix.rows;

  const overflowFailures = rows.filter((row) => row.hasRootOverflow);

  const reducedModeRows = rows.filter((row) => row.motionMode === "reduced");
  const reducedMotionFailures = reducedModeRows.filter(
    (row) => !row.prefersReducedMotionMatch || row.motionWrapCount > 0,
  );

  const landingRows = rows.filter((row) => row.route === "/");
  const criticalContentFailures = landingRows.filter((row) => {
    const hasClaim = row.heroClaimPresent === true;
    const hasPrimaryCta = row.primaryCtaPresent === true;
    const hasCtaHref =
      typeof row.primaryCtaHref === "string" && row.primaryCtaHref.length > 0;
    return !(hasClaim && hasPrimaryCta && hasCtaHref);
  });

  if (
    overflowFailures.length === 0 &&
    reducedMotionFailures.length === 0 &&
    criticalContentFailures.length === 0
  ) {
    process.stdout.write(
      [
        "animation safety gates passed",
        `rows=${rows.length.toString()}`,
        `generatedAt=${matrix.generatedAt}`,
      ].join(" | ") + "\n",
    );
    return;
  }

  process.stderr.write("animation safety gates failed\n");

  if (overflowFailures.length > 0) {
    process.stderr.write(
      `- root overflow failures (${overflowFailures.length.toString()}):\n`,
    );
    for (const row of overflowFailures) {
      process.stderr.write(
        `  - ${formatRow(row)} scrollWidth=${row.scrollWidth.toString()} innerWidth=${row.innerWidth.toString()}\n`,
      );
    }
  }

  if (reducedMotionFailures.length > 0) {
    process.stderr.write(
      `- reduced-motion parity failures (${reducedMotionFailures.length.toString()}):\n`,
    );
    for (const row of reducedMotionFailures) {
      process.stderr.write(
        `  - ${formatRow(row)} prefersReduced=${String(row.prefersReducedMotionMatch)} motionWrapCount=${row.motionWrapCount.toString()}\n`,
      );
    }
  }

  if (criticalContentFailures.length > 0) {
    process.stderr.write(
      `- critical content visibility failures (${criticalContentFailures.length.toString()}):\n`,
    );
    for (const row of criticalContentFailures) {
      process.stderr.write(
        `  - ${formatRow(row)} heroClaim=${String(row.heroClaimPresent)} cta=${String(row.primaryCtaPresent)} href=${row.primaryCtaHref ?? "null"}\n`,
      );
    }
  }

  process.exitCode = 1;
}

try {
  const matrixPath =
    readArg("--matrix") ??
    process.env.ANIMATION_MATRIX_FILE ??
    ".tmp/animation/matrix.json";
  const matrix = loadMatrix(matrixPath);
  assertCoreSafety(matrix);
} catch (error: unknown) {
  const message =
    error instanceof Error ? (error.stack ?? error.message) : String(error);
  process.stderr.write(`animation safety assertion failed: ${message}\n`);
  process.exitCode = 1;
}
