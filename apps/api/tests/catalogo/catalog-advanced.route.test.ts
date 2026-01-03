import { Produto } from "@morina/catalogo-domain";
import { beforeAll, describe, expect, it } from "vitest";

import { createServer } from "../../src/core/server/create-server";
import { InMemoryProdutoRepository } from "../../src/modules/catalogo/infra/memory/in-memory-produto.repository";
import { InMemoryProdutoAuditoriaRepository } from "../../src/modules/catalogo/infra/memory/in-memory-produto-auditoria.repository";
import { InMemoryOrganizationAuditLogRepository } from "../../src/modules/organizations/infra/memory/in-memory-organization-audit-log.repository";

// Repositórios in-memory simples para testes
class InMemoryCategoryRepository {
  private readonly items = new Map<string, any>();

  async criar(categoria: any) {
    this.items.set(categoria.categoriaId, categoria);
  }

  async atualizar(categoria: any) {
    this.items.set(categoria.categoriaId, categoria);
  }

  async encontrarPorId(categoriaId: string, orgId: string) {
    const categoria = this.items.get(categoriaId);
    if (!categoria) return null;
    return categoria.dados.orgId === orgId ? categoria : null;
  }

  async encontrarPorSlug(slug: string, orgId: string) {
    return (
      Array.from(this.items.values()).find(
        (c) => c.dados.orgId === orgId && c.dados.slug === slug,
      ) ?? null
    );
  }

  async listarPorOrg() {
    return { itens: Array.from(this.items.values()), proximoCursor: null };
  }

  async listarPorParent() {
    return [];
  }

  async contarPorOrg() {
    return this.items.size;
  }

  async remover() {}
}

class InMemoryProductVariantRepository {
  private readonly items = new Map<string, any>();

  async criar(variante: any) {
    this.items.set(variante.varianteId, variante);
  }

  async atualizar(variante: any) {
    this.items.set(variante.varianteId, variante);
  }

  async encontrarPorId(varianteId: string, orgId: string) {
    const variante = this.items.get(varianteId);
    if (!variante) return null;
    return variante.dados.orgId === orgId ? variante : null;
  }

  async encontrarPorSku(sku: string, orgId: string) {
    return (
      Array.from(this.items.values()).find((v) => v.dados.orgId === orgId && v.dados.sku === sku) ??
      null
    );
  }

  async listarPorProduto() {
    return { itens: Array.from(this.items.values()), proximoCursor: null };
  }

  async listarPorOrg() {
    return { itens: Array.from(this.items.values()), proximoCursor: null };
  }

  async contarPorProduto() {
    return this.items.size;
  }

  async remover() {}
}

const repository = new InMemoryProdutoRepository();
const auditoriaRepository = new InMemoryProdutoAuditoriaRepository();
const organizationAuditRepository = new InMemoryOrganizationAuditLogRepository();
const categoriaRepository = new InMemoryCategoryRepository();
const varianteRepository = new InMemoryProductVariantRepository();
const actorId = "user-test";
const orgId = "org-test";

const eventLog: unknown[] = [];

const fakeEventBus = {
  async publish(event: unknown) {
    eventLog.push(event);
  },
};

let app: Awaited<ReturnType<typeof createServer>>;

