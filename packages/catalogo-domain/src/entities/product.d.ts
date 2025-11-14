import { ProductId } from "../value-objects/product-id";
export type ProdutoStatus = "rascunho" | "aguardando_aprovacao" | "ativo" | "inativo";
export type ProdutoProps = {
  orgId: string;
  nome: string;
  descricao?: string | null;
  sku?: string | null;
  categoryId?: string | null;
  status: ProdutoStatus;
  criadoPor: string;
  atualizadoPor: string;
  criadoEm: Date;
  atualizadoEm: Date;
};
export declare class Produto {
  private readonly props;
  private readonly id;
  constructor(props: ProdutoProps, id?: ProductId);
  static criar(
    input: Omit<ProdutoProps, "criadoEm" | "atualizadoEm" | "status"> & {
      status?: ProdutoStatus;
    },
  ): Produto;
  static restaurar(props: ProdutoProps, id: string): Produto;
  get produtoId(): string;
  get dados(): ProdutoProps;
  aprovar(actorId: string): void;
  reprovar(actorId: string, motivo?: string): void;
  encaminharParaAprovacao(actorId: string): void;
  atualizarNome(nome: string, actorId: string): void;
  atualizarDescricao(descricao: string | null, actorId: string): void;
  atualizarSku(sku: string | null, actorId: string): void;
  atualizarCategoria(categoryId: string | null, actorId: string): void;
}
