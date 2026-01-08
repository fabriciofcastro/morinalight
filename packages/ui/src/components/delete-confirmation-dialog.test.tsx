import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";

describe("DeleteConfirmationDialog", () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: "Deletar Item",
    itemName: "Documento X",
  };

  it("renders the title and item name correctly", () => {
    render(<DeleteConfirmationDialog {...defaultProps} />);
    expect(screen.getByText("Deletar Item")).toBeInTheDocument();
    expect(screen.getByText("Documento X")).toBeInTheDocument();
  });

  it("calls onClose when 'Abortar' is clicked", () => {
    render(<DeleteConfirmationDialog {...defaultProps} />);
    fireEvent.click(screen.getByText("Abortar"));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onConfirm when 'Confirmar Exclusão' is clicked", () => {
    render(<DeleteConfirmationDialog {...defaultProps} />);
    fireEvent.click(screen.getByText("Confirmar Exclusão"));
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it("shows loading state and disables buttons", () => {
    render(<DeleteConfirmationDialog {...defaultProps} isLoading={true} />);
    expect(screen.getByText("Processando...")).toBeInTheDocument();
    expect(screen.getByText("Abortar").closest("button")).toBeDisabled();
    expect(screen.getByText("Processando...").closest("button")).toBeDisabled();
  });

  it("renders custom description when provided", () => {
    const customDesc = "Esta é uma descrição customizada.";
    render(<DeleteConfirmationDialog {...defaultProps} description={customDesc} />);
    expect(screen.getByText(customDesc)).toBeInTheDocument();
  });
});
