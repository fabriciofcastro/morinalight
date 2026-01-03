import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import type { PositionRepository } from "../../organizational-structure/domain/repositories/position-repository";
import type { WorkflowPolicyRepository } from "../../organizational-structure/domain/repositories/workflow-policy-repository";
import type { OrganizationRepository } from "../../organizations/repositories/organization.repository";
import { AtribuirPermissaoCargoUseCase } from "../application/use-cases/atribuir-permissao-cargo.use-case";
import { ListarPermissoesCargoUseCase } from "../application/use-cases/listar-permissoes-cargo.use-case";
import type { PermissionAuditLogRepository } from "../domain/repositories/permission-audit-log-repository";
import type { PermissionChangeRequestRepository } from "../domain/repositories/permission-change-request-repository";
import type { PermissionRepository } from "../domain/repositories/permission-repository";
import type { PositionPermissionRepository } from "../domain/repositories/position-permission-repository";
import { maybeRequireApprovalForRbacChange } from "./permission-change-requests.route";

type Dependencies = {
  positionPermissionRepository: PositionPermissionRepository;
  positionRepository: PositionRepository;
  permissionRepository: PermissionRepository;
  organizationRepository: OrganizationRepository;
  permissionChangeRequestRepository?: PermissionChangeRequestRepository;
  workflowPolicyRepository?: WorkflowPolicyRepository;
  auditLogRepository?: PermissionAuditLogRepository;
  eventBus?: DomainEventBus;
};

export async function registerPositionPermissionsRoute(app: FastifyInstance, deps: Dependencies) {
  // Listar permissões de um cargo
  app.get(
    "/positions/:positionId/permissions",
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
        const { positionId } = z.object({ positionId: z.string().uuid() }).parse(request.params);

        const useCase = new ListarPermissoesCargoUseCase({
          positionPermissionRepository: deps.positionPermissionRepository,
          positionRepository: deps.positionRepository,
          permissionRepository: deps.permissionRepository,
        });

        const input = { orgId, positionId };
        const resultado = await useCase.execute(input);

        return reply.status(200).send({ itens: resultado });
      } catch (error) {
        app.log.error(error, "Erro ao listar permissões do cargo");

        if (error instanceof Error) {
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao listar permissões do cargo" });
      }
    },
  );

  // Atribuir/remover permissão a um cargo
  app.post(
    "/positions/:positionId/permissions",
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
        const { positionId } = z.object({ positionId: z.string().uuid() }).parse(request.params);
        const body = z
          .object({
            permissionId: z.string(),
            granted: z.boolean().default(true),
            reason: z.string().optional(),
          })
          .parse(request.body);

        const useCase = new AtribuirPermissaoCargoUseCase({
          positionPermissionRepository: deps.positionPermissionRepository,
          positionRepository: deps.positionRepository,
          permissionRepository: deps.permissionRepository,
          auditLogRepository: deps.auditLogRepository,
          actorId: userId,
          eventBus: deps.eventBus,
        });

        const input = {
          orgId,
          positionId,
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
            entityType: "position",
            entityId: positionId,
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
        app.log.error(error, "Erro ao atribuir permissão ao cargo");

        if (error instanceof Error) {
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao atribuir permissão ao cargo" });
      }
    },
  );

  // Remover permissão de um cargo
  app.delete(
    "/positions/:positionId/permissions/:permissionId",
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
        const { positionId, permissionId } = z
          .object({
            positionId: z.string().uuid(),
            permissionId: z.string(),
          })
          .parse(request.params);

        // Buscar permissão existente para registrar no log
        const existente = await deps.positionPermissionRepository.encontrarPorPositionEPermission(
          orgId,
          positionId,
          permissionId,
        );

        await deps.positionPermissionRepository.deletarPorPositionEPermission(
          orgId,
          positionId,
          permissionId,
        );

        // Registrar auditoria de remoção
        if (deps.auditLogRepository && existente) {
          await deps.auditLogRepository.registrar({
            id: randomUUID(),
            orgId,
            entityType: "position",
            entityId: positionId,
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
            name: "Permissions.PositionPermissionRemoved",
            version: "v1",
            metadata: {
              eventId: randomUUID(),
              orgId,
              actorId: userId,
              timestamp: new Date(),
            },
            payload: {
              entityType: "position",
              entityId: positionId,
              permissionId,
              previousValue: existente.granted,
            },
          });
        }

        return reply.status(204).send();
      } catch (error) {
        app.log.error(error, "Erro ao remover permissão do cargo");

        if (error instanceof Error) {
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao remover permissão do cargo" });
      }
    },
  );
}
