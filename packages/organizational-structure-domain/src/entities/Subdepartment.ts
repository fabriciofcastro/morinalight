import { z } from "zod";

export const SubdepartmentSchema = z.object({
    subdepartmentId: z.string().uuid().optional(),
    departmentId: z.string().uuid(),
    name: z.string().min(1, "Nome é obrigatório"),
    code: z.string().min(1, "Código é obrigatório"),
    description: z.string().optional().nullable(),
    parentId: z.string().uuid().optional().nullable(),
    status: z.enum(["ativo", "inativo", "arquivado"]).default("ativo"),
    ordem: z.number().default(0),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

export type Subdepartment = z.infer<typeof SubdepartmentSchema>;

export class SubdepartmentEntity {
    constructor(public readonly props: Subdepartment) {
        SubdepartmentSchema.parse(props);
    }

    toJSON() {
        return { ...this.props };
    }
}
