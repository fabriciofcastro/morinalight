import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import { z } from "zod";
import type { WorkflowPolicyRepository } from "../../domain/repositories/workflow-policy-repository";

type Dependencies = {
  workflowPolicyRepository: WorkflowPolicyRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

const inputSchema = z.object({
  workflowPolicyId: z.string().uuid(),
});

export class DeletarWorkflowPolicyUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = inputSchema.parse(rawInput);

    const workflowPolicy = await this.deps.workflowPolicyRepository.findById(
      input.workflowPolicyId,
    );

    if (!workflowPolicy) {
      throw new Error("Política de workflow não encontrada");
    }

    // Desativar ao invés de deletar fisicamente para manter histórico
    workflowPolicy.desativar();
    await this.deps.workflowPolicyRepository.save(workflowPolicy);

    // Publicar evento
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "OrganizationalStructure.WorkflowPolicyDeleted",
        version: "v1",
        metadata: {
          eventId: randomUUID(),
          orgId: workflowPolicy.dados.orgId,
          actorId: this.deps.actorId,
          timestamp: new Date(),
        },
        payload: {
          workflowPolicyId: workflowPolicy.workflowPolicyId,
        },
      });
    }
  }
}
