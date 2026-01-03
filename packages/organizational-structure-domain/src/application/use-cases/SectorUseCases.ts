import { ISectorRepository } from "../../entities/repositories/ISectorRepository";
import { Sector, SectorSchema } from "../../entities/Sector";

export class CreateSector {
    constructor(private repo: ISectorRepository) { }

    async execute(data: Sector): Promise<Sector> {
        const validated = SectorSchema.parse(data);
        return this.repo.create(validated as Sector);
    }
}

export class UpdateSector {
    constructor(private repo: ISectorRepository) { }

    async execute(id: string, data: Partial<Sector>): Promise<Sector> {
        return this.repo.update(id, data);
    }
}

export class DeleteSector {
    constructor(private repo: ISectorRepository) { }

    async execute(id: string): Promise<void> {
        return this.repo.delete(id);
    }
}
