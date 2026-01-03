import { ISectorRepository, Sector } from "@morina/organizational-structure-domain";
import { getAuthHeadersWithTenant } from "@/lib/auth-client";

export class HttpSectorRepository implements ISectorRepository {
    private baseUrl = "/api/sectors";

    private get headers() {
        return {
            ...getAuthHeadersWithTenant(),
            "Content-Type": "application/json",
        };
    }

    async findAll(): Promise<Sector[]> {
        const res = await fetch(this.baseUrl, { headers: this.headers });
        if (!res.ok) throw new Error("Failed to fetch sectors");
        const data = await res.json();
        return (data.itens ?? []).map((s: any) => ({
            ...s,
            active: s.status === "ativo",
        }));
    }

    async findById(id: string): Promise<Sector | null> {
        const res = await fetch(`${this.baseUrl}/${id}`, { headers: this.headers });
        if (res.status === 404) return null;
        if (!res.ok) throw new Error("Failed to fetch sector");
        const s = await res.json();
        return {
            ...s,
            active: s.status === "ativo",
        };
    }

    async create(sector: Sector): Promise<Sector> {
        const res = await fetch(this.baseUrl, {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify({
                ...sector,
                status: sector.active ? "ativo" : "inativo",
            }),
        });
        if (!res.ok) throw new Error("Failed to create sector");
        return res.json();
    }

    async update(id: string, sector: Partial<Sector>): Promise<Sector> {
        const res = await fetch(`${this.baseUrl}/${id}`, {
            method: "PATCH",
            headers: this.headers,
            body: JSON.stringify({
                ...sector,
                status: sector.active !== undefined ? (sector.active ? "ativo" : "inativo") : undefined,
            }),
        });
        if (!res.ok) throw new Error("Failed to update sector");
        return res.json();
    }

    async delete(id: string): Promise<void> {
        const res = await fetch(`${this.baseUrl}/${id}`, {
            method: "DELETE",
            headers: this.headers,
        });
        if (!res.ok && res.status !== 204) throw new Error("Failed to delete sector");
    }
}
