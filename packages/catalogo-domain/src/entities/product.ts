import { ProductId } from "../value-objects/product-id";

export type ProdutoStatus = "rascunho" | "aguardando_aprovacao" | "ativo" | "inativo";

export type ProdutoProps = {
  orgId: string;
  nome: string;
  descricao?: string | null;
  status: ProdutoStatus;
  criadoPor: string;
  atualizadoPor: string;
  criadoEm: Date;
  atualizadoEm: Date;
};

export class Produto {
  constructor(
    private readonly props: ProdutoProps,
    private readonly id: ProductId = ProductId.from(),
  ) {
    if (!props.orgId) {
      throw new Error("Produto requer orgId");
    }

    if (!props.nome) {
      throw new Error("Produto requer nome");
    }
  }

  static criar(
    input: Omit<ProdutoProps, "criadoEm" | "atualizadoEm" | "status"> & { status?: ProdutoStatus },
  ) {
    const agora = new Date();
    return new Produto(
      {
        ...input,
        status: input.status ?? "rascunho",
        criadoEm: agora,
        atualizadoEm: agora,
      },
      ProductId.from(),
    );
  }

  static restaurar(props: ProdutoProps, id: string) {
    return new Produto({ ...props }, ProductId.from(id));
  }

  get produtoId() {
    return this.id.toString();
  }

  get dados() {
    return this.props;
  }

  aprovar(actorId: string) {
    if (this.props.status !== "aguardando_aprovacao") {
      throw new Error("Produto precisa estar aguardando aprovação");
    }

    this.props.status = "ativo";
    this.props.atualizadoPor = actorId;
    this.props.atualizadoEm = new Date();
  }

  reprovar(actorId: string, motivo?: string) {
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

  encaminharParaAprovacao(actorId: string) {
    if (this.props.status !== "rascunho") {
      throw new Error("Somente rascunhos podem ser enviados");
    }

    this.props.status = "aguardando_aprovacao";
    this.props.atualizadoPor = actorId;
    this.props.atualizadoEm = new Date();
  }
}
