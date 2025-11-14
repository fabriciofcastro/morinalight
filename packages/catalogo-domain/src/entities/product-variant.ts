import { ProductVariantId } from "../value-objects/product-variant-id";

export type ProductVariantAttributes = Record<string, string | number | boolean>;

export type ProductVariantProps = {
  productId: string;
  orgId: string;
  sku: string;
  nome: string;
  atributos: ProductVariantAttributes;
  preco?: number | null;
  estoque?: number | null;
  ativo: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export class ProductVariant {
  constructor(
    private readonly props: ProductVariantProps,
    private readonly id: ProductVariantId = ProductVariantId.from(),
  ) {
    if (!props.orgId) {
      throw new Error("Variação requer orgId");
    }

    if (!props.productId) {
      throw new Error("Variação requer productId");
    }

    if (!props.sku) {
      throw new Error("Variação requer sku");
    }

    if (!props.nome) {
      throw new Error("Variação requer nome");
    }
  }

  static criar(
    input: Omit<ProductVariantProps, "criadoEm" | "atualizadoEm" | "ativo"> & {
      ativo?: boolean;
    },
  ) {
    const agora = new Date();
    return new ProductVariant(
      {
        ...input,
        estoque: input.estoque ?? 0,
        ativo: input.ativo ?? true,
        createdAt: agora,
        updatedAt: agora,
      },
      ProductVariantId.from(),
    );
  }

  static restaurar(props: ProductVariantProps, id: string) {
    return new ProductVariant({ ...props }, ProductVariantId.from(id));
  }

  get varianteId() {
    return this.id.toString();
  }

  get dados() {
    return this.props;
  }

  atualizarPreco(preco: number | null, actorId: string) {
    if (preco !== null && preco < 0) {
      throw new Error("Preço não pode ser negativo");
    }
    this.props.preco = preco;
    this.props.updatedBy = actorId;
    this.props.updatedAt = new Date();
  }

  atualizarEstoque(estoque: number | null, actorId: string) {
    if (estoque !== null && estoque < 0) {
      throw new Error("Estoque não pode ser negativo");
    }
    this.props.estoque = estoque ?? 0;
    this.props.updatedBy = actorId;
    this.props.updatedAt = new Date();
  }

  adicionarEstoque(quantidade: number, actorId: string) {
    if (quantidade < 0) {
      throw new Error("Quantidade a adicionar não pode ser negativa");
    }
    this.props.estoque = (this.props.estoque ?? 0) + quantidade;
    this.props.updatedBy = actorId;
    this.props.updatedAt = new Date();
  }

  removerEstoque(quantidade: number, actorId: string) {
    if (quantidade < 0) {
      throw new Error("Quantidade a remover não pode ser negativa");
    }
    const estoqueAtual = this.props.estoque ?? 0;
    if (estoqueAtual < quantidade) {
      throw new Error("Estoque insuficiente");
    }
    this.props.estoque = estoqueAtual - quantidade;
    this.props.updatedBy = actorId;
    this.props.updatedAt = new Date();
  }

  atualizarAtributos(atributos: ProductVariantAttributes, actorId: string) {
    this.props.atributos = { ...this.props.atributos, ...atributos };
    this.props.updatedBy = actorId;
    this.props.updatedAt = new Date();
  }

  desativar(actorId: string) {
    this.props.ativo = false;
    this.props.updatedBy = actorId;
    this.props.updatedAt = new Date();
  }

  ativar(actorId: string) {
    this.props.ativo = true;
    this.props.updatedBy = actorId;
    this.props.updatedAt = new Date();
  }

  atualizarNome(nome: string, actorId: string) {
    if (!nome || nome.trim().length === 0) {
      throw new Error("Nome da variação não pode ser vazio");
    }
    this.props.nome = nome;
    this.props.updatedBy = actorId;
    this.props.updatedAt = new Date();
  }
}
