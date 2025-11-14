import type { CategoryRepository } from "@morina/catalogo-domain";
import { z } from "zod";
import { categoriaViewSchema } from "../schemas/product";

const listarCategoriasInputSchema = z.object({
  orgId: z.string().min(1),
  parentId: z.string().uuid().nullable().optional(),
  ativo: z.boolean().optional(),
  cursor: z.string().optional(),
  limite: z.number().int().min(1).max(50).optional(),
});

type Dependencies = {
  categoriaRepository: CategoryRepository;
};

export class ListarCategoriasUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = listarCategoriasInputSchema.parse(rawInput);

    const pagina = await this.deps.categoriaRepository.listarPorOrg(
      input.orgId,
      {
        parentId: input.parentId ?? undefined,
        ativo: input.ativo,
        cursor: input.cursor,
        limite: input.limite,
      },
    );

    const itens = pagina.itens.map((categoria) =>
      categoriaViewSchema.parse({
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
      }),
    );

    return {
      itens,
      proximoCursor: pagina.proximoCursor ?? null,
    };
  }
}


