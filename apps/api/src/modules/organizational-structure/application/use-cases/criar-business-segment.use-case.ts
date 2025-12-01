import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import { BusinessSegment } from "../../domain/entities/business-segment";
import type { BusinessSegmentRepository } from "../../domain/repositories/business-segment-repository";
import { businessSegmentViewSchema, criarBusinessSegmentInputSchema } from "../schemas/business-segment.schema";

type Dependencies = {
    businessSegmentRepository: BusinessSegmentRepository;
    eventBus?: DomainEventBus;
    actorId: string;
};

export class CriarBusinessSegmentUseCase {
    constructor(private readonly deps: Dependencies) { }

    async execute(rawInput: unknown) {
        const input = criarBusinessSegmentInputSchema.parse(rawInput);

        const businessSegment = BusinessSegment.criar({
            orgId: input.orgId,
            name: input.name,
            description: input.description ?? null,
            active: input.active,
        });

        await this.deps.businessSegmentRepository.save(businessSegment);

        // Publicar evento
        if (this.deps.eventBus) {
            await this.deps.eventBus.publish({
                name: "OrganizationalStructure.BusinessSegmentCreated",
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
