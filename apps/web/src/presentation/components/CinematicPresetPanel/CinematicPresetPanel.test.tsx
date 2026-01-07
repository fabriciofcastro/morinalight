import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CinematicPresetPanel } from "./index";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("CinematicPresetPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it("should render correctly with default values", () => {
    render(<CinematicPresetPanel />);
    
    expect(screen.getByText(/Modo Cinematic do Cockpit/i)).toBeDefined();
    expect(screen.getByLabelText(/Preset/i)).toBeDefined();
    expect(screen.getByDisplayValue(/Automático/i)).toBeDefined();
  });

  it("should display the description of the selected option", () => {
    render(<CinematicPresetPanel />);
    
    expect(screen.getByText(/Segue o padrão do sistema/i)).toBeDefined();
  });

  it("should update persistent state when changing the preset", () => {
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");
    render(<CinematicPresetPanel />);
    
    const select = screen.getByLabelText(/Preset/i);
    fireEvent.change(select, { target: { value: "on" } });
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith("cinematic_preset", "on");
    expect(dispatchSpy).toHaveBeenCalled();
    expect(screen.getByText(/Efeitos completos/i)).toBeDefined();
  });

  it("should load saved preset from localStorage on mount", async () => {
    localStorageMock.setItem("cinematic_preset", "clean");
    
    render(<CinematicPresetPanel />);
    
    // Use findBy because of queueMicrotask in useEffect
    expect(await screen.findByDisplayValue(/Clean/i)).toBeDefined();
    expect(await screen.findByText(/Menos distração/i)).toBeDefined();
  });
});
