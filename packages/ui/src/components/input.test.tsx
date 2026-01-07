import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Input } from "./input";

describe("Input", () => {
    it("renders correctly", () => {
        render(<Input placeholder="Enter text" />);
        expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
    });

    it("applies validation states correctly", () => {
        const { rerender } = render(<Input validationState="invalid" />);
        expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");

        rerender(<Input validationState="valid" />);
        expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-invalid");
    });
});
