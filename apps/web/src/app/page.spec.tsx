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
    expect(screen.getByText(/morina light acelera módulos críticos/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /conferir blueprint/i })).toBeInTheDocument();
  });
});
