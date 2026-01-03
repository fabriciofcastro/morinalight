import { produtoViewSchema } from "@morina/catalogo-application";
import type { ProdutoAuditoriaRepository, ProdutoRepository } from "@morina/catalogo-domain";
import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { getTenant } from "../../../core/tenant/tenant.utils";

const paramsSchema = z.object({
  produtoId: z.string().uuid(),
});

const querySchema = z.object({
  acao: z.string().optional(),
  limite: z.coerce.number().int().positive().max(100).optional(),
  cursor: z.string().uuid().optional(),
  inicio: z.coerce.date().optional(),
  fim: z.coerce.date().optional(),
});

export async function registerListAuditRoute(
  app: FastifyInstance,
  deps: { produtoRepository: ProdutoRepository; auditoriaRepository: ProdutoAuditoriaRepository },
) {
  app.get("/catalogo/produtos/:produtoId/auditoria", async (request, reply) => {
    // Validar tenant (deve ser aplicado via hook ou middleware antes desta rota)
    const tenant = getTenant(request);
    const { produtoId } = paramsSchema.parse(request.params);
    const filtro = querySchema.parse(request.query ?? {});

    const produto = await deps.produtoRepository.encontrarPorId(tenant.orgId, produtoId);

    if (!produto) {
      return reply.status(404).send({ message: "Produto não encontrado" });
    }

    const auditoria = await deps.auditoriaRepository.listarPorProduto(
      tenant.orgId,
      produtoId,
      filtro,
    );

    return reply.send({
      produto: produtoViewSchema.parse({
        produtoId: produto.produtoId,
        orgId: produto.dados.orgId,
        nome: produto.dados.nome,
        descricao: produto.dados.descricao ?? null,
        status: produto.dados.status,
        criadoPor: produto.dados.criadoPor,
        atualizadoPor: produto.dados.atualizadoPor,
        criadoEm: produto.dados.criadoEm,
        atualizadoEm: produto.dados.atualizadoEm,
      }),
      auditoria: {
        itens: auditoria.itens.map((item) => ({
          id: item.dados.id,
          acao: item.dados.acao,
          actorId: item.dados.actorId,
          payload: item.dados.payload ?? null,
          criadoEm: item.dados.criadoEm,
        })),
        proximoCursor: auditoria.proximoCursor,
      },
    });
  });
}
