import { Position } from "../Position";

export interface IPositionRepository {
    findAll(): Promise<Position[]>;
    findById(id: string): Promise<Position | null>;
    create(position: Position): Promise<Position>;
    update(id: string, position: Partial<Position>): Promise<Position>;
    delete(id: string): Promise<void>;
}
