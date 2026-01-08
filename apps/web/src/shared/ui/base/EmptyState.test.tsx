import { render, screen } from "@testing-library/react";
import { User } from "lucide-react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("should render with title and description", () => {
    render(<EmptyState title="No data" description="There is no data to display" />);

    expect(screen.getByText("No data")).toBeInTheDocument();
    expect(screen.getByText("There is no data to display")).toBeInTheDocument();
  });

  it("should render with icon", () => {
    render(<EmptyState icon={User} title="No users" description="No users found" />);

    const icon = screen.getByTestId("empty-state-icon");
    expect(icon).toBeInTheDocument();
  });

  it("should render action button when provided", () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        title="No data"
        description="No data found"
        action={{ label: "Create", onClick: handleAction }}
      />,
    );

    const button = screen.getByRole("button", { name: "Create" });
    expect(button).toBeInTheDocument();

    button.click();
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it("should apply custom className", () => {
    const { container } = render(
      <EmptyState title="Test" description="Test" className="custom-class" />,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});


