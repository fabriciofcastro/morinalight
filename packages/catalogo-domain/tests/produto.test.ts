import { describe, expect, it } from "vitest";

import { Produto } from "../src/entities/product";

describe("Produto", () => {
  const baseProps = {
    orgId: "org-1",
    nome: "Camiseta Futurista",
    descricao: "Camiseta com tecido inteligente",
    status: "rascunho" as const,
    criadoPor: "user-1",
    atualizadoPor: "user-1",
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  };

  it("cria produto com orgId obrigatório", () => {
    const produto = Produto.criar({
      orgId: baseProps.orgId,
      nome: baseProps.nome,
      descricao: baseProps.descricao,
      criadoPor: baseProps.criadoPor,
      atualizadoPor: baseProps.atualizadoPor,
    });

    expect(produto.produtoId).toBeDefined();
    expect(produto.dados.status).toBe("rascunho");
  });

  it("encaminha produto para aprovação", () => {
    const produto = Produto.criar({
      orgId: baseProps.orgId,
      nome: baseProps.nome,
      descricao: baseProps.descricao,
      criadoPor: baseProps.criadoPor,
      atualizadoPor: baseProps.atualizadoPor,
    });

    produto.encaminharParaAprovacao("user-2");

    expect(produto.dados.status).toBe("aguardando_aprovacao");
    expect(produto.dados.atualizadoPor).toBe("user-2");
  });
});
