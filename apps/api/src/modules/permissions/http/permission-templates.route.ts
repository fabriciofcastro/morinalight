import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { CriarPermissionTemplateUseCase } from "../application/use-cases/criar-permission-template.use-case";
import { AplicarPermissionTemplateUseCase } from "../application/use-cases/aplicar-permission-template.use-case";
import { ListarPermissionTemplatesUseCase } from "../application/use-cases/listar-permission-templates.use-case";
import type { PermissionTemplateRepository } from "../domain/repositories/permission-template-repository";
import type { PositionPermissionRepository } from "../domain/repositories/position-permission-repository";
import type { SectorPermissionRepository } from "../domain/repositories/sector-permission-repository";
import type { DepartmentPermissionRepository } from "../domain/repositories/department-permission-repository";
import type { PositionRepository } from "../../organizational-structure/domain/repositories/position-repository";
import type { SectorRepository } from "../../organizational-structure/domain/repositories/sector-repository";
import type { DepartmentRepository } from "../../organizational-structure/domain/repositories/department-repository";
import type { PermissionAuditLogRepository } from "../domain/repositories/permission-audit-log-repository";

type Dependencies = {
  templateRepository: PermissionTemplateRepository;
  positionPermissionRepository?: PositionPermissionRepository;
  sectorPermissionRepository?: SectorPermissionRepository;
  departmentPermissionRepository?: DepartmentPermissionRepository;
  positionRepository?: PositionRepository;
  sectorRepository?: SectorRepository;
  departmentRepository?: DepartmentRepository;
  auditLogRepository?: PermissionAuditLogRepository;
};

export async function registerPermissionTemplatesRoute(
  app: FastifyInstance,
  deps: Dependencies,
) {
  // Listar templates
  app.get(
    "/permissions/templates",
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
        const { searchParams } = new URL(request.url);
        const input = {
          orgId,
          entityType: searchParams.get("entityType") as
            | "position"
            | "sector"
            | "department"
            | "all"
            | undefined,
          isDefault: searchParams.get("isDefault") === "true" ? true : undefined,
          isSystem: searchParams.get("isSystem") === "true" ? true : undefined,
        };

        const useCase = new ListarPermissionTemplatesUseCase({
          templateRepository: deps.templateRepository,
        });

        const resultado = await useCase.execute(input);

        return reply.status(200).send(resultado);
      } catch (error) {
        app.log.error(error, "Erro ao listar templates de permissões");

        if (error instanceof Error) {
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao listar templates de permissões" });
      }
    },
  );

  // Criar template
  app.post(
    "/permissions/templates",
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
        const body = z
          .object({
            name: z.string().min(1).max(200),
            description: z.string().max(500).optional().nullable(),
            entityType: z.enum(["position", "sector", "department", "all"]),
            permissions: z.array(
              z.object({
                permissionId: z.string(),
                granted: z.boolean(),
              }),
            ),
            isDefault: z.boolean().default(false),
          })
          .parse(request.body);

        const useCase = new CriarPermissionTemplateUseCase({
          templateRepository: deps.templateRepository,
          actorId: userId,
        });

        const input = {
          orgId,
          ...body,
        };

        const resultado = await useCase.execute(input);

        return reply.status(201).send(resultado);
      } catch (error) {
        app.log.error(error, "Erro ao criar template de permissões");

        if (error instanceof Error) {
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao criar template de permissões" });
      }
    },
  );

  // Aplicar template a uma entidade
  app.post(
    "/permissions/templates/:templateId/apply",
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
        const { templateId } = z.object({ templateId: z.string().uuid() }).parse(request.params);
        const body = z
          .object({
            entityType: z.enum(["position", "sector", "department"]),
            entityId: z.string().uuid(),
            reason: z.string().optional(),
          })
          .parse(request.body);

        const useCase = new AplicarPermissionTemplateUseCase({
          templateRepository: deps.templateRepository,
          positionPermissionRepository: deps.positionPermissionRepository,
          sectorPermissionRepository: deps.sectorPermissionRepository,
          departmentPermissionRepository: deps.departmentPermissionRepository,
          positionRepository: deps.positionRepository,
          sectorRepository: deps.sectorRepository,
          departmentRepository: deps.departmentRepository,
          auditLogRepository: deps.auditLogRepository,
          actorId: userId,
        });

        const input = {
          orgId,
          templateId,
          ...body,
        };

        const resultado = await useCase.execute(input);

        return reply.status(200).send(resultado);
      } catch (error) {
        app.log.error(error, "Erro ao aplicar template de permissões");

        if (error instanceof Error) {
          return reply.status(400).send({ message: error.message });
        }

        return reply.status(500).send({ message: "Erro ao aplicar template de permissões" });
      }
    },
  );
}

