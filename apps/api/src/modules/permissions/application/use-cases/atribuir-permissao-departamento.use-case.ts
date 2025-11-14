import type { DepartmentPermissionRepository } from "../../domain/repositories/department-permission-repository";
import type { DepartmentRepository } from "../../../organizational-structure/domain/repositories/department-repository";
import type { PermissionRepository } from "../../domain/repositories/permission-repository";
import type { PermissionAuditLogRepository } from "../../domain/repositories/permission-audit-log-repository";
import { z } from "zod";
import { randomUUID } from "crypto";

const atribuirPermissaoDepartamentoInputSchema = z.object({
  orgId: z.string().uuid(),
  departmentId: z.string().uuid(),
  permissionId: z.string(), // Pode ser ID ou chave (resource:action)
  granted: z.boolean().default(true),
  reason: z.string().optional(), // Motivo da mudança (opcional)
});

type Dependencies = {
  departmentPermissionRepository: DepartmentPermissionRepository;
  departmentRepository: DepartmentRepository;
  permissionRepository: PermissionRepository;
  auditLogRepository?: PermissionAuditLogRepository;
  actorId: string;
};

export class AtribuirPermissaoDepartamentoUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = atribuirPermissaoDepartamentoInputSchema.parse(rawInput);

    // Verificar se o departamento existe
    const department = await this.deps.departmentRepository.encontrarPorId(
      input.orgId,
      input.departmentId,
    );

    if (!department) {
      throw new Error("Departamento não encontrado");
    }

    // Verificar se a permissão existe (por ID ou chave)
    let permissionId = input.permissionId;
    let permission = await this.deps.permissionRepository.encontrarPorId(input.permissionId);

    if (!permission) {
      // Tentar buscar por chave (resource:action)
      const [resource, action] = input.permissionId.split(":");
      if (resource && action) {
        permission = await this.deps.permissionRepository.encontrarPorChave(resource, action);
        if (permission) {
          permissionId = permission.permissionId;
        }
      }
    } else {
      permissionId = permission.permissionId;
    }

    if (!permission) {
      throw new Error("Permissão não encontrada");
    }

    // Verificar se já existe permissão para este departamento
    const existente =
      await this.deps.departmentPermissionRepository.encontrarPorDepartmentEPermission(
        input.orgId,
        input.departmentId,
        permissionId,
      );

    const previousValue = existente?.granted ?? null;
    const action: "granted" | "denied" | "removed" = input.granted ? "granted" : "denied";

    if (existente) {
      // Atualizar permissão existente
      await this.deps.departmentPermissionRepository.salvar({
        ...existente,
        granted: input.granted,
        updatedBy: this.deps.actorId,
        updatedAt: new Date(),
      });
    } else {
      // Criar nova permissão
      await this.deps.departmentPermissionRepository.salvar({
        id: randomUUID(),
        orgId: input.orgId,
        departmentId: input.departmentId,
        permissionId,
        granted: input.granted,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: this.deps.actorId,
        updatedBy: this.deps.actorId,
      });
    }

    // Registrar auditoria
    if (this.deps.auditLogRepository) {
      await this.deps.auditLogRepository.registrar({
        id: randomUUID(),
        orgId: input.orgId,
        entityType: "department",
        entityId: input.departmentId,
        permissionId,
        action,
        granted: input.granted,
        previousValue,
        actorId: this.deps.actorId,
        reason: input.reason ?? null,
        metadata: {
          permissionKey: permission?.permissionKey || permissionId,
        },
        createdAt: new Date(),
      });
    }

    return {
      success: true,
      departmentId: input.departmentId,
      permissionId,
      granted: input.granted,
    };
  }
}

