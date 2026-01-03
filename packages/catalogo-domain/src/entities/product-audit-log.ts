export type ProdutoAuditoriaProps = {
  id: string;
  produtoId: string;
  orgId: string;
  acao: string;
  actorId: string;
  payload?: Record<string, unknown> | null;
  criadoEm: Date;
};

export class ProdutoAuditoria {
  constructor(private readonly props: ProdutoAuditoriaProps) {}

  get id() {
    return this.props.id;
  }

  get dados() {
    return this.props;
  }
}