describe("Catálogo Avançado HTTP", () => {
  beforeAll(async () => {
    app = await createServer({
      modules: {
        catalogo: {
          produtoRepository: repository,
          auditoriaRepository,
          categoriaRepository: categoriaRepository as any,
          varianteRepository: varianteRepository as any,
          eventBus: fakeEventBus,
        },
        notifications: {
          produtoRepository: repository,
          auditoriaRepository,
          organizationAuditRepository,
        },
        organizations: {
          auditRepository: organizationAuditRepository,
        },
      },
    });
  });

  describe("Atualização de Produto", () => {
    it("atualiza produto com SKU e categoria", async () => {
      const produto = Produto.criar({
        orgId,
        nome: "Produto Original",
        criadoPor: actorId,
        atualizadoPor: actorId,
      });
      await repository.salvar(produto);

      // Criar categoria primeiro
      const categoriaResponse = await app.inject({
        method: "POST",
        url: "/catalogo/categorias",
        headers: { "x-org-id": orgId, "x-user-id": actorId },
        payload: {
          name: "Roupas",
          slug: "roupas",
          description: "Categoria de roupas",
        },
      });

      expect(categoriaResponse.statusCode).toBe(201);
      const categoria = categoriaResponse.json();

      // Atualizar produto
      const response = await app.inject({
        method: "PUT",
        url: `/catalogo/produtos/${produto.produtoId}`,
        headers: { "x-org-id": orgId, "x-user-id": actorId },
        payload: {
          nome: "Produto Atualizado",
          sku: "PROD-001",
          categoryId: categoria.categoriaId,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.nome).toBe("Produto Atualizado");
      expect(body.sku).toBe("PROD-001");
      expect(body.categoryId).toBe(categoria.categoriaId);
    });
  });

  describe("Categorias", () => {
    it("cria categoria com sucesso", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/catalogo/categorias",
        headers: { "x-org-id": orgId, "x-user-id": actorId },
        payload: {
          name: "Eletrônicos",
          slug: "eletronicos",
          description: "Categoria de eletrônicos",
        },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.name).toBe("Eletrônicos");
      expect(body.slug).toBe("eletronicos");
      expect(body.ativo).toBe(true);
    });

    it("lista categorias", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/catalogo/categorias",
        headers: { "x-org-id": orgId, "x-user-id": actorId },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(Array.isArray(body.itens)).toBe(true);
    });

    it("atualiza categoria", async () => {
      // Criar categoria primeiro
      const createResponse = await app.inject({
        method: "POST",
        url: "/catalogo/categorias",
        headers: { "x-org-id": orgId, "x-user-id": actorId },
        payload: {
          name: "Categoria Original",
          slug: "categoria-original",
        },
      });

      const categoria = createResponse.json();

      // Atualizar
      const updateResponse = await app.inject({
        method: "PUT",
        url: `/catalogo/categorias/${categoria.categoriaId}`,
        headers: { "x-org-id": orgId, "x-user-id": actorId },
        payload: {
          name: "Categoria Atualizada",
          ativo: false,
        },
      });

      expect(updateResponse.statusCode).toBe(200);
      const updated = updateResponse.json();
      expect(updated.name).toBe("Categoria Atualizada");
      expect(updated.ativo).toBe(false);
    });
  });

  describe("Variações de Produto", () => {
    it("cria variação de produto", async () => {
      const produto = Produto.criar({
        orgId,
        nome: "Camiseta",
        criadoPor: actorId,
        atualizadoPor: actorId,
      });
      await repository.salvar(produto);

      const response = await app.inject({
        method: "POST",
        url: `/catalogo/produtos/${produto.produtoId}/variantes`,
        headers: { "x-org-id": orgId, "x-user-id": actorId },
        payload: {
          sku: "CAM-M-AZUL",
          nome: "Camiseta M Azul",
          atributos: {
            tamanho: "M",
            cor: "azul",
          },
          preco: 49.99,
          estoque: 10,
        },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.sku).toBe("CAM-M-AZUL");
      expect(body.nome).toBe("Camiseta M Azul");
      expect(body.atributos).toEqual({ tamanho: "M", cor: "azul" });
      expect(body.preco).toBe(49.99);
      expect(body.estoque).toBe(10);
    });

    it("lista variações de um produto", async () => {
      const produto = Produto.criar({
        orgId,
        nome: "Produto com Variações",
        criadoPor: actorId,
        atualizadoPor: actorId,
      });
      await repository.salvar(produto);

      // Criar variação
      await app.inject({
        method: "POST",
        url: `/catalogo/produtos/${produto.produtoId}/variantes`,
        headers: { "x-org-id": orgId, "x-user-id": actorId },
        payload: {
          sku: "VAR-001",
          nome: "Variação 1",
          atributos: { tamanho: "P" },
        },
      });

      // Listar variações
      const response = await app.inject({
        method: "GET",
        url: `/catalogo/produtos/${produto.produtoId}/variantes`,
        headers: { "x-org-id": orgId, "x-user-id": actorId },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(Array.isArray(body.itens)).toBe(true);
      expect(body.itens.length).toBeGreaterThan(0);
    });

    it("atualiza variação", async () => {
      const produto = Produto.criar({
        orgId,
        nome: "Produto Teste",
        criadoPor: actorId,
        atualizadoPor: actorId,
      });
      await repository.salvar(produto);

      // Criar variação
      const createResponse = await app.inject({
        method: "POST",
        url: `/catalogo/produtos/${produto.produtoId}/variantes`,
        headers: { "x-org-id": orgId, "x-user-id": actorId },
        payload: {
          sku: "VAR-002",
          nome: "Variação Original",
          atributos: { cor: "vermelho" },
          preco: 29.99,
        },
      });

      const variante = createResponse.json();

      // Atualizar
      const updateResponse = await app.inject({
        method: "PUT",
        url: `/catalogo/variantes/${variante.varianteId}`,
        headers: { "x-org-id": orgId, "x-user-id": actorId },
        payload: {
          nome: "Variação Atualizada",
          preco: 39.99,
          estoque: 5,
        },
      });

      expect(updateResponse.statusCode).toBe(200);
      const updated = updateResponse.json();
      expect(updated.nome).toBe("Variação Atualizada");
      expect(updated.preco).toBe(39.99);
      expect(updated.estoque).toBe(5);
    });
  });
});
