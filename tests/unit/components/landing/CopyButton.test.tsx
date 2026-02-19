import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { act } from "react";
import { describe, expect, it, vi } from "vitest";

import { CopyButton } from "@/components/landing/CopyButton";

describe("CopyButton", () => {
  it("shows Copied state after successful clipboard write and resets", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: {
        writeText,
      },
    });

    render(<CopyButton text="pnpm add -g @imageforge/cli" />);

    const button = screen.getByRole("button", {
      name: /copy code to clipboard/i,
    });
    fireEvent.click(button);

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith("pnpm add -g @imageforge/cli");
      expect(button).toHaveTextContent("Copied");
    });

    await act(async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 1900);
      });
    });

    expect(button).toHaveTextContent("Copy");
  });

  it("shows Unavailable state after failed clipboard write and resets", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("clipboard blocked"));
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: {
        writeText,
      },
    });

    render(<CopyButton text="npm install -g @imageforge/cli" />);

    const button = screen.getByRole("button", {
      name: /copy code to clipboard/i,
    });
    fireEvent.click(button);

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith("npm install -g @imageforge/cli");
      expect(button).toHaveTextContent("Unavailable");
    });

    await act(async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 1900);
      });
    });

    expect(button).toHaveTextContent("Copy");
  });
});
