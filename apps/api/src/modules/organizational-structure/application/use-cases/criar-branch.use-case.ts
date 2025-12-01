import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import { Branch } from "../../domain/entities/branch";
import type { OrganizationalStructureAuditLogRepository } from "../../domain/repositories";
import type { BranchRepository } from "../../domain/repositories/branch-repository";
import { branchViewSchema, criarBranchInputSchema } from "../schemas/branch.schema";

type Dependencies = {
    branchRepository: BranchRepository;
    auditLogRepository?: OrganizationalStructureAuditLogRepository;
    eventBus?: DomainEventBus;
    actorId: string;
};

export class CriarBranchUseCase {
    constructor(private readonly deps: Dependencies) { }

    async execute(rawInput: unknown) {
        const input = criarBranchInputSchema.parse(rawInput);

        const branch = Branch.criar({
            orgId: input.orgId,
            name: input.name,
            type: input.type,
            internalCode: input.internalCode ?? null,
            cnpj: input.cnpj ?? null,
            stateRegistration: input.stateRegistration ?? null,
            address: input.address ?? null,
            phone: input.phone ?? null,
            email: input.email ?? null,
            active: input.active ?? true,
        });

        await this.deps.branchRepository.save(branch);

        // Registrar auditoria
        if (this.deps.auditLogRepository) {
            await this.deps.auditLogRepository.registrar({
                id: randomUUID(),
                orgId: branch.dados.orgId,
                entityType: "branch", // Assuming 'branch' is valid or I should add it to the type definition
                entityId: branch.branchId,
                action: "created",
                actorId: this.deps.actorId,
                payload: {
                    name: branch.dados.name,
                    type: branch.dados.type,
                },
                createdAt: new Date(),
            });
        }

        // Publicar evento
        if (this.deps.eventBus) {
            await this.deps.eventBus.publish({
                name: "OrganizationalStructure.BranchCreated",
                version: "v1",
                metadata: {
                    eventId: randomUUID(),
                    orgId: branch.dados.orgId,
                    actorId: this.deps.actorId,
                    timestamp: new Date(),
                },
                payload: {
                    branchId: branch.branchId,
                    name: branch.dados.name,
                    type: branch.dados.type,
                    active: branch.dados.active,
                },
            });
        }

        return branchViewSchema.parse({
            branchId: branch.branchId,
            orgId: branch.dados.orgId,
            name: branch.dados.name,
            type: branch.dados.type,
            internalCode: branch.dados.internalCode ?? null,
            cnpj: branch.dados.cnpj ?? null,
            stateRegistration: branch.dados.stateRegistration ?? null,
            address: branch.dados.address ?? null,
            phone: branch.dados.phone ?? null,
            email: branch.dados.email ?? null,
            active: branch.dados.active,
            createdAt: branch.dados.createdAt,
            updatedAt: branch.dados.updatedAt,
        });
    }
}
