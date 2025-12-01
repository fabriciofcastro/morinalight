import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import type { BusinessSegmentRepository } from "../../domain/repositories/business-segment-repository";
import { atualizarBusinessSegmentInputSchema, businessSegmentViewSchema } from "../schemas/business-segment.schema";

type Dependencies = {
    businessSegmentRepository: BusinessSegmentRepository;
    eventBus?: DomainEventBus;
    actorId: string;
};

export class AtualizarBusinessSegmentUseCase {
    constructor(private readonly deps: Dependencies) { }

    async execute(rawInput: unknown) {
        const input = atualizarBusinessSegmentInputSchema.parse(rawInput);

        const businessSegment = await this.deps.businessSegmentRepository.findById(input.id);

        if (!businessSegment) {
            throw new Error("Segmento de negócio não encontrado");
        }

        businessSegment.atualizarDados({
            name: input.name,
            description: input.description,
            active: input.active,
        });

        await this.deps.businessSegmentRepository.save(businessSegment);

        // Publicar evento
        if (this.deps.eventBus) {
            await this.deps.eventBus.publish({
                name: "OrganizationalStructure.BusinessSegmentUpdated",
                version: "v1",
                metadata: {
                    eventId: randomUUID(),
                    orgId: businessSegment.dados.orgId,
                    actorId: this.deps.actorId,
                    timestamp: new Date(),
                },
                payload: {
                    businessSegmentId: businessSegment.businessSegmentId,
                    name: businessSegment.dados.name,
                },
            });
        }

        return businessSegmentViewSchema.parse({
            id: businessSegment.businessSegmentId,
            orgId: businessSegment.dados.orgId,
            name: businessSegment.dados.name,
            description: businessSegment.dados.description ?? null,
            active: businessSegment.dados.active,
            createdAt: businessSegment.dados.createdAt,
            updatedAt: businessSegment.dados.updatedAt,
        });
    }
}
