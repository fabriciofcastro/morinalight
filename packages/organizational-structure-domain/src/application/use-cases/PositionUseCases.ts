import { IPositionRepository } from "../../entities/repositories/IPositionRepository";
import { Position, PositionSchema } from "../../entities/Position";

export class CreatePosition {
    constructor(private repo: IPositionRepository) { }

    async execute(data: Position): Promise<Position> {
        const validated = PositionSchema.parse(data);
        return this.repo.create(validated as Position);
    }
}

export class UpdatePosition {
    constructor(private repo: IPositionRepository) { }

    async execute(id: string, data: Partial<Position>): Promise<Position> {
        return this.repo.update(id, data);
    }
}

export class DeletePosition {
    constructor(private repo: IPositionRepository) { }

    async execute(id: string): Promise<void> {
        return this.repo.delete(id);
    }
}
