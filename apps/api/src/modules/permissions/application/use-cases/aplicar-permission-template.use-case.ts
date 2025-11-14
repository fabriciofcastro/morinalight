import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { DepartmentRepository } from "../../../organizational-structure/domain/repositories/department-repository";
import type { PositionRepository } from "../../../organizational-structure/domain/repositories/position-repository";
import type { SectorRepository } from "../../../organizational-structure/domain/repositories/sector-repository";
import type { DepartmentPermissionRepository } from "../../domain/repositories/department-permission-repository";
import type { PermissionAuditLogRepository } from "../../domain/repositories/permission-audit-log-repository";
import type { PermissionTemplateRepository } from "../../domain/repositories/permission-template-repository";
import type { PositionPermissionRepository } from "../../domain/repositories/position-permission-repository";
import type { SectorPermissionRepository } from "../../domain/repositories/sector-permission-repository";

const aplicarPermissionTemplateInputSchema = z.object({
  orgId: z.string().uuid(),
  templateId: z.string().uuid(),
  entityType: z.enum(["position", "sector", "department"]),
  entityId: z.string().uuid(),
  reason: z.string().optional(),
});

type Dependencies = {
  templateRepository: PermissionTemplateRepository;
  positionPermissionRepository?: PositionPermissionRepository;
  sectorPermissionRepository?: SectorPermissionRepository;
  departmentPermissionRepository?: DepartmentPermissionRepository;
  positionRepository?: PositionRepository;
  sectorRepository?: SectorRepository;
  departmentRepository?: DepartmentRepository;
  auditLogRepository?: PermissionAuditLogRepository;
  actorId: string;
};

export class AplicarPermissionTemplateUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = aplicarPermissionTemplateInputSchema.parse(rawInput);

    // Buscar template
    const template = await this.deps.templateRepository.encontrarPorId(
      input.orgId,
      input.templateId,
    );

    if (!template) {
      throw new Error("Template não encontrado");
    }

    // Verificar se o template é compatível com o tipo de entidade
    if (template.entityType !== "all" && template.entityType !== input.entityType) {
      throw new Error(
        `Template não é compatível com o tipo de entidade ${input.entityType}. Template é para ${template.entityType}`,
      );
    }

    // Verificar se a entidade existe
    let entityExists = false;
    if (input.entityType === "position" && this.deps.positionRepository) {
      const position = await this.deps.positionRepository.encontrarPorId(
        input.orgId,
        input.entityId,
      );
      entityExists = !!position;
    } else if (input.entityType === "sector" && this.deps.sectorRepository) {
      const sector = await this.deps.sectorRepository.encontrarPorId(input.orgId, input.entityId);
      entityExists = !!sector;
    } else if (input.entityType === "department" && this.deps.departmentRepository) {
      const department = await this.deps.departmentRepository.encontrarPorId(
        input.orgId,
        input.entityId,
      );
      entityExists = !!department;
    }

    if (!entityExists) {
      throw new Error(`${input.entityType} não encontrado`);
    }

    // Aplicar permissões do template
    const applied: Array<{ permissionId: string; granted: boolean }> = [];

    if (input.entityType === "position" && this.deps.positionPermissionRepository) {
      for (const perm of template.permissions) {
        // Buscar permissão existente
        const existente =
          await this.deps.positionPermissionRepository.encontrarPorPositionEPermission(
            input.orgId,
            input.entityId,
            perm.permissionId,
          );

        await this.deps.positionPermissionRepository.salvar({
          id: existente?.id || randomUUID(),
          orgId: input.orgId,
          positionId: input.entityId,
          permissionId: perm.permissionId,
          granted: perm.granted,
          createdAt: existente?.createdAt || new Date(),
          updatedAt: new Date(),
          createdBy: existente?.createdBy || this.deps.actorId,
          updatedBy: this.deps.actorId,
        });

        // Registrar auditoria
        if (this.deps.auditLogRepository) {
          await this.deps.auditLogRepository.registrar({
            id: randomUUID(),
            orgId: input.orgId,
            entityType: "position",
            entityId: input.entityId,
            permissionId: perm.permissionId,
            action: perm.granted ? "granted" : "denied",
            granted: perm.granted,
            previousValue: existente?.granted ?? null,
            actorId: this.deps.actorId,
            reason: input.reason || `Aplicado do template: ${template.name}`,
            metadata: {
              templateId: template.id,
              templateName: template.name,
            },
            createdAt: new Date(),
          });
        }

        applied.push(perm);
      }
    } else if (input.entityType === "sector" && this.deps.sectorPermissionRepository) {
      for (const perm of template.permissions) {
        const existente = await this.deps.sectorPermissionRepository.encontrarPorSectorEPermission(
          input.orgId,
          input.entityId,
          perm.permissionId,
        );

        await this.deps.sectorPermissionRepository.salvar({
          id: existente?.id || randomUUID(),
          orgId: input.orgId,
          sectorId: input.entityId,
          permissionId: perm.permissionId,
          granted: perm.granted,
          createdAt: existente?.createdAt || new Date(),
          updatedAt: new Date(),
          createdBy: existente?.createdBy || this.deps.actorId,
          updatedBy: this.deps.actorId,
        });

        if (this.deps.auditLogRepository) {
          await this.deps.auditLogRepository.registrar({
            id: randomUUID(),
            orgId: input.orgId,
            entityType: "sector",
            entityId: input.entityId,
            permissionId: perm.permissionId,
            action: perm.granted ? "granted" : "denied",
            granted: perm.granted,
            previousValue: existente?.granted ?? null,
            actorId: this.deps.actorId,
            reason: input.reason || `Aplicado do template: ${template.name}`,
            metadata: {
              templateId: template.id,
              templateName: template.name,
            },
            createdAt: new Date(),
          });
        }

        applied.push(perm);
      }
    } else if (input.entityType === "department" && this.deps.departmentPermissionRepository) {
      for (const perm of template.permissions) {
        const existente =
          await this.deps.departmentPermissionRepository.encontrarPorDepartmentEPermission(
            input.orgId,
            input.entityId,
            perm.permissionId,
          );

        await this.deps.departmentPermissionRepository.salvar({
          id: existente?.id || randomUUID(),
          orgId: input.orgId,
          departmentId: input.entityId,
          permissionId: perm.permissionId,
          granted: perm.granted,
          createdAt: existente?.createdAt || new Date(),
          updatedAt: new Date(),
          createdBy: existente?.createdBy || this.deps.actorId,
          updatedBy: this.deps.actorId,
        });

        if (this.deps.auditLogRepository) {
          await this.deps.auditLogRepository.registrar({
            id: randomUUID(),
            orgId: input.orgId,
            entityType: "department",
            entityId: input.entityId,
            permissionId: perm.permissionId,
            action: perm.granted ? "granted" : "denied",
            granted: perm.granted,
            previousValue: existente?.granted ?? null,
            actorId: this.deps.actorId,
            reason: input.reason || `Aplicado do template: ${template.name}`,
            metadata: {
              templateId: template.id,
              templateName: template.name,
            },
            createdAt: new Date(),
          });
        }

        applied.push(perm);
      }
    }

    return {
      success: true,
      templateId: template.id,
      templateName: template.name,
      entityType: input.entityType,
      entityId: input.entityId,
      appliedPermissions: applied.length,
      permissions: applied,
    };
  }
}
