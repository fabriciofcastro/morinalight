import type { CategoryRepository } from "@morina/catalogo-domain";
import { atualizarCategoriaInputSchema, categoriaViewSchema } from "../schemas/product";

type Dependencies = {
  categoriaRepository: CategoryRepository;
};

export class AtualizarCategoriaUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = atualizarCategoriaInputSchema.parse(rawInput);

    const categoria = await this.deps.categoriaRepository.encontrarPorId(
      input.categoriaId,
      input.orgId,
    );

    if (!categoria) {
      throw new Error("Categoria não encontrada");
    }

    if (input.name !== undefined) {
      categoria.atualizarNome(input.name);
    }

    if (input.description !== undefined) {
      categoria.atualizarDescricao(input.description);
    }

    if (input.ordem !== undefined) {
      categoria.atualizarOrdem(input.ordem);
    }

    if (input.parentId !== undefined) {
      if (input.parentId) {
        const parent = await this.deps.categoriaRepository.encontrarPorId(
          input.parentId,
          input.orgId,
        );

        if (!parent) {
          throw new Error("Categoria pai não encontrada");
        }

        // Verificar se não está criando um ciclo
        if (input.parentId === input.categoriaId) {
          throw new Error("Categoria não pode ser pai de si mesma");
        }
      }

      categoria.moverParaCategoriaPai(input.parentId);
    }

    if (input.ativo !== undefined) {
      if (input.ativo) {
        categoria.ativar();
      } else {
        categoria.desativar();
      }
    }

    await this.deps.categoriaRepository.atualizar(categoria);

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
