import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useProductsClient } from "../use-products-client";

// Mocks
vi.mock("@/presentation/hooks/use-products", () => ({
  useProducts: vi.fn(() => ({
    data: [{ id: "1", name: "Product 1", status: "ACTIVE" }],
    isLoading: false,
  })),
}));

vi.mock("@/presentation/hooks/use-create-product", () => ({
  useCreateProduct: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
}));

vi.mock("@/presentation/hooks/use-update-product", () => ({
  useUpdateProduct: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
}));

vi.mock("@/presentation/hooks/use-delete-product", () => ({
  useDeleteProduct: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
}));

vi.mock("@/shared/ui/notification-center", () => ({
  notificationCenter: {
    add: vi.fn(),
  },
}));

describe("useProductsClient", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return default state", () => {
        const { result } = renderHook(() => useProductsClient());

        expect(result.current.search).toBe("");
        expect(result.current.statusFilter).toBe("all");
        expect(result.current.viewMode).toBe("grid");
        expect(result.current.products.length).toBe(1);
    });

    it("should handle edit toggle", () => {
        const { result } = renderHook(() => useProductsClient());
        const product = { id: "1", name: "Product 1", status: "ACTIVE" } as any;

        act(() => {
            result.current.handleEdit(product);
        });

        expect(result.current.showForm).toBe(true);
        expect(result.current.editingProduct).toEqual(product);
    });

    it("should handle cancel", () => {
        const { result } = renderHook(() => useProductsClient());

        act(() => {
            result.current.handleEdit({ id: "1" } as any);
            result.current.handleCancel();
        });

        expect(result.current.showForm).toBe(false);
        expect(result.current.editingProduct).toBeNull();
    });
});
