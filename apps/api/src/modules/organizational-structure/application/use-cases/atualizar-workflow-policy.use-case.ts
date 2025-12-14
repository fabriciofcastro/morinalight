import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import type { WorkflowPolicyRepository } from "../../domain/repositories/workflow-policy-repository";
import {
  atualizarWorkflowPolicyInputSchema,
  workflowPolicyViewSchema,
} from "../schemas/workflow-policy.schema";

type Dependencies = {
  workflowPolicyRepository: WorkflowPolicyRepository;
  eventBus?: DomainEventBus;
  actorId: string;
};

export class AtualizarWorkflowPolicyUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = atualizarWorkflowPolicyInputSchema.parse(rawInput);

    const workflowPolicy = await this.deps.workflowPolicyRepository.findById(input.id);

    if (!workflowPolicy) {
      throw new Error("Política de workflow não encontrada");
    }

    workflowPolicy.atualizarDados({
      module: input.module,
      flowType: input.flowType,
      config: input.config,
      active: input.active,
    });

    await this.deps.workflowPolicyRepository.save(workflowPolicy);

    // Publicar evento
    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "OrganizationalStructure.WorkflowPolicyUpdated",
        version: "v1",
        metadata: {
          eventId: randomUUID(),
          orgId: workflowPolicy.dados.orgId,
          actorId: this.deps.actorId,
          timestamp: new Date(),
        },
        payload: {
          workflowPolicyId: workflowPolicy.workflowPolicyId,
          module: workflowPolicy.dados.module,
          flowType: workflowPolicy.dados.flowType,
        },
      });
    }

    return workflowPolicyViewSchema.parse({
      id: workflowPolicy.workflowPolicyId,
      orgId: workflowPolicy.dados.orgId,
      module: workflowPolicy.dados.module,
      flowType: workflowPolicy.dados.flowType,
      config: workflowPolicy.dados.config,
      active: workflowPolicy.dados.active,
      createdAt: workflowPolicy.dados.createdAt,
      updatedAt: workflowPolicy.dados.updatedAt,
    });
  }
}
