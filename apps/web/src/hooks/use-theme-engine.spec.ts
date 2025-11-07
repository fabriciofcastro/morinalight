import { describe, expect, it } from "vitest";

import { resolveCompanyVideoUrl } from "./use-theme-engine";

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
