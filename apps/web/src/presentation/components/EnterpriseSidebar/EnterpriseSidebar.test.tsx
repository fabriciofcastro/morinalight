import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EnterpriseSidebar } from "./index";

// Mock the hook
vi.mock("@/presentation/hooks/use-enterprise-sidebar", () => ({
  useEnterpriseSidebar: vi.fn(() => ({
    pathname: "/dashboard",
    searchOpen: false,
    setSearchOpen: vi.fn(),
    searchInputRef: { current: null },
    searchQuery: "",
    setSearchQuery: vi.fn(),
    sidebarItems: [
        {
            id: "home",
            label: "Executive Dashboard",
            icon: () => null,
            href: "/",
        }
    ],
    hoveredItem: null,
    setHoveredItem: vi.fn(),
    isActive: vi.fn(() => false),
  })),
}));

// Mock @morina/ui Sidebar
vi.mock("@morina/ui", () => ({
    Sidebar: ({ items }: any) => <div data-testid="sidebar-mock">Sidebar Items: {items.length}</div>,
    cn: (inputs: any) => inputs,
}));

// Mock lucide-react
vi.mock("lucide-react", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual as any,
        Building2: () => <svg data-testid="icon-building2" />,
        Search: () => <svg data-testid="icon-search" />,
        X: () => <svg data-testid="icon-x" />,
    };
});

describe("EnterpriseSidebar Component", () => {
  it("renders the sidebar using @morina/ui", () => {
    render(<EnterpriseSidebar />);
    expect(screen.getByTestId("sidebar-mock")).toBeInTheDocument();
    expect(screen.getByText("Sidebar Items: 1")).toBeInTheDocument();
  });
});
