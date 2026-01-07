import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BulkActionsBar } from "./bulk-actions-bar-enhanced";

describe("BulkActionsBar", () => {
    const actions = [
        { label: "Action 1", onClick: vi.fn() },
        { label: "Action 2", onClick: vi.fn() },
    ];

    it("renders when selectedCount > 0", () => {
        render(<BulkActionsBar selectedCount={5} actions={actions} onCancel={() => { }} />);
        expect(screen.getByText("5 itens selecionados")).toBeInTheDocument();
        expect(screen.getByText("Action 1")).toBeInTheDocument();
    });

    it("does not render when selectedCount is 0", () => {
        const { container } = render(<BulkActionsBar selectedCount={0} actions={actions} onCancel={() => { }} />);
        expect(container.firstChild).toBeNull();
    });

    it("calls action onClick when clicked", () => {
        render(<BulkActionsBar selectedCount={1} actions={actions} onCancel={() => { }} />);
        fireEvent.click(screen.getByText("Action 1"));
        expect(actions[0]!.onClick).toHaveBeenCalled();
    });

    it("calls onCancel when cancel clicked", () => {
        const handleCancel = vi.fn();
        render(<BulkActionsBar selectedCount={1} actions={actions} onCancel={handleCancel} />);
        fireEvent.click(screen.getByText("Cancelar"));
        expect(handleCancel).toHaveBeenCalled();
    });
});
