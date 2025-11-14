Object.defineProperty(exports, "__esModule", { value: true });
exports.Produto = void 0;
const product_id_1 = require("../value-objects/product-id");
class Produto {
  props;
  id;
  constructor(props, id = product_id_1.ProductId.from()) {
    this.props = props;
    this.id = id;
    if (!props.orgId) {
      throw new Error("Produto requer orgId");
    }
    if (!props.nome) {
      throw new Error("Produto requer nome");
    }
  }
  static criar(input) {
    const agora = new Date();
    return new Produto(
      {
        ...input,
        status: input.status ?? "rascunho",
        criadoEm: agora,
        atualizadoEm: agora,
      },
      product_id_1.ProductId.from(),
    );
  }
  static restaurar(props, id) {
    return new Produto({ ...props }, product_id_1.ProductId.from(id));
  }
  get produtoId() {
    return this.id.toString();
  }
  get dados() {
    return this.props;
  }
  aprovar(actorId) {
    if (this.props.status !== "aguardando_aprovacao") {
      throw new Error("Produto precisa estar aguardando aprovação");
    }
    this.props.status = "ativo";
    this.props.atualizadoPor = actorId;
    this.props.atualizadoEm = new Date();
  }
  reprovar(actorId, motivo) {
    if (this.props.status !== "aguardando_aprovacao") {
      throw new Error("Produto precisa estar aguardando aprovação");
    }
    this.props.status = "inativo";
    this.props.atualizadoPor = actorId;
    this.props.atualizadoEm = new Date();
    if (motivo) {
      this.props.descricao = `${this.props.descricao ?? ""}
Reprovação: ${motivo}`.trim();
    }
  }
  encaminharParaAprovacao(actorId) {
    if (this.props.status !== "rascunho") {
      throw new Error("Somente rascunhos podem ser enviados");
    }
    this.props.status = "aguardando_aprovacao";
    this.props.atualizadoPor = actorId;
    this.props.atualizadoEm = new Date();
  }
  atualizarNome(nome, actorId) {
    if (!nome || nome.trim().length === 0) {
      throw new Error("Nome do produto não pode ser vazio");
    }
    this.props.nome = nome;
    this.props.atualizadoPor = actorId;
    this.props.atualizadoEm = new Date();
  }
  atualizarDescricao(descricao, actorId) {
    this.props.descricao = descricao;
    this.props.atualizadoPor = actorId;
    this.props.atualizadoEm = new Date();
  }
  atualizarSku(sku, actorId) {
    this.props.sku = sku;
    this.props.atualizadoPor = actorId;
    this.props.atualizadoEm = new Date();
  }
  atualizarCategoria(categoryId, actorId) {
    this.props.categoryId = categoryId;
    this.props.atualizadoPor = actorId;
    this.props.atualizadoEm = new Date();
  }
}
exports.Produto = Produto;
