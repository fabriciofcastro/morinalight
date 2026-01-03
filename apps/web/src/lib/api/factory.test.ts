/**
 * API Factory Tests
 * 
 * Testes para o API factory pattern
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { createTypedApiClient } from "@/lib/api/factory";
import { apiClient } from "@/lib/api/base";

vi.mock("@/lib/api/base", () => ({
    apiClient: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    },
}));

interface TestEntity {
    id: string;
    name: string;
}

describe("createTypedApiClient", () => {
    let client: ReturnType<typeof createTypedApiClient<TestEntity>>;

    beforeEach(() => {
        client = createTypedApiClient<TestEntity>("/test");
        vi.clearAllMocks();
    });

    describe("list", () => {
        it("should call apiClient.get with correct endpoint", async () => {
            const mockData = [{ id: "1", name: "Test" }];
            vi.mocked(apiClient.get).mockResolvedValue(mockData);

            const result = await client.list();

            expect(apiClient.get).toHaveBeenCalledWith("/test", { params: undefined });
            expect(result).toEqual(mockData);
        });

        it("should pass params correctly", async () => {
            const params = { search: "test", page: 1 };
            vi.mocked(apiClient.get).mockResolvedValue([]);

            await client.list(params);

            expect(apiClient.get).toHaveBeenCalledWith("/test", { params });
        });
    });

    describe("get", () => {
        it("should call apiClient.get with ID", async () => {
            const mockData = { id: "1", name: "Test" };
            vi.mocked(apiClient.get).mockResolvedValue(mockData);

            const result = await client.get("1");

            expect(apiClient.get).toHaveBeenCalledWith("/test/1", undefined);
            expect(result).toEqual(mockData);
        });
    });

    describe("create", () => {
        it("should call apiClient.post with data", async () => {
            const newData = { name: "New Test" };
            const mockResponse = { id: "1", ...newData };
            vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

            const result = await client.create(newData);

            expect(apiClient.post).toHaveBeenCalledWith("/test", newData, undefined);
            expect(result).toEqual(mockResponse);
        });
    });

    describe("update", () => {
        it("should call apiClient.put with ID and data", async () => {
            const updateData = { name: "Updated" };
            const mockResponse = { id: "1", ...updateData };
            vi.mocked(apiClient.put).mockResolvedValue(mockResponse);

            const result = await client.update("1", updateData);

            expect(apiClient.put).toHaveBeenCalledWith("/test/1", updateData, undefined);
            expect(result).toEqual(mockResponse);
        });
    });

    describe("patch", () => {
        it("should call apiClient.patch with ID and data", async () => {
            const patchData = { name: "Patched" };
            const mockResponse = { id: "1", ...patchData };
            vi.mocked(apiClient.patch).mockResolvedValue(mockResponse);

            const result = await client.patch("1", patchData);

            expect(apiClient.patch).toHaveBeenCalledWith("/test/1", patchData, undefined);
            expect(result).toEqual(mockResponse);
        });
    });

    describe("delete", () => {
        it("should call apiClient.delete with ID", async () => {
            vi.mocked(apiClient.delete).mockResolvedValue(undefined);

            await client.delete("1");

            expect(apiClient.delete).toHaveBeenCalledWith("/test/1", undefined);
        });
    });

    describe("deleteMany", () => {
        it("should call apiClient.post with IDs", async () => {
            const ids = ["1", "2", "3"];
            vi.mocked(apiClient.post).mockResolvedValue(undefined);

            await client.deleteMany(ids);

            expect(apiClient.post).toHaveBeenCalledWith("/test/delete-many", { ids }, undefined);
        });
    });
});
