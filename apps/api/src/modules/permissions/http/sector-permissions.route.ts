import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { randomUUID } from "crypto";
import { AtribuirPermissaoSetorUseCase } from "../application/use-cases/atribuir-permissao-setor.use-case";
import { ListarPermissoesSetorUseCase } from "../application/use-cases/listar-permissoes-setor.use-case";
import type { SectorPermissionRepository } from "../domain/repositories/sector-permission-repository";
import type { SectorRepository } from "../../organizational-structure/domain/repositories/sector-repository";
import type { PermissionRepository } from "../domain/repositories/permission-repository";
import type { PermissionAuditLogRepository } from "../domain/repositories/permission-audit-log-repository";

type Dependencies = {
  sectorPermissionRepository: SectorPermissionRepository;
  sectorRepository: SectorRepository;
  permissionRepository: PermissionRepository;
  auditLogRepository?: PermissionAuditLogRepository;
};

export async function registerSectorPermissionsRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
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
        });

        const input = {
          orgId,
          sectorId,
          permissionId: body.permissionId,
          granted: body.granted,
          reason: body.reason,
        };

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

