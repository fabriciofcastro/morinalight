import { z } from "zod";

export const DepartmentSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1, "Nome é obrigatório"),
    code: z.string().min(1, "Código é obrigatório"),
    description: z.string().optional(),
    parentId: z.string().uuid().optional().nullable(),
    active: z.boolean().default(true),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

export type Department = z.infer<typeof DepartmentSchema>;

export class DepartmentEntity {
    private props: Department;

    constructor(props: Department) {
        this.props = DepartmentSchema.parse(props);
    }

    get id() { return this.props.id; }
    get name() { return this.props.name; }
    get code() { return this.props.code; }
    get parentId() { return this.props.parentId; }
    get active() { return this.props.active; }

    updateName(name: string) {
        this.props.name = name;
        this.validate();
    }

    private validate() {
        this.props = DepartmentSchema.parse(this.props);
    }

    toJSON() {
        return { ...this.props };
    }
}
