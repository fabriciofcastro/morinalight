import { z } from "zod";

export const SectorSchema = z.object({
    id: z.string().uuid().optional(),
    departmentId: z.string().uuid(),
    name: z.string().min(1, "Nome é obrigatório"),
    code: z.string().min(1, "Código é obrigatório"),
    description: z.string().optional(),
    parentId: z.string().uuid().optional().nullable(),
    active: z.boolean().default(true),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

export type Sector = z.infer<typeof SectorSchema>;

export class SectorEntity {
    constructor(public readonly props: Sector) {
        SectorSchema.parse(props);
    }

    toJSON() {
        return { ...this.props };
    }
}
