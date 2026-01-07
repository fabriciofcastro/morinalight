import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useEnterpriseSidebar } from "../use-enterprise-sidebar";

// Mocks
// stable parameters object
const mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/dashboard"),
  useSearchParams: vi.fn(() => mockSearchParams),
}));

vi.mock("@/lib/auth/CaslContext", () => ({
  useAbility: vi.fn(() => ({
    can: vi.fn(() => true), // Default allow all
  })),
}));

vi.mock("@/lib/auth/ability", () => ({
  parsePermissionKey: vi.fn((key) => {
      if(!key) return { action: null, subject: null };
      return { action: "read", subject: "all" };
  }),
}));

describe("useEnterpriseSidebar", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return default state", () => {
        const { result } = renderHook(() => useEnterpriseSidebar());

        expect(result.current.searchOpen).toBe(false);
        expect(result.current.sidebarItems.length).toBeGreaterThan(0);
        expect(result.current.pathname).toBe("/dashboard");
    });

    it("should toggle search", () => {
        const { result } = renderHook(() => useEnterpriseSidebar());

        act(() => {
            result.current.setSearchOpen(true);
        });

        expect(result.current.searchOpen).toBe(true);
    });

    it("should identify active path", () => {
        const { result } = renderHook(() => useEnterpriseSidebar());
        
        expect(result.current.isActive("/dashboard")).toBe(true);
        expect(result.current.isActive("/other")).toBe(false);
    });
});
