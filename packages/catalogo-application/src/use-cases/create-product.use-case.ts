import { randomUUID } from "node:crypto";
import type { ProdutoAuditoriaRepository, ProdutoRepository } from "@morina/catalogo-domain";
import { Produto, ProdutoAuditoria } from "@morina/catalogo-domain";
import type { DomainEventBus } from "@morina/shared-kernel";

import { criarProdutoInputSchema, produtoViewSchema } from "../schemas/product";

type Dependencies = {
  produtoRepository: ProdutoRepository;
  actorId: string;
  eventBus?: DomainEventBus;
  auditoriaRepository?: ProdutoAuditoriaRepository;
};

export class CriarProdutoUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = criarProdutoInputSchema.parse(rawInput);

    const produtoExistente = await this.deps.produtoRepository.encontrarPorNome(
      input.orgId,
      input.nome,
    );
    if (produtoExistente) {
      throw new Error("Produto com este nome já existe");
    }

    const produto = Produto.criar({
      orgId: input.orgId,
      nome: input.nome,
      descricao: input.descricao,
      criadoPor: this.deps.actorId,
      atualizadoPor: this.deps.actorId,
    });

    await this.deps.produtoRepository.salvar(produto);

    if (this.deps.auditoriaRepository) {
      await this.deps.auditoriaRepository.registrar(
        new ProdutoAuditoria({
          id: randomUUID(),
          produtoId: produto.produtoId,
          orgId: produto.dados.orgId,
          acao: "produto_criado",
          actorId: this.deps.actorId,
          payload: {
            nome: produto.dados.nome,
            descricao: produto.dados.descricao ?? null,
          },
          criadoEm: new Date(),
        }),
      );
    }

    if (this.deps.eventBus) {
      await this.deps.eventBus.publish({
        name: "Catalogo.ProdutoCadastrado",
        version: "v1",
        metadata: {
          eventId: randomUUID(),
          orgId: produto.dados.orgId,
          actorId: this.deps.actorId,
          timestamp: new Date(),
        },
        payload: {
          produtoId: produto.produtoId,
          status: produto.dados.status,
          nome: produto.dados.nome,
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
