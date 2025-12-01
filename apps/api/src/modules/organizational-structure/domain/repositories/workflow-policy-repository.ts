import type { WorkflowPolicy } from "../entities/workflow-policy";

export type WorkflowPolicyFiltro = {
    orgId: string;
    busca?: string;
    active?: boolean;
};

export interface WorkflowPolicyRepository {
    save(workflowPolicy: WorkflowPolicy): Promise<void>;
    findById(id: string): Promise<WorkflowPolicy | null>;
    findAll(filtro: WorkflowPolicyFiltro): Promise<WorkflowPolicy[]>;
    delete(id: string): Promise<void>;
}
