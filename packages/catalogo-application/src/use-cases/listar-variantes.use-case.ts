import type { ProductVariantRepository } from "@morina/catalogo-domain";
import { z } from "zod";
import { varianteViewSchema } from "../schemas/product";

const listarVariantesInputSchema = z.object({
  orgId: z.string().min(1),
  productId: z.string().uuid().optional(),
  ativo: z.boolean().optional(),
  cursor: z.string().optional(),
  limite: z.number().int().min(1).max(50).optional(),
});

type Dependencies = {
  varianteRepository: ProductVariantRepository;
};

export class ListarVariantesUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = listarVariantesInputSchema.parse(rawInput);

    let pagina;

    if (input.productId) {
      pagina = await this.deps.varianteRepository.listarPorProduto(input.productId, input.orgId, {
        ativo: input.ativo,
        cursor: input.cursor,
        limite: input.limite,
      });
    } else {
      pagina = await this.deps.varianteRepository.listarPorOrg(input.orgId, {
        ativo: input.ativo,
        cursor: input.cursor,
        limite: input.limite,
      });
    }

    const itens = pagina.itens.map((variante) =>
      varianteViewSchema.parse({
        varianteId: variante.varianteId,
        orgId: variante.dados.orgId,
        productId: variante.dados.productId,
        sku: variante.dados.sku,
        nome: variante.dados.nome,
        atributos: variante.dados.atributos,
        preco: variante.dados.preco ?? null,
        estoque: variante.dados.estoque ?? null,
        ativo: variante.dados.ativo,
        createdBy: variante.dados.createdBy,
        updatedBy: variante.dados.updatedBy,
        createdAt: variante.dados.createdAt,
        updatedAt: variante.dados.updatedAt,
      }),
    );

    return {
      itens,
      proximoCursor: pagina.proximoCursor ?? null,
    };
  }
}
