export type PrefichaAuditoriaProps = {
  id: string;
  prefichaId: string;
  orgId: string;
  acao: string;
  actorId: string;
  payload?: Record<string, unknown> | null;
  criadoEm: Date;
};

export class PrefichaAuditoria {
  constructor(private readonly props: PrefichaAuditoriaProps) {}

  get id() {
    return this.props.id;
  }

  get dados() {
    return this.props;
  }
}


