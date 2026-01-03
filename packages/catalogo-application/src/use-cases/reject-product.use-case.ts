import { randomUUID } from "node:crypto";

import type { ProdutoAuditoriaRepository, ProdutoRepository } from "@morina/catalogo-domain";
import { ProdutoAuditoria } from "@morina/catalogo-domain";
import type { DomainEventBus } from "@morina/shared-kernel";

import { ProdutoNotFoundError } from "../errors/produto-not-found.error";
import { produtoViewSchema, reprovarProdutoInputSchema } from "../schemas/product";

type Dependencies = {
  produtoRepository: ProdutoRepository;
  actorId: string;
  eventBus?: DomainEventBus;
  auditoriaRepository?: ProdutoAuditoriaRepository;
};

export class ReprovarProdutoUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = reprovarProdutoInputSchema.parse(rawInput);

    const produto = await this.deps.produtoRepository.encontrarPorId(input.orgId, input.produtoId);

    if (!produto) {
      throw new ProdutoNotFoundError(input.produtoId);
    }

    produto.reprovar(this.deps.actorId, input.motivo);

    await this.deps.produtoRepository.salvar(produto);

    if (this.deps.auditoriaRepository) {
      await this.deps.auditoriaRepository.registrar(
        new ProdutoAuditoria({
          id: randomUUID(),
          produtoId: produto.produtoId,
          orgId: input.orgId,
          acao: "produto_reprovado",
          actorId: this.deps.actorId,
          payload: { motivo: input.motivo },
          criadoEm: new Date(),
        }),
      );
    }

    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "Catalogo.ProdutoReprovado",
        version: "v1",
        metadata: {
          eventId: randomUUID(),
          orgId: input.orgId,
          actorId: this.deps.actorId,
          timestamp: new Date(),
        },
        payload: {
          produtoId: produto.produtoId,
          status: produto.dados.status,
          motivo: input.motivo,
        },
      });
    }

    return produtoViewSchema.parse({
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
  }
}
