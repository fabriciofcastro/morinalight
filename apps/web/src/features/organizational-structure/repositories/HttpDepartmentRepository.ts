import { IDepartmentRepository, Department } from "@morina/organizational-structure-domain";
import { getAuthHeadersWithTenant } from "@/lib/auth-client";

export class HttpDepartmentRepository implements IDepartmentRepository {
    private baseUrl = "/api/departments";

    private get headers() {
        return {
            ...getAuthHeadersWithTenant(),
            "Content-Type": "application/json",
        };
    }

    async findAll(): Promise<Department[]> {
        const res = await fetch(this.baseUrl, { headers: this.headers });
        if (!res.ok) throw new Error("Failed to fetch departments");
        const data = await res.json();
        return (data.itens ?? []).map((d: any) => ({
            ...d,
            active: d.status === "ativo",
            departmentId: d.id || d.departmentId,
        }));
    }

    async findById(id: string): Promise<Department | null> {
        const res = await fetch(`${this.baseUrl}/${id}`, { headers: this.headers });
        if (res.status === 404) return null;
        if (!res.ok) throw new Error("Failed to fetch department");
        const d = await res.json();
        return {
            ...d,
            active: d.status === "ativo",
            departmentId: d.id || d.departmentId,
        };
    }

    async create(department: Department): Promise<Department> {
        const res = await fetch(this.baseUrl, {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify({
                ...department,
                status: department.active ? "ativo" : "inativo",
            }),
        });
        if (!res.ok) throw new Error("Failed to create department");
        return res.json();
    }

    async update(id: string, department: Partial<Department>): Promise<Department> {
        const res = await fetch(`${this.baseUrl}/${id}`, {
            method: "PATCH",
            headers: this.headers,
            body: JSON.stringify({
                ...department,
                status: department.active !== undefined ? (department.active ? "ativo" : "inativo") : undefined,
            }),
        });
        if (!res.ok) throw new Error("Failed to update department");
        return res.json();
    }

    async delete(id: string): Promise<void> {
        const res = await fetch(`${this.baseUrl}/${id}`, {
            method: "DELETE",
            headers: this.headers,
        });
        if (!res.ok && res.status !== 204) throw new Error("Failed to delete department");
    }
}
