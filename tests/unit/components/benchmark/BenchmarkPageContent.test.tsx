import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BenchmarkPageContent } from "@/components/benchmark/BenchmarkPageContent";
import {
  getBenchmarkHistory,
  getLatestBenchmarkSnapshot,
} from "@/lib/benchmark/load";

describe("BenchmarkPageContent", () => {
  it("renders fallback state when no approved benchmark snapshot exists", () => {
    render(<BenchmarkPageContent latest={null} history={[]} />);

    expect(
      screen.getByRole("heading", {
        name: /No approved benchmark snapshot yet/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: /Back to landing/i,
      }),
    ).toBeInTheDocument();
  });

  it("renders benchmark headline and key sections for a valid snapshot", () => {
    const latest = getLatestBenchmarkSnapshot();
    const history = getBenchmarkHistory();

    if (!latest) {
      throw new Error("Expected benchmark snapshot fixture to be available");
    }

    render(<BenchmarkPageContent latest={latest} history={history} />);

    expect(
      screen.getByRole("heading", {
        name: /Latest approved benchmark snapshot/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Peak throughput/i)).toBeInTheDocument();
    expect(screen.getAllByText(new RegExp(latest.snapshotId))).not.toHaveLength(
      0,
    );
    expect(screen.getByText(/Recent approved snapshots/i)).toBeInTheDocument();
  });
});
