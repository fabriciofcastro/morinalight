Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductVariant = void 0;
const product_variant_id_1 = require("../value-objects/product-variant-id");
class ProductVariant {
  props;
  id;
  constructor(props, id = product_variant_id_1.ProductVariantId.from()) {
    this.props = props;
    this.id = id;
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
  static criar(input) {
    const agora = new Date();
    return new ProductVariant(
      {
        ...input,
        estoque: input.estoque ?? 0,
        ativo: input.ativo ?? true,
        createdAt: agora,
        updatedAt: agora,
      },
      product_variant_id_1.ProductVariantId.from(),
    );
  }
  static restaurar(props, id) {
    return new ProductVariant({ ...props }, product_variant_id_1.ProductVariantId.from(id));
  }
  get varianteId() {
    return this.id.toString();
  }
  get dados() {
    return this.props;
  }
  atualizarPreco(preco, actorId) {
    if (preco !== null && preco < 0) {
      throw new Error("Preço não pode ser negativo");
    }
    this.props.preco = preco;
    this.props.updatedBy = actorId;
    this.props.updatedAt = new Date();
  }
  atualizarEstoque(estoque, actorId) {
    if (estoque !== null && estoque < 0) {
      throw new Error("Estoque não pode ser negativo");
    }
    this.props.estoque = estoque ?? 0;
    this.props.updatedBy = actorId;
    this.props.updatedAt = new Date();
  }
  adicionarEstoque(quantidade, actorId) {
    if (quantidade < 0) {
      throw new Error("Quantidade a adicionar não pode ser negativa");
    }
    this.props.estoque = (this.props.estoque ?? 0) + quantidade;
    this.props.updatedBy = actorId;
    this.props.updatedAt = new Date();
  }
  removerEstoque(quantidade, actorId) {
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
  atualizarAtributos(atributos, actorId) {
    this.props.atributos = { ...this.props.atributos, ...atributos };
    this.props.updatedBy = actorId;
    this.props.updatedAt = new Date();
  }
  desativar(actorId) {
    this.props.ativo = false;
    this.props.updatedBy = actorId;
    this.props.updatedAt = new Date();
  }
  ativar(actorId) {
    this.props.ativo = true;
    this.props.updatedBy = actorId;
    this.props.updatedAt = new Date();
  }
  atualizarNome(nome, actorId) {
    if (!nome || nome.trim().length === 0) {
      throw new Error("Nome da variação não pode ser vazio");
    }
    this.props.nome = nome;
    this.props.updatedBy = actorId;
    this.props.updatedAt = new Date();
  }
}
exports.ProductVariant = ProductVariant;
