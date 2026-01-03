import { z } from "zod";

export const PositionSchema = z.object({
    id: z.string().uuid().optional(),
    sectorId: z.string().uuid().optional().nullable(), // Position can be directly under a Department in some orgs, but usually Sector. Making optional for flexibility or sticking to strict hierarchy? Assuming strict for now but maybe nullable if directly under dept? Let's check existing code.
    // Looking at existing code, positions seems to be under sectors.
    name: z.string().min(1, "Nome é obrigatório"),
    code: z.string().min(1, "Código é obrigatório"),
    description: z.string().optional(),
    seniority: z.enum(["Junior", "Pleno", "Senior", "Especialista", "Gerente", "Diretor"]).default("Junior"),
    active: z.boolean().default(true),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

export type Position = z.infer<typeof PositionSchema>;

export class PositionEntity {
    constructor(public readonly props: Position) {
        PositionSchema.parse(props);
    }

    toJSON() {
        return { ...this.props };
    }
}
