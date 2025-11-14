Object.defineProperty(exports, "__esModule", { value: true });
exports.Preficha = void 0;
const preficha_id_1 = require("../value-objects/preficha-id");
class Preficha {
  props;
  id;
  constructor(props, id = preficha_id_1.PrefichaId.from()) {
    this.props = props;
    this.id = id;
    if (!props.orgId) {
      throw new Error("Preficha requer orgId");
    }
    if (!props.produtoId) {
      throw new Error("Preficha requer produtoId");
    }
  }
  static criar(input) {
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
      preficha_id_1.PrefichaId.from(),
    );
  }
  static restaurar(props, id) {
    return new Preficha({ ...props }, preficha_id_1.PrefichaId.from(id));
  }
  get prefichaId() {
    return this.id.toString();
  }
  get dados() {
    return this.props;
  }
  encaminharParaAprovacao(actorId, aprovadoresIds) {
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
  aprovar(actorId, comentario) {
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
  rejeitar(actorId, motivo) {
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
  adicionarComentario(userId, comentario) {
    if (!comentario || !comentario.trim()) {
      throw new Error("Comentário não pode ser vazio");
    }
    const novoComentario = {
      id: preficha_id_1.PrefichaId.from().toString(),
      userId,
      comentario: comentario.trim(),
      criadoEm: new Date(),
    };
    this.props.comentarios.push(novoComentario);
    this.props.atualizadoEm = new Date();
    this.props.atualizadoPor = userId;
  }
  retornarParaRascunho(actorId) {
    if (this.props.status !== "rejeitado") {
      throw new Error("Somente prefichas rejeitadas podem ser retornadas para rascunho");
    }
    this.props.status = "rascunho";
    this.props.aprovadores = [];
    this.props.atualizadoPor = actorId;
    this.props.atualizadoEm = new Date();
  }
}
exports.Preficha = Preficha;
