import { render, screen } from "@testing-library/react";

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
    expect(card?.className).toContain("shadow-[var(--shadow-soft)]");
  });

  it("permite desativar o glow", () => {
    const { container } = render(
      <GlassCard glow={false}>
        <span>Sem glow</span>
      </GlassCard>,
    );

    const card = container.firstElementChild;
    expect(card?.className).not.toContain("shadow-[var(--shadow-soft)]");
  });
});
