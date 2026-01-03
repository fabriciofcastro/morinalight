import { IPositionRepository, Position } from "@morina/organizational-structure-domain";
import { getAuthHeadersWithTenant } from "@/lib/auth-client";

export class HttpPositionRepository implements IPositionRepository {
    private baseUrl = "/api/positions";

    private get headers() {
        return {
            ...getAuthHeadersWithTenant(),
            "Content-Type": "application/json",
        };
    }

    async findAll(): Promise<Position[]> {
        const res = await fetch(this.baseUrl, { headers: this.headers });
        if (!res.ok) throw new Error("Failed to fetch positions");
        const data = await res.json();
        return (data.itens ?? []).map((p: any) => ({
            ...p,
            active: p.status === "ativo",
        }));
    }

    async findById(id: string): Promise<Position | null> {
        const res = await fetch(`${this.baseUrl}/${id}`, { headers: this.headers });
        if (res.status === 404) return null;
        if (!res.ok) throw new Error("Failed to fetch position");
        const p = await res.json();
        return {
            ...p,
            active: p.status === "ativo",
        };
    }

    async create(position: Position): Promise<Position> {
        const res = await fetch(this.baseUrl, {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify({
                ...position,
                status: position.active ? "ativo" : "inativo",
            }),
        });
        if (!res.ok) throw new Error("Failed to create position");
        return res.json();
    }

    async update(id: string, position: Partial<Position>): Promise<Position> {
        const res = await fetch(`${this.baseUrl}/${id}`, {
            method: "PATCH",
            headers: this.headers,
            body: JSON.stringify({
                ...position,
                status: position.active !== undefined ? (position.active ? "ativo" : "inativo") : undefined,
            }),
        });
        if (!res.ok) throw new Error("Failed to update position");
        return res.json();
    }

    async delete(id: string): Promise<void> {
        const res = await fetch(`${this.baseUrl}/${id}`, {
            method: "DELETE",
            headers: this.headers,
        });
        if (!res.ok && res.status !== 204) throw new Error("Failed to delete position");
    }
}
