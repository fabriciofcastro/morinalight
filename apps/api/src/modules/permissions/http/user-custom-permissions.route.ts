import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import type { WorkflowPolicyRepository } from "../../organizational-structure/domain/repositories/workflow-policy-repository";
import type { OrganizationRepository } from "../../organizations/repositories/organization.repository";
import { AtribuirPermissaoUsuarioUseCase } from "../application/use-cases/atribuir-permissao-usuario.use-case";
import type { PermissionAuditLogRepository } from "../domain/repositories/permission-audit-log-repository";
import type { PermissionChangeRequestRepository } from "../domain/repositories/permission-change-request-repository";
import type { PermissionRepository } from "../domain/repositories/permission-repository";
import type { UserPermissionRepository } from "../domain/repositories/user-permission-repository";
import { maybeRequireApprovalForRbacChange } from "./permission-change-requests.route";

type Dependencies = {
  userPermissionRepository: UserPermissionRepository;
  permissionRepository: PermissionRepository;
  organizationRepository: OrganizationRepository;
  permissionChangeRequestRepository?: PermissionChangeRequestRepository;
  workflowPolicyRepository?: WorkflowPolicyRepository;
  auditLogRepository?: PermissionAuditLogRepository;
  eventBus?: DomainEventBus;
};

export async function registerUserCustomPermissionsRoute(app: FastifyInstance, deps: Dependencies) {
  // Listar permissões customizadas de um usuário
  app.get(
    "/users/:userId/permissions/custom",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const orgId = request.headers["x-org-id"] as string;
      const actorId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;
      if (!orgId) return reply.status(400).send({ message: "x-org-id é obrigatório" });
      if (!actorId) return reply.status(400).send({ message: "Usuário não identificado" });

      const { userId } = z.object({ userId: z.string().uuid() }).parse(request.params);

      const membership = await deps.organizationRepository.encontrarMembership?.(orgId, userId);
      if (!membership)
        return reply.status(404).send({ message: "Usuário não pertence à organização" });

      const itens = await deps.userPermissionRepository.listarPorUser(orgId, userId);
      return reply.status(200).send({ itens });
    },
  );

  // Grant/deny custom (upsert)
  app.post(
    "/users/:userId/permissions/custom",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const orgId = request.headers["x-org-id"] as string;
      const actorId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;
      if (!orgId) return reply.status(400).send({ message: "x-org-id é obrigatório" });
      if (!actorId) return reply.status(400).send({ message: "Usuário não identificado" });

      const { userId } = z.object({ userId: z.string().uuid() }).parse(request.params);
      const body = z
        .object({
          permissionId: z.string(),
          granted: z.boolean().default(true),
          reason: z.string().optional(),
        })
        .parse(request.body);

      if (deps.permissionChangeRequestRepository && deps.workflowPolicyRepository) {
        const approval = await maybeRequireApprovalForRbacChange({
          workflowPolicyRepository: deps.workflowPolicyRepository,
          permissionChangeRequestRepository: deps.permissionChangeRequestRepository,
          permissionRepository: deps.permissionRepository,
          orgId,
          actorId,
          entityType: "user",
          entityId: userId,
          permissionId: body.permissionId,
          granted: body.granted,
          reason: body.reason,
          eventBus: deps.eventBus,
        });
        if (approval.required) {
          return reply.status(202).send({ pending: true, ...approval });
        }
      }

      const useCase = new AtribuirPermissaoUsuarioUseCase({
        userPermissionRepository: deps.userPermissionRepository,
        permissionRepository: deps.permissionRepository,
        organizationRepository: deps.organizationRepository,
        auditLogRepository: deps.auditLogRepository,
        actorId,
        eventBus: deps.eventBus,
      });

      const result = await useCase.execute({
        orgId,
        userId,
        permissionId: body.permissionId,
        granted: body.granted,
        reason: body.reason,
      });

      return reply.status(200).send(result);
    },
  );

  // Remover custom (delete)
  app.delete(
    "/users/:userId/permissions/custom/:permissionId",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const orgId = request.headers["x-org-id"] as string;
      const actorId = (request.auth?.userId ?? request.headers["x-user-id"]) as string;
      if (!orgId) return reply.status(400).send({ message: "x-org-id é obrigatório" });
      if (!actorId) return reply.status(400).send({ message: "Usuário não identificado" });

      const { userId, permissionId } = z
        .object({ userId: z.string().uuid(), permissionId: z.string() })
        .parse(request.params);

      const membership = await deps.organizationRepository.encontrarMembership?.(orgId, userId);
      if (!membership)
        return reply.status(404).send({ message: "Usuário não pertence à organização" });

      const existente = await deps.userPermissionRepository.encontrarPorUserEPermission(
        orgId,
        userId,
        permissionId,
      );
      await deps.userPermissionRepository.deletarPorUserEPermission(orgId, userId, permissionId);

      if (deps.auditLogRepository && existente) {
        await deps.auditLogRepository.registrar({
          id: randomUUID(),
          orgId,
          entityType: "user",
          entityId: userId,
          permissionId,
          action: "removed",
          granted: null,
          previousValue: existente.granted,
          actorId,
          reason: null,
          metadata: { reason: existente.reason },
          createdAt: new Date(),
        });
      }

      if (deps.eventBus && existente) {
        await deps.eventBus.publish({
          name: "Permissions.UserPermissionRemoved",
          version: "v1",
          metadata: {
            eventId: randomUUID(),
            orgId,
            actorId,
            timestamp: new Date(),
          },
          payload: {
            entityType: "user",
            entityId: userId,
            permissionId,
            previousValue: existente.granted,
          },
        });
      }

      return reply.status(204).send();
    },
  );
}
