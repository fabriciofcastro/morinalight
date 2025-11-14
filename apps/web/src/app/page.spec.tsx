import { render, screen } from "@testing-library/react";

import Home from "./page";

describe("Home", () => {
  it("apresenta headline futurista e CTA", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        name: /futuro operacional sem o peso do erp monolítico/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/o morina light entrega módulos essenciais/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /explorar status operacional/i })).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: /personalizar cockpit/i }).length,
    ).toBeGreaterThanOrEqual(1);
  });
});
