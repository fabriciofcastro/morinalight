import { Department } from "./entities/Department";
import { Sector } from "./entities/Sector";
import { IDepartmentRepository } from "./entities/repositories/IDepartmentRepository";
import { ISectorRepository } from "./entities/repositories/ISectorRepository";

export * from "./entities/Department";
export * from "./entities/Sector";
export * from "./entities/Position";
export * from "./entities/Subdepartment";
export * from "./entities/repositories/IDepartmentRepository";
export * from "./entities/repositories/ISectorRepository";
export * from "./entities/repositories/IPositionRepository";
export * from "./entities/repositories/ISubdepartmentRepository";

export * from "./application/use-cases/GetOrganizationalTree";
export * from "./application/use-cases/DepartmentUseCases";
export * from "./application/use-cases/SectorUseCases";
export * from "./application/use-cases/PositionUseCases";

export class MoveDepartment {
    constructor(private repo: IDepartmentRepository) { }
    async execute(id: string, parentId: string | null, reason?: string): Promise<Department> {
        return this.repo.update(id, { parentId, metadata: { reason } } as any);
    }
}

export class MoveSector {
    constructor(private repo: ISectorRepository) { }
    async execute(id: string, parentId: string | null, reason?: string): Promise<Sector> {
        return this.repo.update(id, { parentId, metadata: { reason } } as any);
    }
}
