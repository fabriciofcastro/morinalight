import { randomUUID } from "node:crypto";
import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import type { SectorRepository } from "../../organizational-structure/domain/repositories/sector-repository";
import type { WorkflowPolicyRepository } from "../../organizational-structure/domain/repositories/workflow-policy-repository";
import { AtribuirPermissaoSetorUseCase } from "../application/use-cases/atribuir-permissao-setor.use-case";
import { ListarPermissoesSetorUseCase } from "../application/use-cases/listar-permissoes-setor.use-case";
import type { PermissionAuditLogRepository } from "../domain/repositories/permission-audit-log-repository";
import type { PermissionChangeRequestRepository } from "../domain/repositories/permission-change-request-repository";
import type { PermissionRepository } from "../domain/repositories/permission-repository";
import type { SectorPermissionRepository } from "../domain/repositories/sector-permission-repository";
import { maybeRequireApprovalForRbacChange } from "./permission-change-requests.route";

type Dependencies = {
  sectorPermissionRepository: SectorPermissionRepository;
  sectorRepository: SectorRepository;
  permissionRepository: PermissionRepository;
  permissionChangeRequestRepository?: PermissionChangeRequestRepository;
  workflowPolicyRepository?: WorkflowPolicyRepository;
  auditLogRepository?: PermissionAuditLogRepository;
  eventBus?: DomainEventBus;
};

export async function registerSectorPermissionsRoute(app: FastifyInstance, deps: Dependencies) {
  // Listar permissões de um setor
  app.get(
    "/sectors/:sectorId/permissions",
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
        const { sectorId } = z.object({ sectorId: z.string().uuid() }).parse(request.params);

        const useCase = new ListarPermissoesSetorUseCase({
          sectorPermissionRepository: deps.sectorPermissionRepository,
          sectorRepository: deps.sectorRepository,
          permissionRepository: deps.permissionRepository,
        });

        const input = { orgId, sectorId };
        const resultado = await useCase.execute(input);

        return reply.status(200).send({ itens: resultado });
      } catch (error) {
        app.log.error(error, "Erro ao listar permissões do setor");

        if (error instanceof Error) {
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao listar permissões do setor" });
      }
    },
  );

  // Atribuir/remover permissão a um setor
  app.post(
    "/sectors/:sectorId/permissions",
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
        const { sectorId } = z.object({ sectorId: z.string().uuid() }).parse(request.params);
        const body = z
          .object({
            permissionId: z.string(),
            granted: z.boolean().default(true),
            reason: z.string().optional(),
          })
          .parse(request.body);

        const useCase = new AtribuirPermissaoSetorUseCase({
          sectorPermissionRepository: deps.sectorPermissionRepository,
          sectorRepository: deps.sectorRepository,
          permissionRepository: deps.permissionRepository,
          auditLogRepository: deps.auditLogRepository,
          actorId: userId,
          eventBus: deps.eventBus,
        });

        const input = {
          orgId,
          sectorId,
          permissionId: body.permissionId,
          granted: body.granted,
          reason: body.reason,
        };

        if (deps.permissionChangeRequestRepository && deps.workflowPolicyRepository) {
          const approval = await maybeRequireApprovalForRbacChange({
            workflowPolicyRepository: deps.workflowPolicyRepository,
            permissionChangeRequestRepository: deps.permissionChangeRequestRepository,
            permissionRepository: deps.permissionRepository,
            orgId,
            actorId: userId,
            entityType: "sector",
            entityId: sectorId,
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
        app.log.error(error, "Erro ao atribuir permissão ao setor");

        if (error instanceof Error) {
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao atribuir permissão ao setor" });
      }
    },
  );

  // Remover permissão de um setor
  app.delete(
    "/sectors/:sectorId/permissions/:permissionId",
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
        const { sectorId, permissionId } = z
          .object({
            sectorId: z.string().uuid(),
            permissionId: z.string(),
          })
          .parse(request.params);

        // Buscar permissão existente para registrar no log
        const existente = await deps.sectorPermissionRepository.encontrarPorSectorEPermission(
          orgId,
          sectorId,
          permissionId,
        );

        await deps.sectorPermissionRepository.deletarPorSectorEPermission(
          orgId,
          sectorId,
          permissionId,
        );

        // Registrar auditoria de remoção
        if (deps.auditLogRepository && existente) {
          await deps.auditLogRepository.registrar({
            id: randomUUID(),
            orgId,
            entityType: "sector",
            entityId: sectorId,
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
            name: "Permissions.SectorPermissionRemoved",
            version: "v1",
            metadata: {
              eventId: randomUUID(),
              orgId,
              actorId: userId,
              timestamp: new Date(),
            },
            payload: {
              entityType: "sector",
              entityId: sectorId,
              permissionId,
              previousValue: existente.granted,
            },
          });
        }

        return reply.status(200).send({ success: true });
      } catch (error) {
        app.log.error(error, "Erro ao remover permissão do setor");

        if (error instanceof Error) {
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao remover permissão do setor" });
      }
    },
  );
}
