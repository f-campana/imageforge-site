import { renderHook, waitFor } from "@testing-library/react";
import { act } from "react";
import { describe, expect, it, vi } from "vitest";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type MediaQueryChangeListener = (event: MediaQueryListEvent) => void;

function createMediaQueryList(initialValue: boolean) {
  const listeners = new Set<MediaQueryChangeListener>();

  const mediaQueryList = {
    media: "(prefers-reduced-motion: reduce)",
    matches: initialValue,
    onchange: null,
    addEventListener: vi.fn(
      (event: string, listener: MediaQueryChangeListener) => {
        if (event === "change") {
          listeners.add(listener);
        }
      },
    ),
    removeEventListener: vi.fn(
      (event: string, listener: MediaQueryChangeListener) => {
        if (event === "change") {
          listeners.delete(listener);
        }
      },
    ),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList;

  return {
    mediaQueryList,
    emit(nextValue: boolean) {
      Object.defineProperty(mediaQueryList, "matches", {
        configurable: true,
        value: nextValue,
      });

      const event = {
        media: "(prefers-reduced-motion: reduce)",
        matches: nextValue,
      } as MediaQueryListEvent;

      for (const listener of listeners) {
        listener(event);
      }
    },
  };
}

describe("usePrefersReducedMotion", () => {
  it("reflects media query state and updates on change", async () => {
    const query = createMediaQueryList(false);
    const matchMedia = vi.fn().mockReturnValue(query.mediaQueryList);
    vi.stubGlobal("matchMedia", matchMedia);

    const { result, unmount } = renderHook(() => usePrefersReducedMotion());

    await waitFor(() => {
      expect(result.current).toBe(false);
    });

    expect(matchMedia).toHaveBeenCalledExactlyOnceWith(
      "(prefers-reduced-motion: reduce)",
    );
    expect(
      query.mediaQueryList.addEventListener,
    ).toHaveBeenCalledExactlyOnceWith("change", expect.any(Function));

    act(() => {
      query.emit(true);
    });

    expect(result.current).toBe(true);

    const registeredListener = vi.mocked(query.mediaQueryList.addEventListener)
      .mock.calls[0]?.[1];
    unmount();
    expect(
      query.mediaQueryList.removeEventListener,
    ).toHaveBeenCalledExactlyOnceWith("change", registeredListener);
  });
});
