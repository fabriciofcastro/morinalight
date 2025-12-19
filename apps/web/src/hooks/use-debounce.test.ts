import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "./use-debounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 300));
    expect(result.current).toBe("initial");
  });

  it("should debounce value changes", () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: "initial", delay: 300 },
    });

    expect(result.current).toBe("initial");

    // Change value
    rerender({ value: "changed", delay: 300 });

    // Should still be initial value immediately
    expect(result.current).toBe("initial");

    // Fast-forward time by 299ms (not enough)
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe("initial");

    // Fast-forward remaining 1ms
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe("changed");
  });

  it("should reset timer on rapid changes", () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: "initial", delay: 300 },
    });

    // Rapid changes
    rerender({ value: "change1", delay: 300 });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: "change2", delay: 300 });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: "change3", delay: 300 });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Should still be initial
    expect(result.current).toBe("initial");

    // Complete delay
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("change3");
  });

  it("should work with different delay values", () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: "initial", delay: 100 },
    });

    rerender({ value: "changed", delay: 500 });

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe("initial");

    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current).toBe("changed");
  });
});


