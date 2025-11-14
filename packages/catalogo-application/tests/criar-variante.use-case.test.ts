import type {
  ProductVariantRepository,
  ProdutoRepository,
} from "@morina/catalogo-domain";
import { Produto, ProductVariant } from "@morina/catalogo-domain";
import { describe, expect, it } from "vitest";

import { CriarVarianteUseCase } from "../src/use-cases/criar-variante.use-case";

class InMemoryProdutoRepository implements ProdutoRepository {
  private readonly items = new Map<string, Produto>();

  async salvar(produto: Produto) {
    this.items.set(produto.produtoId, produto);
  }

  async encontrarPorId(orgId: string, produtoId: string) {
    const produto = this.items.get(produtoId);
    if (!produto) return null;
    return produto.dados.orgId === orgId ? produto : null;
  }

  async encontrarPorNome() {
    return null;
  }

  async listarPorOrg() {
    return { itens: [], proximoCursor: undefined };
  }
}

class InMemoryProductVariantRepository implements ProductVariantRepository {
  private readonly items = new Map<string, ProductVariant>();

  async criar(variante: ProductVariant) {
    this.items.set(variante.varianteId, variante);
  }

  async atualizar(variante: ProductVariant) {
    this.items.set(variante.varianteId, variante);
  }

  async encontrarPorId(varianteId: string, orgId: string) {
    const variante = this.items.get(varianteId);
    if (!variante) return null;
    return variante.dados.orgId === orgId ? variante : null;
  }

  async encontrarPorSku(sku: string, orgId: string) {
    return (
      Array.from(this.items.values()).find(
        (v) => v.dados.orgId === orgId && v.dados.sku === sku,
      ) ?? null
    );
  }

  async listarPorProduto() {
    return { itens: [], proximoCursor: null };
  }

  async listarPorOrg() {
    return { itens: [], proximoCursor: null };
  }

  async contarPorProduto() {
    return 0;
  }

  async remover() {
    // Implementação vazia para testes
  }
}

describe("CriarVarianteUseCase", () => {
  const actorId = "user-actor";
  const orgId = "org-1";

  it("cria variação com sucesso", async () => {
    const produtoRepository = new InMemoryProdutoRepository();
    const varianteRepository = new InMemoryProductVariantRepository();

    const produto = Produto.criar({
      orgId,
      nome: "Camiseta",
      criadoPor: actorId,
      atualizadoPor: actorId,
    });
    await produtoRepository.salvar(produto);

    const useCase = new CriarVarianteUseCase({
      produtoRepository,
      varianteRepository,
      actorId,
    });

    const variante = await useCase.execute({
      orgId,
      productId: produto.produtoId,
      sku: "CAM-M-AZUL",
      nome: "Camiseta M Azul",
      atributos: {
        tamanho: "M",
        cor: "azul",
      },
      preco: 49.99,
      estoque: 10,
    });

    expect(variante.varianteId).toBeDefined();
    expect(variante.sku).toBe("CAM-M-AZUL");
    expect(variante.nome).toBe("Camiseta M Azul");
    expect(variante.atributos).toEqual({ tamanho: "M", cor: "azul" });
    expect(variante.preco).toBe(49.99);
    expect(variante.estoque).toBe(10);
  });

  it("lança erro quando produto não existe", async () => {
    const produtoRepository = new InMemoryProdutoRepository();
    const varianteRepository = new InMemoryProductVariantRepository();

    const useCase = new CriarVarianteUseCase({
      produtoRepository,
      varianteRepository,
      actorId,
    });

    await expect(
      useCase.execute({
        orgId,
        productId: "produto-inexistente",
        sku: "SKU-123",
        nome: "Variante",
        atributos: {},
      }),
    ).rejects.toThrow();
  });

  it("lança erro quando SKU já existe", async () => {
    const produtoRepository = new InMemoryProdutoRepository();
    const varianteRepository = new InMemoryProductVariantRepository();

    const produto = Produto.criar({
      orgId,
      nome: "Produto",
      criadoPor: actorId,
      atualizadoPor: actorId,
    });
    await produtoRepository.salvar(produto);

    const varianteExistente = ProductVariant.criar({
      productId: produto.produtoId,
      orgId,
      sku: "SKU-123",
      nome: "Variante Existente",
      atributos: {},
      createdBy: actorId,
      updatedBy: actorId,
    });
    await varianteRepository.criar(varianteExistente);

    const useCase = new CriarVarianteUseCase({
      produtoRepository,
      varianteRepository,
      actorId,
    });

    await expect(
      useCase.execute({
        orgId,
        productId: produto.produtoId,
        sku: "SKU-123",
        nome: "Nova Variante",
        atributos: {},
      }),
    ).rejects.toThrow("Variante com este SKU já existe");
  });
});

