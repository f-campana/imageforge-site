import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { TerminalDemo } from "@/components/landing/TerminalDemo";

let mockedPrefersReducedMotion: boolean | null = false;

vi.mock("@/hooks/usePrefersReducedMotion", () => ({
  usePrefersReducedMotion: () => mockedPrefersReducedMotion,
}));

class IntersectionObserverMock {
  constructor(private readonly callback: IntersectionObserverCallback) {}

  disconnect() {
    return;
  }

  observe() {
    this.callback(
      [
        {
          isIntersecting: true,
        } as IntersectionObserverEntry,
      ],
      this as unknown as IntersectionObserver,
    );
  }

  unobserve() {
    return;
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  readonly root = null;

  readonly rootMargin = "0px";

  readonly thresholds = [0];
}

describe("TerminalDemo", () => {
  beforeAll(() => {
    vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);
  });

  afterEach(() => {
    mockedPrefersReducedMotion = false;
  });

  it("renders full output immediately in reduced-motion mode", () => {
    mockedPrefersReducedMotion = true;

    render(<TerminalDemo />);

    expect(screen.getByText(/Manifest: imageforge\.json/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /show full output/i }),
    ).not.toBeInTheDocument();
  });

  it("reveals full output when the Show full output control is used", async () => {
    mockedPrefersReducedMotion = false;

    const user = userEvent.setup();

    render(<TerminalDemo />);

    const showButton = screen.getByRole("button", {
      name: /show full output/i,
    });
    await user.click(showButton);

    expect(screen.getByText(/Manifest: imageforge\.json/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /show full output/i }),
    ).not.toBeInTheDocument();
  });
});
