/**
 * Value Object para Status da Pré-Ficha Técnica
 * Representa o workflow obrigatório de aprovação
 */
export type StatusPreFichaTecnica =
  | "rascunho"
  | "submetida_para_revisao_tecnica"
  | "em_revisao_ficha_tecnica"
  | "aprovada_tecnicamente"
  | "aguardando_aval_diretoria"
  | "liberada_para_producao_piloto"
  | "reprovada";

export class StatusPreFichaTecnicaVO {
  private constructor(private readonly status: StatusPreFichaTecnica) {}

  static criar(status: StatusPreFichaTecnica): StatusPreFichaTecnicaVO {
    return new StatusPreFichaTecnicaVO(status);
  }

  static rascunho(): StatusPreFichaTecnicaVO {
    return new StatusPreFichaTecnicaVO("rascunho");
  }

  static submetidaParaRevisaoTecnica(): StatusPreFichaTecnicaVO {
    return new StatusPreFichaTecnicaVO("submetida_para_revisao_tecnica");
  }

  static emRevisaoFichaTecnica(): StatusPreFichaTecnicaVO {
    return new StatusPreFichaTecnicaVO("em_revisao_ficha_tecnica");
  }

  static aprovadaTecnicamente(): StatusPreFichaTecnicaVO {
    return new StatusPreFichaTecnicaVO("aprovada_tecnicamente");
  }

  static aguardandoAvalDiretoria(): StatusPreFichaTecnicaVO {
    return new StatusPreFichaTecnicaVO("aguardando_aval_diretoria");
  }

  static liberadaParaProducaoPiloto(): StatusPreFichaTecnicaVO {
    return new StatusPreFichaTecnicaVO("liberada_para_producao_piloto");
  }

  static reprovada(): StatusPreFichaTecnicaVO {
    return new StatusPreFichaTecnicaVO("reprovada");
  }

  get valor(): StatusPreFichaTecnica {
    return this.status;
  }

  isRascunho(): boolean {
    return this.status === "rascunho";
  }

  isSubmetidaParaRevisaoTecnica(): boolean {
    return this.status === "submetida_para_revisao_tecnica";
  }

  isEmRevisaoFichaTecnica(): boolean {
    return this.status === "em_revisao_ficha_tecnica";
  }

  isAprovadaTecnicamente(): boolean {
    return this.status === "aprovada_tecnicamente";
  }

  isAguardandoAvalDiretoria(): boolean {
    return this.status === "aguardando_aval_diretoria";
  }

  isLiberadaParaProducaoPiloto(): boolean {
    return this.status === "liberada_para_producao_piloto";
  }

  isReprovada(): boolean {
    return this.status === "reprovada";
  }

  isEditavel(): boolean {
    // Apenas rascunho e reprovada podem ser editadas
    return this.status === "rascunho" || this.status === "reprovada";
  }

  isCongelada(): boolean {
    // Campos técnicos congelados após aprovação técnica
    return (
      this.status === "aprovada_tecnicamente" ||
      this.status === "aguardando_aval_diretoria" ||
      this.status === "liberada_para_producao_piloto"
    );
  }

  podeSubmeterParaRevisao(): boolean {
    return this.status === "rascunho";
  }

  podeIniciarRevisao(): boolean {
    return this.status === "submetida_para_revisao_tecnica";
  }

  podeAprovarTecnicamente(): boolean {
    return this.status === "em_revisao_ficha_tecnica";
  }

  podeReprovar(): boolean {
    return (
      this.status === "em_revisao_ficha_tecnica" ||
      this.status === "aguardando_aval_diretoria"
    );
  }

  podeAprovarDiretoria(): boolean {
    return this.status === "aguardando_aval_diretoria";
  }

  transicaoPermitida(novoStatus: StatusPreFichaTecnica): boolean {
    // Definir transições válidas
    const transicoesValidas: Record<StatusPreFichaTecnica, StatusPreFichaTecnica[]> = {
      rascunho: ["submetida_para_revisao_tecnica"],
      submetida_para_revisao_tecnica: ["em_revisao_ficha_tecnica"],
      em_revisao_ficha_tecnica: ["aprovada_tecnicamente", "reprovada"],
      aprovada_tecnicamente: ["aguardando_aval_diretoria"],
      aguardando_aval_diretoria: ["liberada_para_producao_piloto", "reprovada"],
      liberada_para_producao_piloto: [], // Status final e irrevogável
      reprovada: ["rascunho"], // Após ajustes, pode voltar para rascunho
    };

    return transicoesValidas[this.status]?.includes(novoStatus) ?? false;
  }

  formatar(): string {
    const formatacoes: Record<StatusPreFichaTecnica, string> = {
      rascunho: "Rascunho",
      submetida_para_revisao_tecnica: "Submetida para Revisão Técnica",
      em_revisao_ficha_tecnica: "Em Revisão da Ficha Técnica",
      aprovada_tecnicamente: "Aprovada Tecnicamente",
      aguardando_aval_diretoria: "Aguardando Aval da Diretoria",
      liberada_para_producao_piloto: "Liberada para Produção Piloto",
      reprovada: "Reprovada",
    };
    return formatacoes[this.status];
  }

  equals(other: StatusPreFichaTecnicaVO): boolean {
    return this.status === other.status;
  }
}












