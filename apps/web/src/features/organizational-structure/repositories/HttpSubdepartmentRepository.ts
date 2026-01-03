import { ISubdepartmentRepository, Subdepartment } from "@morina/organizational-structure-domain";
import { getAuthHeadersWithTenant } from "@/lib/auth-client";

export class HttpSubdepartmentRepository implements ISubdepartmentRepository {
    private baseUrl = "/api/subdepartments";

    private get headers() {
        return {
            ...getAuthHeadersWithTenant(),
            "Content-Type": "application/json",
        };
    }

    async findAll(): Promise<Subdepartment[]> {
        // Note: This endpoint might require orgId as a query param in the original code
        const orgId = localStorage.getItem("selected_org_id") || "";
        const url = `${this.baseUrl}?orgId=${orgId}&status=ativo&limite=1000`;
        const res = await fetch(url, { headers: this.headers });
        if (!res.ok) throw new Error("Failed to fetch subdepartments");
        const data = await res.json();
        return data.itens ?? [];
    }

    async findById(id: string): Promise<Subdepartment | null> {
        const res = await fetch(`${this.baseUrl}/${id}`, { headers: this.headers });
        if (res.status === 404) return null;
        if (!res.ok) throw new Error("Failed to fetch subdepartment");
        return res.json();
    }

    async create(subdepartment: Subdepartment): Promise<Subdepartment> {
        const res = await fetch(this.baseUrl, {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify(subdepartment),
        });
        if (!res.ok) throw new Error("Failed to create subdepartment");
        return res.json();
    }

    async update(id: string, subdepartment: Partial<Subdepartment>): Promise<Subdepartment> {
        const res = await fetch(`${this.baseUrl}/${id}`, {
            method: "PATCH",
            headers: this.headers,
            body: JSON.stringify(subdepartment),
        });
        if (!res.ok) throw new Error("Failed to update subdepartment");
        return res.json();
    }

    async delete(id: string): Promise<void> {
        const res = await fetch(`${this.baseUrl}/${id}`, {
            method: "DELETE",
            headers: this.headers,
        });
        if (!res.ok && res.status !== 204) throw new Error("Failed to delete subdepartment");
    }
}
