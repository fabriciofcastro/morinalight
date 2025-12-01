import type { WorkflowPolicyRepository } from "../../domain/repositories/workflow-policy-repository";
import {
    listarWorkflowPoliciesInputSchema,
    listarWorkflowPoliciesResultadoSchema,
} from "../schemas/workflow-policy.schema";

type Dependencies = {
    workflowPolicyRepository: WorkflowPolicyRepository;
};

export class ListarWorkflowPoliciesUseCase {
    constructor(private readonly deps: Dependencies) { }

    async execute(rawInput: unknown) {
        const input = listarWorkflowPoliciesInputSchema.parse(rawInput);

        const workflowPolicies = await this.deps.workflowPolicyRepository.findAll({
            orgId: input.orgId,
            busca: input.module || input.flowType, // Use module or flowType as search term if provided
            active: input.active,
        });

        return listarWorkflowPoliciesResultadoSchema.parse({
            itens: workflowPolicies.map((wp) => ({
                id: wp.workflowPolicyId,
                orgId: wp.dados.orgId,
                module: wp.dados.module,
                flowType: wp.dados.flowType,
                config: wp.dados.config,
                active: wp.dados.active,
                createdAt: wp.dados.createdAt,
                updatedAt: wp.dados.updatedAt,
            })),
        });
    }
}
