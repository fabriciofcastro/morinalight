/**
 * Value Object para Status da Ficha de Custo
 * Representa o workflow obrigatório
 */
export type StatusFichaCusto = "rascunho" | "enviada_para_conferencia" | "aprovada" | "reprovada";

export class StatusFichaCustoVO {
  private constructor(private readonly status: StatusFichaCusto) {}

  static criar(status: StatusFichaCusto): StatusFichaCustoVO {
    return new StatusFichaCustoVO(status);
  }

  static rascunho(): StatusFichaCustoVO {
    return new StatusFichaCustoVO("rascunho");
  }

  static enviadaParaConferencia(): StatusFichaCustoVO {
    return new StatusFichaCustoVO("enviada_para_conferencia");
  }

  static aprovada(): StatusFichaCustoVO {
    return new StatusFichaCustoVO("aprovada");
  }

  static reprovada(): StatusFichaCustoVO {
    return new StatusFichaCustoVO("reprovada");
  }

  get valor(): StatusFichaCusto {
    return this.status;
  }

  isRascunho(): boolean {
    return this.status === "rascunho";
  }

  isEnviadaParaConferencia(): boolean {
    return this.status === "enviada_para_conferencia";
  }

  isAprovada(): boolean {
    return this.status === "aprovada";
  }

  isReprovada(): boolean {
    return this.status === "reprovada";
  }

  isEditavel(): boolean {
    // Apenas rascunho e reprovada podem ser editadas
    return this.status === "rascunho" || this.status === "reprovada";
  }

  isAprovacaoPermitida(): boolean {
    // Apenas "enviada_para_conferencia" pode ser aprovada/reprovada
    return this.status === "enviada_para_conferencia";
  }

  podeEnviarParaConferencia(): boolean {
    return this.status === "rascunho";
  }

  podeAprovar(): boolean {
    return this.status === "enviada_para_conferencia";
  }

  podeReprovar(): boolean {
    return this.status === "enviada_para_conferencia";
  }

  podeAnexarBoleto(): boolean {
    // Boletos só podem ser anexados após aprovação
    return this.status === "aprovada";
  }

  podeEditar(): boolean {
    // Fichas aprovadas não podem ser editadas após X dias (regra de negócio adicional)
    return this.isEditavel();
  }

  transicaoPermitida(novoStatus: StatusFichaCusto): boolean {
    // Definir transições válidas
    const transicoesValidas: Record<StatusFichaCusto, StatusFichaCusto[]> = {
      rascunho: ["enviada_para_conferencia"],
      enviada_para_conferencia: ["aprovada", "reprovada"],
      aprovada: [], // Ficha aprovada é final (imutável)
      reprovada: ["enviada_para_conferencia"], // Após ajustes, pode ser reenviada
    };

    return transicoesValidas[this.status]?.includes(novoStatus) ?? false;
  }

  formatar(): string {
    const formatacoes: Record<StatusFichaCusto, string> = {
      rascunho: "Rascunho",
      enviada_para_conferencia: "Enviada para Conferência",
      aprovada: "Aprovada",
      reprovada: "Reprovada",
    };
    return formatacoes[this.status];
  }

  equals(other: StatusFichaCustoVO): boolean {
    return this.status === other.status;
  }
}
