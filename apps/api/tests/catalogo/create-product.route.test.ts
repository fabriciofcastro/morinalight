import { Produto } from "@morina/catalogo-domain";
import { beforeAll, describe, expect, it } from "vitest";

import { createServer } from "../../src/core/server/create-server";
import { InMemoryProdutoRepository } from "../../src/modules/catalogo/infra/memory/in-memory-produto.repository";
import { InMemoryProdutoAuditoriaRepository } from "../../src/modules/catalogo/infra/memory/in-memory-produto-auditoria.repository";

const repository = new InMemoryProdutoRepository();
const auditoriaRepository = new InMemoryProdutoAuditoriaRepository();
const actorId = "user-test";
const orgId = "org-test";

const eventLog: unknown[] = [];

const fakeEventBus = {
  async publish(event: unknown) {
    eventLog.push(event);
  },
};

let app: Awaited<ReturnType<typeof createServer>>;

describe("Catálogo HTTP", () => {
  beforeAll(async () => {
    app = await createServer({
      modules: {
        catalogo: { produtoRepository: repository, auditoriaRepository, eventBus: fakeEventBus },
      },
    });
  });

  it("cria produto com sucesso", async () => {
    eventLog.length = 0;
    const response = await app.inject({
      method: "POST",
      url: "/catalogo/produtos",
      headers: { "x-org-id": orgId, "x-actor-id": actorId },
      payload: { nome: "Produto Teste", descricao: "descricao" },
    });

    expect(response.statusCode).toBe(201);

    const body = response.json();
    expect(body.nome).toBe("Produto Teste");
    expect(body.orgId).toBe(orgId);
    expect(eventLog).toHaveLength(1);
    expect(auditoriaRepository.itens).toHaveLength(1);
  });

  it("aprova produto aguardando aprovação", async () => {
    eventLog.length = 0;
    const produto = Produto.criar({
      orgId,
      nome: "Produto Aprovar",
      criadoPor: actorId,
      atualizadoPor: actorId,
    });
    produto.encaminharParaAprovacao(actorId);
    await repository.salvar(produto);

    const response = await app.inject({
      method: "POST",
      url: `/catalogo/produtos/${produto.produtoId}/aprovar`,
      headers: { "x-org-id": orgId, "x-actor-id": actorId },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.status).toBe("ativo");
    expect(eventLog.length).toBeGreaterThanOrEqual(1);
    expect(auditoriaRepository.itens.some((log) => log.dados.acao === "produto_aprovado")).toBe(
      true,
    );
  });

  it("reprova produto aguardando aprovação", async () => {
    eventLog.length = 0;

    const produto = Produto.criar({
      orgId,
      nome: "Produto Reprovar",
      criadoPor: actorId,
      atualizadoPor: actorId,
    });
    produto.encaminharParaAprovacao(actorId);
    await repository.salvar(produto);

    const response = await app.inject({
      method: "POST",
      url: `/catalogo/produtos/${produto.produtoId}/reprovar`,
      headers: { "x-org-id": orgId, "x-actor-id": actorId },
      payload: { motivo: "Informações incompletas" },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.status).toBe("inativo");
    expect(eventLog.length).toBeGreaterThanOrEqual(1);
    expect(auditoriaRepository.itens.some((log) => log.dados.acao === "produto_reprovado")).toBe(
      true,
    );
  });

  it("lista auditoria do produto", async () => {
    eventLog.length = 0;

    const createResponse = await app.inject({
      method: "POST",
      url: "/catalogo/produtos",
      headers: { "x-org-id": orgId, "x-actor-id": actorId },
      payload: { nome: "Produto Auditoria", descricao: "desc" },
    });

    const criado = createResponse.json();

    const produto = await repository.encontrarPorId(orgId, criado.produtoId);
    expect(produto).not.toBeNull();
    if (!produto) {
      throw new Error("Produto não encontrado no repositório de teste");
    }
    produto.encaminharParaAprovacao(actorId);
    await repository.salvar(produto);

    await app.inject({
      method: "POST",
      url: `/catalogo/produtos/${criado.produtoId}/aprovar`,
      headers: { "x-org-id": orgId, "x-actor-id": actorId },
    });

    const response = await app.inject({
      method: "GET",
      url: `/catalogo/produtos/${criado.produtoId}/auditoria`,
      headers: { "x-org-id": orgId },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.produto.produtoId).toBe(criado.produtoId);
    expect(body.auditoria.itens.length).toBeGreaterThanOrEqual(2);
  });
});
