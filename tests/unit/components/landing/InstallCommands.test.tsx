import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { InstallCommands } from "@/components/landing/InstallCommands";

describe("InstallCommands", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders ARIA tablist and selects npm by default", () => {
    render(<InstallCommands />);

    expect(
      screen.getByRole("tablist", { name: /package managers/i }),
    ).toBeInTheDocument();

    const npmTab = screen.getByRole("tab", { name: "npm" });
    expect(npmTab).toHaveAttribute("aria-selected", "true");
    expect(
      screen.getByText("npm install -g @imageforge/cli"),
    ).toBeInTheDocument();
  });

  it("supports ArrowRight/ArrowLeft/Home/End keyboard behavior with focus handoff", () => {
    render(<InstallCommands />);

    const npmTab = screen.getByRole("tab", { name: "npm" });
    const pnpmTab = screen.getByRole("tab", { name: "pnpm" });
    const bunTab = screen.getByRole("tab", { name: "bun" });

    npmTab.focus();
    fireEvent.keyDown(npmTab, { key: "ArrowRight" });

    expect(pnpmTab).toHaveFocus();
    expect(pnpmTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("pnpm add -g @imageforge/cli")).toBeInTheDocument();

    fireEvent.keyDown(pnpmTab, { key: "End" });
    expect(bunTab).toHaveFocus();
    expect(bunTab).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(bunTab, { key: "Home" });
    expect(npmTab).toHaveFocus();
    expect(npmTab).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(npmTab, { key: "ArrowLeft" });
    expect(bunTab).toHaveFocus();
    expect(bunTab).toHaveAttribute("aria-selected", "true");
  });
});
