import type { ProductVariantRepository, ProdutoRepository } from "@morina/catalogo-domain";
import { ProductVariant } from "@morina/catalogo-domain";
import { ProdutoNotFoundError } from "../errors/produto-not-found.error";
import {
  criarVarianteInputSchema,
  varianteViewSchema,
} from "../schemas/product";

type Dependencies = {
  produtoRepository: ProdutoRepository;
  varianteRepository: ProductVariantRepository;
  actorId: string;
};

export class CriarVarianteUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(rawInput: unknown) {
    const input = criarVarianteInputSchema.parse(rawInput);

    const produto = await this.deps.produtoRepository.encontrarPorId(
      input.orgId,
      input.productId,
    );

    if (!produto) {
      throw new ProdutoNotFoundError(input.productId);
    }

    const varianteExistente =
      await this.deps.varianteRepository.encontrarPorSku(
        input.sku,
        input.orgId,
      );

    if (varianteExistente) {
      throw new Error("Variante com este SKU já existe");
    }

    const variante = ProductVariant.criar({
      productId: input.productId,
      orgId: input.orgId,
      sku: input.sku,
      nome: input.nome,
      atributos: input.atributos,
      preco: input.preco ?? null,
      estoque: input.estoque ?? null,
      ativo: input.ativo ?? true,
      createdBy: this.deps.actorId,
      updatedBy: this.deps.actorId,
    });

    await this.deps.varianteRepository.criar(variante);

    return varianteViewSchema.parse({
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
    });
  }
}


