import { StatusPreFichaTecnica } from "@/lib/api/pre-fichas-tecnicas";

export const STATUS_COLORS: Record<StatusPreFichaTecnica, string> = {
    rascunho: "bg-gray-500",
    submetida_para_revisao_tecnica: "bg-blue-500",
    em_revisao_ficha_tecnica: "bg-yellow-500",
    aprovada_tecnicamente: "bg-green-500",
    aguardando_aval_diretoria: "bg-purple-500",
    liberada_para_producao_piloto: "bg-emerald-500",
    reprovada: "bg-red-500",
};

export const STATUS_LABELS: Record<StatusPreFichaTecnica, string> = {
    rascunho: "Rascunho",
    submetida_para_revisao_tecnica: "Aguardando Revisão Técnica",
    em_revisao_ficha_tecnica: "Em Revisão Técnica",
    aprovada_tecnicamente: "Aprovada Tecnicamente",
    aguardando_aval_diretoria: "Aguardando Diretoria",
    liberada_para_producao_piloto: "Liberada para Produção",
    reprovada: "Reprovada",
};

export const GRADE_TAMANHOS = ["PP", "P", "M", "G", "GG", "XG"];
