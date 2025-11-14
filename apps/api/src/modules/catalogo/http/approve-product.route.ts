import { AprovarProdutoUseCase, aprovarProdutoInputSchema } from "@morina/catalogo-application";
import type { ProdutoAuditoriaRepository, ProdutoRepository } from "@morina/catalogo-domain";
import type { DomainEventBus } from "@morina/shared-kernel";
import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { canManage, getTenant } from "../../../core/tenant/tenant.utils";

const paramsSchema = aprovarProdutoInputSchema.pick({ produtoId: true });
const bodySchema = aprovarProdutoInputSchema.pick({ motivo: true }).partial().default({});

type CatalogoHttpDeps = {
  produtoRepository: ProdutoRepository;
  eventBus?: DomainEventBus;
  auditoriaRepository?: ProdutoAuditoriaRepository;
};

export async function registerApproveProductRoute(app: FastifyInstance, deps: CatalogoHttpDeps) {
  app.post("/catalogo/produtos/:produtoId/aprovar", async (request, reply) => {
    // Validar tenant (deve ser aplicado via hook ou middleware antes desta rota)
    const tenant = getTenant(request);

    // Aprovação requer permissão de gerenciamento (admin ou owner)
    if (!canManage(request)) {
      return reply.status(403).send({
        message: "Sem permissão para aprovar produtos. Requer role de admin ou owner",
      });
    }

    const { produtoId } = paramsSchema.parse(request.params);
    const body = bodySchema.parse(request.body ?? {});

    const useCase = new AprovarProdutoUseCase({
      produtoRepository: deps.produtoRepository,
      actorId: tenant.userId,
      eventBus: deps.eventBus,
      auditoriaRepository: deps.auditoriaRepository,
    });

    const resultado = await useCase.execute({
      orgId: tenant.orgId,
      produtoId,
      motivo: body.motivo,
    });

    return reply.status(200).send(resultado);
  });
}
