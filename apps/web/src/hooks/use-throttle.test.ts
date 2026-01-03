import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useThrottle } from "./use-throttle";

describe("useThrottle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should call function immediately on first call", () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useThrottle(mockFn, 300));

    act(() => {
      result.current();
    });

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("should throttle function calls", () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useThrottle(mockFn, 300));

    // First call
    act(() => {
      result.current();
    });
    expect(mockFn).toHaveBeenCalledTimes(1);

    // Second call immediately (should be throttled)
    act(() => {
      result.current();
    });
    expect(mockFn).toHaveBeenCalledTimes(1);

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Should be called now
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it("should pass arguments correctly", () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useThrottle(mockFn, 300));

    act(() => {
      result.current("arg1", "arg2");
    });

    expect(mockFn).toHaveBeenCalledWith("arg1", "arg2");
  });

  it("should handle multiple rapid calls", () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useThrottle(mockFn, 300));

    // Multiple rapid calls
    act(() => {
      result.current();
      result.current();
      result.current();
    });

    expect(mockFn).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Only one more call should be made (the last one)
    expect(mockFn).toHaveBeenCalledTimes(2);
  });
});


