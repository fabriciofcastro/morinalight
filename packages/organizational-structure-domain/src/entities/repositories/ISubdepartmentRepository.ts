import { Subdepartment } from "../Subdepartment";

export interface ISubdepartmentRepository {
    findAll(): Promise<Subdepartment[]>;
    findById(id: string): Promise<Subdepartment | null>;
    create(subdepartment: Subdepartment): Promise<Subdepartment>;
    update(id: string, subdepartment: Partial<Subdepartment>): Promise<Subdepartment>;
    delete(id: string): Promise<void>;
}
