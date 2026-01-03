import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingState } from "./LoadingState";

describe("LoadingState", () => {
  it("should render default message", () => {
    render(<LoadingState />);

    expect(screen.getByText("Carregando...")).toBeInTheDocument();
  });

  it("should render custom message", () => {
    render(<LoadingState message="Loading users..." />);

    expect(screen.getByText("Loading users...")).toBeInTheDocument();
  });

  it("should render spinner", () => {
    const { container } = render(<LoadingState />);

    const spinner = container.querySelector('[class*="animate-spin"]');
    expect(spinner).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(<LoadingState className="custom-class" />);

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("should render different sizes", () => {
    const { container: small } = render(<LoadingState size="sm" />);
    const { container: large } = render(<LoadingState size="lg" />);

    expect(small.firstChild).toBeInTheDocument();
    expect(large.firstChild).toBeInTheDocument();
  });
});


