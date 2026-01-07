import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import "@testing-library/jest-dom";

import { GlassCard } from "./glass-card";

describe("GlassCard", () => {
  it("renderiza conteúdo e aplica glow por padrão", () => {
    const { container } = render(
      <GlassCard>
        <span>Energia Orion</span>
      </GlassCard>,
    );

    expect(screen.getByText("Energia Orion")).toBeInTheDocument();
    const card = container.firstElementChild;
    expect(card?.className).toContain(
      "hover:shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.15)]",
    );
  });

  it("permite desativar o glow", () => {
    const { container } = render(
      <GlassCard glow={false}>
        <span>Sem glow</span>
      </GlassCard>,
    );

    const card = container.firstElementChild;
    expect(card?.className).not.toContain(
      "hover:shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.15)]",
    );
  });
});
