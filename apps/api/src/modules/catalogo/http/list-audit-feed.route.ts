import {
  ListarAuditoriaFeedUseCase,
  listarAuditoriaFeedInputSchema,
} from "@morina/catalogo-application";
import type { ProdutoAuditoriaRepository, ProdutoRepository } from "@morina/catalogo-domain";
import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { getTenant } from "../../../core/tenant/tenant.utils";

type CatalogoHttpDeps = {
  produtoRepository: ProdutoRepository;
  auditoriaRepository: ProdutoAuditoriaRepository;
};

export async function registerListAuditFeedRoute(app: FastifyInstance, deps: CatalogoHttpDeps) {
  const querySchema = z.object({
    acao: listarAuditoriaFeedInputSchema.shape.acao.optional(),
    limite: z.coerce.number().int().min(1).max(50).optional(),
    cursor: z.string().optional(),
    inicio: z.coerce.date().optional(),
    fim: z.coerce.date().optional(),
  });

  app.get("/catalogo/auditoria/feed", async (request, reply) => {
    // Validar tenant (deve ser aplicado via hook ou middleware antes desta rota)
    const tenant = getTenant(request);
    const query = querySchema.parse(request.query ?? {});

    const useCase = new ListarAuditoriaFeedUseCase({
      auditoriaRepository: deps.auditoriaRepository,
      produtoRepository: deps.produtoRepository,
    });

    const resultado = await useCase.execute({
      orgId: tenant.orgId,
      ...query,
    });

    return reply.status(200).send(resultado);
  });
}
