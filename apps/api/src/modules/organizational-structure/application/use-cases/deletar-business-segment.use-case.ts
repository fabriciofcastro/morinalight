import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import type { BusinessSegmentRepository } from "../../domain/repositories/business-segment-repository";
import { z } from "zod";

type Dependencies = {
  businessSegmentRepository: BusinessSegmentRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

const inputSchema = z.object({
  businessSegmentId: z.string().uuid(),
});

export class DeletarBusinessSegmentUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = inputSchema.parse(rawInput);

    const businessSegment = await this.deps.businessSegmentRepository.findById(
      input.businessSegmentId,
    );

    if (!businessSegment) {
      throw new Error("Segmento de negócio não encontrado");
    }

    // Desativar ao invés de deletar fisicamente para manter histórico
    businessSegment.desativar();
    await this.deps.businessSegmentRepository.save(businessSegment);

    // Publicar evento
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "OrganizationalStructure.BusinessSegmentDeleted",
        version: "v1",
        metadata: {
          eventId: randomUUID(),
          orgId: businessSegment.dados.orgId,
          actorId: this.deps.actorId,
          timestamp: new Date(),
        },
        payload: {
          businessSegmentId: businessSegment.businessSegmentId,
        },
      });
    }
  }
}
