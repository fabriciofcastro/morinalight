import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdvancedFilter, FilterField } from "./advanced-filter";

// Mock child components that might complicate testing
vi.mock("@/shared/ui/base/date-range-picker", () => ({
  DateRangePicker: () => <div data-testid="date-range-picker">Date Picker</div>,
}));

describe("AdvancedFilter", () => {
  const fields: FilterField[] = [
    { id: "name", label: "Name", type: "text", placeholder: "Filter by name" },
    { id: "status", label: "Status", type: "select", options: [{ value: "active", label: "Active" }] },
  ];

  it("should render filter title and add filter trigger", () => {
    render(<AdvancedFilter fields={fields} />);
    expect(screen.getByText("Filtros Avançados")).toBeInTheDocument();
    expect(screen.getByText("Adicionar filtro")).toBeInTheDocument();
  });

  it("should add a new filter when selected from dropdown", async () => {
    const onValuesChange = vi.fn();
    render(<AdvancedFilter fields={fields} onValuesChange={onValuesChange} />);

    // Open dropdown (SelectTrigger) - usually accessible by combobox role or simple click
    // shadcn Select uses Radix UI
    const trigger = screen.getByText("Adicionar filtro");
    fireEvent.click(trigger);
    
    // Select option "Name"
    const option = await screen.findByText("Name");
    fireEvent.click(option);

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(onValuesChange).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ fieldId: "name", value: null })
    ]));
  });

  it("should update filter values when input changes", async () => {
    const onValuesChange = vi.fn();
    render(
      <AdvancedFilter 
        fields={fields} 
        values={[{ fieldId: "name", value: "" }]} 
        onValuesChange={onValuesChange} 
      />
    );

    const input = screen.getByLabelText("Name");
    fireEvent.change(input, { target: { value: "John" } });

    expect(onValuesChange).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ fieldId: "name", value: "John" })
    ]));
  });

  it("should remove filter when X button is clicked", async () => {
    const onValuesChange = vi.fn();
    render(
      <AdvancedFilter 
        fields={fields} 
        values={[{ fieldId: "name", value: "John" }]} 
        onValuesChange={onValuesChange} 
      />
    );

    // Find the remove button for the "Name" filter
    const removeBtn = screen.getByRole("button", { name: "" }); // Button with X icon usually has no accessible name if not provided
    // Better way: find parent div of the input then find the button inside
    const input = screen.getByLabelText("Name");
    const container = input.closest(".flex.items-end");
    const button = within(container as HTMLElement).getByRole("button");
    
    fireEvent.click(button);

    expect(onValuesChange).toHaveBeenCalledWith([]);
    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
  });

  it("should save configuration", () => {
    const onSave = vi.fn();
    render(
      <AdvancedFilter 
        fields={fields} 
        values={[{ fieldId: "name", value: "John" }]} 
        onSave={onSave}
      />
    );

    const saveBtn = screen.getByText("Salvar Filtros");
    fireEvent.click(saveBtn);

    const nameInput = screen.getByPlaceholderText("Nome da configuração");
    fireEvent.change(nameInput, { target: { value: "My Filter" } });

    const confirmBtn = screen.getByText("Salvar");
    fireEvent.click(confirmBtn);

    expect(onSave).toHaveBeenCalledWith("My Filter", expect.any(Array));
  });
});
