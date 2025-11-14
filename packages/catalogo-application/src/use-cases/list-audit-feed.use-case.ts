import type {
  ProdutoAuditoriaRepository,
  ProdutoRepository,
} from "@morina/catalogo-domain";

import {
  listarAuditoriaFeedInputSchema,
  listarAuditoriaFeedResultadoSchema,
} from "../schemas/audit";
import { produtoViewSchema } from "../schemas/product";

type Dependencies = {
  auditoriaRepository: ProdutoAuditoriaRepository;
  produtoRepository: ProdutoRepository;
};

export class ListarAuditoriaFeedUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = listarAuditoriaFeedInputSchema.parse(rawInput);

    const pagina = await this.deps.auditoriaRepository.listarFeed(input.orgId, {
      acao: input.acao,
      cursor: input.cursor,
      limite: input.limite,
      inicio: input.inicio,
      fim: input.fim,
    });

    const produtosCache = new Map<string, ReturnType<typeof produtoViewSchema.parse>>();

    const itens = [];
    for (const auditoria of pagina.itens) {
      const existente = produtosCache.get(auditoria.dados.produtoId);
      let produtoView = existente;

      if (!produtoView) {
        const produto = await this.deps.produtoRepository.encontrarPorId(
          auditoria.dados.orgId,
          auditoria.dados.produtoId,
        );

        if (produto) {
          produtoView = produtoViewSchema.parse({
            produtoId: produto.produtoId,
            orgId: produto.dados.orgId,
            nome: produto.dados.nome,
            descricao: produto.dados.descricao ?? null,
            status: produto.dados.status,
            criadoPor: produto.dados.criadoPor,
            atualizadoPor: produto.dados.atualizadoPor,
            criadoEm: produto.dados.criadoEm,
            atualizadoEm: produto.dados.atualizadoEm,
          });

          produtosCache.set(auditoria.dados.produtoId, produtoView);
        }
      }

      itens.push({
        id: auditoria.dados.id,
        produtoId: auditoria.dados.produtoId,
        orgId: auditoria.dados.orgId,
        acao: auditoria.dados.acao,
        actorId: auditoria.dados.actorId,
        payload: auditoria.dados.payload ?? null,
        criadoEm: auditoria.dados.criadoEm,
        produto: produtoView ?? null,
      });
    }

    return listarAuditoriaFeedResultadoSchema.parse({
      itens,
      proximoCursor: pagina.proximoCursor ?? null,
    });
  }
}

