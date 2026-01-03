import { IDepartmentRepository } from "../../entities/repositories/IDepartmentRepository";
import { Department, DepartmentSchema } from "../../entities/Department";

export class CreateDepartment {
    constructor(private repo: IDepartmentRepository) { }

    async execute(data: Department): Promise<Department> {
        const validated = DepartmentSchema.parse(data);
        return this.repo.create(validated as Department);
    }
}

export class UpdateDepartment {
    constructor(private repo: IDepartmentRepository) { }

    async execute(id: string, data: Partial<Department>): Promise<Department> {
        // Basic validation could be done here or in the entity
        return this.repo.update(id, data);
    }
}

export class DeleteDepartment {
    constructor(private repo: IDepartmentRepository) { }

    async execute(id: string): Promise<void> {
        return this.repo.delete(id);
    }
}
