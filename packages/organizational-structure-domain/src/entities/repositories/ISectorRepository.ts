import { Sector } from "../Sector";

export interface ISectorRepository {
    findAll(): Promise<Sector[]>;
    findById(id: string): Promise<Sector | null>;
    create(sector: Sector): Promise<Sector>;
    update(id: string, sector: Partial<Sector>): Promise<Sector>;
    delete(id: string): Promise<void>;
}
