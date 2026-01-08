import { CreateTecidoInput, CreateInsumoTecnicoInput } from "@/lib/api/pre-fichas-tecnicas";

export interface PreFichaFormData {
    codigoPeca: string;
    nomePecaPiloto: string;
    categoria: string;
    fotoPecaUrl: string;
    fotoPecaStorageKey: string;
    gradeTamanhos: string[];
    observacoesTecnicas: string;
    observacoesOficina: string;
    tecidos: CreateTecidoInput[];
    insumosTecnicos: CreateInsumoTecnicoInput[];
    estilistaId: string;
    estilistaNome: string;
    modelistaId: string;
    modelistaNome: string;
    piloteiroId: string;
    piloteiroNome: string;
    houveAlteracao: boolean;
    descricaoAlteracao: string;
}

export type FiltroStatus = "all" | "rascunho" | "submetida_para_revisao_tecnica" | "em_revisao_ficha_tecnica" | "aprovada_tecnicamente" | "aguardando_aval_diretoria" | "liberada_para_producao_piloto" | "reprovada";
