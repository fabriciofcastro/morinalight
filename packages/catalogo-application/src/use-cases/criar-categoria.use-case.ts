import type { CategoryRepository } from "@morina/catalogo-domain";
import { Category } from "@morina/catalogo-domain";
import {
  criarCategoriaInputSchema,
  categoriaViewSchema,
} from "../schemas/product";

type Dependencies = {
  categoriaRepository: CategoryRepository;
};

export class CriarCategoriaUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = criarCategoriaInputSchema.parse(rawInput);

    const categoriaExistente =
      await this.deps.categoriaRepository.encontrarPorSlug(
        input.slug,
        input.orgId,
      );

    if (categoriaExistente) {
      throw new Error("Categoria com este slug já existe");
    }

    if (input.parentId) {
      const parent = await this.deps.categoriaRepository.encontrarPorId(
        input.parentId,
        input.orgId,
      );

      if (!parent) {
        throw new Error("Categoria pai não encontrada");
      }
    }

    const categoria = Category.criar({
      orgId: input.orgId,
      name: input.name,
      slug: input.slug,
      description: input.description ?? null,
      parentId: input.parentId ?? null,
      ordem: input.ordem ?? 0,
      ativo: input.ativo ?? true,
    });

    await this.deps.categoriaRepository.criar(categoria);

    return categoriaViewSchema.parse({
      categoriaId: categoria.categoriaId,
      orgId: categoria.dados.orgId,
      name: categoria.dados.name,
      slug: categoria.dados.slug,
      description: categoria.dados.description ?? null,
      parentId: categoria.dados.parentId ?? null,
      ordem: categoria.dados.ordem,
      ativo: categoria.dados.ativo,
      createdAt: categoria.dados.createdAt,
      updatedAt: categoria.dados.updatedAt,
    });
  }
}


