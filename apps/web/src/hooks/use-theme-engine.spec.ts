import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { resolveCompanyVideoUrl, useThemeEngine } from "./use-theme-engine";

const createMatchMedia = (matches = false) =>
  ({
    matches,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }) as unknown as MediaQueryList;

describe("useThemeEngine - applyThemeVariables", () => {
  beforeEach(() => {
    vi.stubGlobal("matchMedia", createMatchMedia);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        statusText: "OK",
        json: async () => ({}),
      })),
    );

    document.documentElement.removeAttribute("data-theme");
    document.documentElement.className = "";
    document.documentElement.style.cssText = "";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.className = "";
    document.documentElement.style.cssText = "";
    const animationStyle = document.getElementById("alpha-syscore-translucent-sweep");
    if (animationStyle) {
      animationStyle.remove();
    }
  });

  it("aplica tokens Clean Vibrant no modo dark", async () => {
    const { result } = renderHook(() => useThemeEngine());

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.applyThemeVariables("dark", {}, { persist: false });
    });

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.style.getPropertyValue("--bg").trim()).toBe("222 28% 10%");
    expect(document.documentElement.style.getPropertyValue("--bg-gradient")).toContain(
      "linear-gradient",
    );
    expect(document.documentElement.style.getPropertyValue("--primary").trim()).toBe(
      "227 100% 58%",
    );
    expect(document.documentElement.style.getPropertyValue("--primary-color").trim()).toBe(
      "hsl(227 100% 58%)",
    );
  });

  it("converte cores personalizadas para hsl ao aplicar tokens", async () => {
    const { result } = renderHook(() => useThemeEngine());

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.applyThemeVariables(
        "light",
        { primaryColor: "#ff0000", secondaryColor: "#00ff00" },
        { persist: false },
      );
    });

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(document.documentElement.style.getPropertyValue("--primary").trim()).toBe("0 100% 50%");
    expect(document.documentElement.style.getPropertyValue("--secondary").trim()).toBe(
      "120 100% 50%",
    );
    expect(document.documentElement.style.getPropertyValue("--primary-color").trim()).toBe(
      "hsl(0 100% 50%)",
    );
    expect(document.documentElement.style.getPropertyValue("--secondary-color").trim()).toBe(
      "hsl(120 100% 50%)",
    );
  });
});

describe("resolveCompanyVideoUrl", () => {
  it("converte links do YouTube em embed com autoplay", () => {
    const result = resolveCompanyVideoUrl("https://www.youtube.com/watch?v=abc123");
    expect(result).toBe(
      "https://www.youtube.com/embed/abc123?autoplay=1&mute=1&loop=1&controls=0&playlist=abc123",
    );
  });

  it("converte links compactos do YouTube em embed", () => {
    const result = resolveCompanyVideoUrl("https://youtu.be/xyz789");
    expect(result).toBe(
      "https://www.youtube.com/embed/xyz789?autoplay=1&mute=1&loop=1&controls=0&playlist=xyz789",
    );
  });

  it("converte links do Vimeo em embed com background", () => {
    const result = resolveCompanyVideoUrl("https://vimeo.com/123456789");
    expect(result).toBe(
      "https://player.vimeo.com/video/123456789?autoplay=1&muted=1&loop=1&background=1",
    );
  });

  it("retorna null para links inválidos", () => {
    expect(resolveCompanyVideoUrl("notaurl")).toBeNull();
    expect(resolveCompanyVideoUrl("")).toBeNull();
    expect(resolveCompanyVideoUrl(undefined)).toBeNull();
  });
});
