import { PrefichaId } from "../value-objects/preficha-id";

export type PrefichaStatus = "rascunho" | "pendente_aprovacao" | "aprovado" | "rejeitado";

export type PrefichaAprovador = {
  userId: string;
  aprovado: boolean;
  aprovadoEm?: Date | null;
  comentario?: string | null;
};

export type PrefichaComentario = {
  id: string;
  userId: string;
  comentario: string;
  criadoEm: Date;
};

export type PrefichaProps = {
  orgId: string;
  produtoId: string;
  status: PrefichaStatus;
  aprovadores: PrefichaAprovador[];
  comentarios: PrefichaComentario[];
  criadoPor: string;
  atualizadoPor: string;
  criadoEm: Date;
  atualizadoEm: Date;
};

export class Preficha {
  constructor(
    private readonly props: PrefichaProps,
    private readonly id: PrefichaId = PrefichaId.from(),
  ) {
    if (!props.orgId) {
      throw new Error("Preficha requer orgId");
    }

    if (!props.produtoId) {
      throw new Error("Preficha requer produtoId");
    }
  }

  static criar(
    input: Omit<PrefichaProps, "criadoEm" | "atualizadoEm" | "status" | "aprovadores" | "comentarios"> & {
      status?: PrefichaStatus;
      aprovadores?: PrefichaAprovador[];
      comentarios?: PrefichaComentario[];
    },
  ) {
    const agora = new Date();
    return new Preficha(
      {
        ...input,
        status: input.status ?? "rascunho",
        aprovadores: input.aprovadores ?? [],
        comentarios: input.comentarios ?? [],
        criadoEm: agora,
        atualizadoEm: agora,
      },
      PrefichaId.from(),
    );
  }

  static restaurar(props: PrefichaProps, id: string) {
    return new Preficha({ ...props }, PrefichaId.from(id));
  }

  get prefichaId() {
    return this.id.toString();
  }

  get dados() {
    return this.props;
  }

  encaminharParaAprovacao(actorId: string, aprovadoresIds: string[]) {
    if (this.props.status !== "rascunho") {
      throw new Error("Somente rascunhos podem ser enviados para aprovação");
    }

    if (aprovadoresIds.length === 0) {
      throw new Error("É necessário pelo menos um aprovador");
    }

    this.props.status = "pendente_aprovacao";
    this.props.aprovadores = aprovadoresIds.map((userId) => ({
      userId,
      aprovado: false,
      aprovadoEm: null,
      comentario: null,
    }));
    this.props.atualizadoPor = actorId;
    this.props.atualizadoEm = new Date();
  }

  aprovar(actorId: string, comentario?: string) {
    if (this.props.status !== "pendente_aprovacao") {
      throw new Error("Preficha precisa estar pendente de aprovação");
    }

    const aprovador = this.props.aprovadores.find((a) => a.userId === actorId);
    if (!aprovador) {
      throw new Error("Usuário não é aprovador desta preficha");
    }

    if (aprovador.aprovado) {
      throw new Error("Preficha já foi aprovada por este aprovador");
    }

    aprovador.aprovado = true;
    aprovador.aprovadoEm = new Date();
    if (comentario) {
      aprovador.comentario = comentario;
    }

    // Verificar se todos os aprovadores aprovaram
    const todosAprovaram = this.props.aprovadores.every((a) => a.aprovado);
    if (todosAprovaram) {
      this.props.status = "aprovado";
    }

    this.props.atualizadoPor = actorId;
    this.props.atualizadoEm = new Date();
  }

  rejeitar(actorId: string, motivo: string) {
    if (this.props.status !== "pendente_aprovacao") {
      throw new Error("Preficha precisa estar pendente de aprovação");
    }

    const aprovador = this.props.aprovadores.find((a) => a.userId === actorId);
    if (!aprovador) {
      throw new Error("Usuário não é aprovador desta preficha");
    }

    this.props.status = "rejeitado";
    aprovador.aprovado = false;
    aprovador.aprovadoEm = new Date();
    aprovador.comentario = motivo;

    // Adicionar comentário de rejeição
    this.adicionarComentario(actorId, `Rejeição: ${motivo}`);

    this.props.atualizadoPor = actorId;
    this.props.atualizadoEm = new Date();
  }

  adicionarComentario(userId: string, comentario: string) {
    if (!comentario || !comentario.trim()) {
      throw new Error("Comentário não pode ser vazio");
    }

    const novoComentario: PrefichaComentario = {
      id: PrefichaId.from().toString(),
      userId,
      comentario: comentario.trim(),
      criadoEm: new Date(),
    };

    this.props.comentarios.push(novoComentario);
    this.props.atualizadoEm = new Date();
    this.props.atualizadoPor = userId;
  }

  retornarParaRascunho(actorId: string) {
    if (this.props.status !== "rejeitado") {
      throw new Error("Somente prefichas rejeitadas podem ser retornadas para rascunho");
    }

    this.props.status = "rascunho";
    this.props.aprovadores = [];
    this.props.atualizadoPor = actorId;
    this.props.atualizadoEm = new Date();
  }
}

