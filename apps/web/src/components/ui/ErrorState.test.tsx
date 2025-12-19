import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ErrorState } from "./ErrorState";

describe("ErrorState", () => {
  it("should render default title and message", () => {
    render(<ErrorState />);

    expect(screen.getByText("Erro ao carregar")).toBeInTheDocument();
    expect(screen.getByText("Ocorreu um erro ao carregar os dados. Tente novamente.")).toBeInTheDocument();
  });

  it("should render custom title and message", () => {
    render(<ErrorState title="Custom Error" message="Something went wrong" />);

    expect(screen.getByText("Custom Error")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("should render retry button when onRetry is provided", () => {
    const handleRetry = vi.fn();
    render(<ErrorState onRetry={handleRetry} />);

    const button = screen.getByRole("button", { name: /tentar novamente/i });
    expect(button).toBeInTheDocument();

    button.click();
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it("should not render retry button when onRetry is not provided", () => {
    render(<ErrorState />);

    const button = screen.queryByRole("button", { name: /tentar novamente/i });
    expect(button).not.toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(<ErrorState className="custom-class" />);

    expect(container.firstChild).toHaveClass("custom-class");
  });
});


