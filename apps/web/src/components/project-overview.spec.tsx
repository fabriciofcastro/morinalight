import { render, screen } from "@testing-library/react";

import { ProjectOverview } from "./project-overview";

describe("ProjectOverview", () => {
  it("exibe marcos com status e progresso", () => {
    render(<ProjectOverview />);

    expect(screen.getByText(/casos de aprovação prontos/i)).toBeInTheDocument();
    expect(screen.getByText(/portal de login cinematográfico/i)).toBeInTheDocument();
    expect(screen.getByText(/integração de auditoria/i)).toBeInTheDocument();
    expect(screen.getByText(/100% concluído/i)).toBeInTheDocument();
    expect(screen.getByText(/roadmap visível/i)).toBeInTheDocument();
  });
});
