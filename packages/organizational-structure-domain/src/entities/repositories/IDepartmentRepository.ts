import { Department } from "../Department";

export interface IDepartmentRepository {
    findAll(): Promise<Department[]>;
    findById(id: string): Promise<Department | null>;
    create(department: Department): Promise<Department>;
    update(id: string, department: Partial<Department>): Promise<Department>;
    delete(id: string): Promise<void>;
}
