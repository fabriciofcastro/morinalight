import type { CategoryRepository } from "@morina/catalogo-domain";
import { Category } from "@morina/catalogo-domain";
import { describe, expect, it } from "vitest";

import { CriarCategoriaUseCase } from "../src/use-cases/criar-categoria.use-case";

class InMemoryCategoryRepository implements CategoryRepository {
  private readonly items = new Map<string, Category>();

  async criar(categoria: Category) {
    this.items.set(categoria.categoriaId, categoria);
  }

  async atualizar(categoria: Category) {
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
    return { itens: [], proximoCursor: null };
  }

  async listarPorParent() {
    return [];
  }

  async contarPorOrg() {
    return 0;
  }

  async remover() {
    // Implementação vazia para testes
  }
}

describe("CriarCategoriaUseCase", () => {
  const orgId = "org-1";

  it("cria categoria com sucesso", async () => {
    const repository = new InMemoryCategoryRepository();
    const useCase = new CriarCategoriaUseCase({
      categoriaRepository: repository,
    });

    const categoria = await useCase.execute({
      orgId,
      name: "Roupas",
      slug: "roupas",
      description: "Categoria de roupas",
    });

    expect(categoria.categoriaId).toBeDefined();
    expect(categoria.name).toBe("Roupas");
    expect(categoria.slug).toBe("roupas");
    expect(categoria.description).toBe("Categoria de roupas");
    expect(categoria.ativo).toBe(true);
    expect(categoria.ordem).toBe(0);
  });

  it("cria categoria com parent", async () => {
    const repository = new InMemoryCategoryRepository();
    const useCase = new CriarCategoriaUseCase({
      categoriaRepository: repository,
    });

    const categoriaPai = await useCase.execute({
      orgId,
      name: "Roupas",
      slug: "roupas",
    });

    const categoriaFilha = await useCase.execute({
      orgId,
      name: "Camisetas",
      slug: "camisetas",
      parentId: categoriaPai.categoriaId,
    });

    expect(categoriaFilha.parentId).toBe(categoriaPai.categoriaId);
  });

  it("lança erro quando slug já existe", async () => {
    const repository = new InMemoryCategoryRepository();
    const useCase = new CriarCategoriaUseCase({
      categoriaRepository: repository,
    });

    await useCase.execute({
      orgId,
      name: "Roupas",
      slug: "roupas",
    });

    await expect(
      useCase.execute({
        orgId,
        name: "Outra Categoria",
        slug: "roupas",
      }),
    ).rejects.toThrow("Categoria com este slug já existe");
  });

  it("lança erro quando parent não existe", async () => {
    const repository = new InMemoryCategoryRepository();
    const useCase = new CriarCategoriaUseCase({
      categoriaRepository: repository,
    });

    await expect(
      useCase.execute({
        orgId,
        name: "Categoria Filha",
        slug: "categoria-filha",
        parentId: "parent-inexistente",
      }),
    ).rejects.toThrow("Categoria pai não encontrada");
  });
});

