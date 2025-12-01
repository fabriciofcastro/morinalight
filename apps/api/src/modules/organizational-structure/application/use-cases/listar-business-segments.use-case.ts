import type { BusinessSegmentRepository } from "../../domain/repositories/business-segment-repository";
import {
    listarBusinessSegmentsInputSchema,
    listarBusinessSegmentsResultadoSchema,
} from "../schemas/business-segment.schema";

type Dependencies = {
    businessSegmentRepository: BusinessSegmentRepository;
};

export class ListarBusinessSegmentsUseCase {
    constructor(private readonly deps: Dependencies) { }

    async execute(rawInput: unknown) {
        const input = listarBusinessSegmentsInputSchema.parse(rawInput);

        const businessSegments = await this.deps.businessSegmentRepository.findAll({
            orgId: input.orgId,
            busca: input.busca,
            active: input.active,
        });

        return listarBusinessSegmentsResultadoSchema.parse({
            itens: businessSegments.map((bs) => ({
                id: bs.businessSegmentId,
                orgId: bs.dados.orgId,
                name: bs.dados.name,
                description: bs.dados.description ?? null,
                active: bs.dados.active,
                createdAt: bs.dados.createdAt,
                updatedAt: bs.dados.updatedAt,
            })),
        });
    }
}
