import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import type { DepartmentRepository } from "../../organizational-structure/domain/repositories/department-repository";
import type { WorkflowPolicyRepository } from "../../organizational-structure/domain/repositories/workflow-policy-repository";
import type { OrganizationRepository } from "../../organizations/repositories/organization.repository";
import { AtribuirPermissaoDepartamentoUseCase } from "../application/use-cases/atribuir-permissao-departamento.use-case";
import { ListarPermissoesDepartamentoUseCase } from "../application/use-cases/listar-permissoes-departamento.use-case";
import type { DepartmentPermissionRepository } from "../domain/repositories/department-permission-repository";
import type { PermissionAuditLogRepository } from "../domain/repositories/permission-audit-log-repository";
import type { PermissionChangeRequestRepository } from "../domain/repositories/permission-change-request-repository";
import type { PermissionRepository } from "../domain/repositories/permission-repository";
import { maybeRequireApprovalForRbacChange } from "./permission-change-requests.route";

type Dependencies = {
  departmentPermissionRepository: DepartmentPermissionRepository;
  departmentRepository: DepartmentRepository;
  permissionRepository: PermissionRepository;
  organizationRepository: OrganizationRepository;
  permissionChangeRequestRepository?: PermissionChangeRequestRepository;
  workflowPolicyRepository?: WorkflowPolicyRepository;
  auditLogRepository?: PermissionAuditLogRepository;
  eventBus?: DomainEventBus;
};

export async function registerDepartmentPermissionsRoute(app: FastifyInstance, deps: Dependencies) {
  // Listar permissões de um departamento
  app.get(
    "/departments/:departmentId/permissions",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const orgId = request.headers["x-org-id"] as string;
      const userId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;

      if (!orgId) {
        return reply.status(400).send({ message: "x-org-id é obrigatório" });
      }

      if (!userId) {
        return reply.status(400).send({ message: "Usuário não identificado" });
      }

      try {
        const { departmentId } = z
          .object({ departmentId: z.string().uuid() })
          .parse(request.params);

        const useCase = new ListarPermissoesDepartamentoUseCase({
          departmentPermissionRepository: deps.departmentPermissionRepository,
          departmentRepository: deps.departmentRepository,
          permissionRepository: deps.permissionRepository,
        });

        const input = { orgId, departmentId };
        const resultado = await useCase.execute(input);

        return reply.status(200).send({ itens: resultado });
      } catch (error) {
        app.log.error(error, "Erro ao listar permissões do departamento");

        if (error instanceof Error) {
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao listar permissões do departamento" });
      }
    },
  );

  // Atribuir/remover permissão a um departamento
  app.post(
    "/departments/:departmentId/permissions",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const orgId = request.headers["x-org-id"] as string;
      const userId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;

      if (!orgId) {
        return reply.status(400).send({ message: "x-org-id é obrigatório" });
      }

      if (!userId) {
        return reply.status(400).send({ message: "Usuário não identificado" });
      }

      try {
        const { departmentId } = z
          .object({ departmentId: z.string().uuid() })
          .parse(request.params);
        const body = z
          .object({
            permissionId: z.string(),
            granted: z.boolean().default(true),
            reason: z.string().optional(),
          })
          .parse(request.body);

        const useCase = new AtribuirPermissaoDepartamentoUseCase({
          departmentPermissionRepository: deps.departmentPermissionRepository,
          departmentRepository: deps.departmentRepository,
          permissionRepository: deps.permissionRepository,
          auditLogRepository: deps.auditLogRepository,
          permissionCacheService: deps.permissionCacheService,
          actorId: userId,
          eventBus: deps.eventBus,
        });

        const input = {
          orgId,
          departmentId,
          permissionId: body.permissionId,
          granted: body.granted,
          reason: body.reason,
        };

        if (deps.permissionChangeRequestRepository && deps.workflowPolicyRepository) {
          const approval = await maybeRequireApprovalForRbacChange({
            workflowPolicyRepository: deps.workflowPolicyRepository,
            permissionChangeRequestRepository: deps.permissionChangeRequestRepository,
            permissionRepository: deps.permissionRepository,
            organizationRepository: deps.organizationRepository,
            orgId,
            actorId: userId,
            entityType: "department",
            entityId: departmentId,
            permissionId: body.permissionId,
            granted: body.granted,
            reason: body.reason,
            eventBus: deps.eventBus,
          });
          if (approval.required) {
            return reply.status(202).send({ pending: true, ...approval });
          }
        }

        const resultado = await useCase.execute(input);

        return reply.status(200).send(resultado);
      } catch (error) {
        app.log.error(error, "Erro ao atribuir permissão ao departamento");

        if (error instanceof Error) {
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao atribuir permissão ao departamento" });
      }
    },
  );

  // Remover permissão de um departamento
  app.delete(
    "/departments/:departmentId/permissions/:permissionId",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const orgId = request.headers["x-org-id"] as string;
      const userId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;

      if (!orgId) {
        return reply.status(400).send({ message: "x-org-id é obrigatório" });
      }

      if (!userId) {
        return reply.status(400).send({ message: "Usuário não identificado" });
      }

      try {
        const { departmentId, permissionId } = z
          .object({
            departmentId: z.string().uuid(),
            permissionId: z.string(),
          })
          .parse(request.params);

        // Buscar permissão existente para registrar no log
        const existente =
          await deps.departmentPermissionRepository.encontrarPorDepartmentEPermission(
            orgId,
            departmentId,
            permissionId,
          );

        await deps.departmentPermissionRepository.deletarPorDepartmentEPermission(
          orgId,
          departmentId,
          permissionId,
        );

        // Registrar auditoria de remoção
        if (deps.auditLogRepository && existente) {
          await deps.auditLogRepository.registrar({
            id: randomUUID(),
            orgId,
            entityType: "department",
            entityId: departmentId,
            permissionId,
            action: "removed",
            granted: null,
            previousValue: existente.granted,
            actorId: userId,
            reason: null,
            metadata: null,
            createdAt: new Date(),
          });
        }

        // Publicar evento de remoção (mensageria)
        if (deps.eventBus && existente) {
          await deps.eventBus.publish({
            name: "Permissions.DepartmentPermissionRemoved",
            version: "v1",
            metadata: {
              eventId: randomUUID(),
              orgId,
              actorId: userId,
              timestamp: new Date(),
            },
            payload: {
              entityType: "department",
              entityId: departmentId,
              permissionId,
              previousValue: existente.granted,
            },
          });
        }

        return reply.status(200).send({ success: true });
      } catch (error) {
        app.log.error(error, "Erro ao remover permissão do departamento");

        if (error instanceof Error) {
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao remover permissão do departamento" });
      }
    },
  );
}
