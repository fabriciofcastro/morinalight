import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Button } from "./button";

describe("Button", () => {
    it("renders correctly", () => {
        render(<Button>Click me</Button>);
        expect(screen.getByText("Click me")).toBeInTheDocument();
    });

    it("handles click events", () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click me</Button>);
        fireEvent.click(screen.getByText("Click me"));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("shows loader when isLoading is true", () => {
        render(<Button isLoading>Click me</Button>);
        expect(screen.queryByText("Click me")).not.toBeInTheDocument();
        expect(screen.getByRole("button")).toBeDisabled();
    });

    it("is disabled when disabled prop is true", () => {
        render(<Button disabled>Click me</Button>);
        expect(screen.getByRole("button")).toBeDisabled();
    });
});
