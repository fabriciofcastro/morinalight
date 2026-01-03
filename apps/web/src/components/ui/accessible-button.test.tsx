import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
// Note: You need to install vitest-axe: npm install -D vitest-axe
import { axe, toHaveNoViolations } from "vitest-axe";
import { AccessibleButton } from "./accessible-button";

// Extend Vitest expects
expect.extend(toHaveNoViolations);

describe("AccessibleButton", () => {
    it("should have no accessibility violations when rendered with text", async () => {
        const { container } = render(<AccessibleButton>Click me</AccessibleButton>);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it("should have no violations when icon-only but has aria-label", async () => {
        const { container } = render(
            <AccessibleButton aria-label="Settings">
                <span className="icon-mock" />
            </AccessibleButton>
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it("should render standard HTML button attributes", () => {
        const { getByRole } = render(<AccessibleButton disabled>Click me</AccessibleButton>);
        const button = getByRole("button", { name: /click me/i });
        expect(button).toBeDisabled();
    });
});
