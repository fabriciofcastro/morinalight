import { z } from "zod";
export declare const criarPrefichaInputSchema: z.ZodObject<{
    orgId: z.ZodString;
    produtoId: z.ZodString;
    aprovadoresIds: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    orgId: string;
    produtoId: string;
    aprovadoresIds: string[];
}, {
    orgId: string;
    produtoId: string;
    aprovadoresIds: string[];
}>;
export declare const aprovarPrefichaInputSchema: z.ZodObject<{
    orgId: z.ZodString;
    prefichaId: z.ZodString;
    comentario: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    orgId: string;
    prefichaId: string;
    comentario?: string | undefined;
}, {
    orgId: string;
    prefichaId: string;
    comentario?: string | undefined;
}>;
export declare const rejeitarPrefichaInputSchema: z.ZodObject<{
    orgId: z.ZodString;
    prefichaId: z.ZodString;
    motivo: z.ZodString;
}, "strip", z.ZodTypeAny, {
    orgId: string;
    prefichaId: string;
    motivo: string;
}, {
    orgId: string;
    prefichaId: string;
    motivo: string;
}>;
export declare const listarPrefichasInputSchema: z.ZodObject<{
    orgId: z.ZodString;
    status: z.ZodOptional<z.ZodEnum<["rascunho", "pendente_aprovacao", "aprovado", "rejeitado"]>>;
    produtoId: z.ZodOptional<z.ZodString>;
    busca: z.ZodOptional<z.ZodString>;
    cursor: z.ZodOptional<z.ZodString>;
    limite: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    orgId: string;
    status?: "aprovado" | "rascunho" | "pendente_aprovacao" | "rejeitado" | undefined;
    cursor?: string | undefined;
    produtoId?: string | undefined;
    busca?: string | undefined;
    limite?: number | undefined;
}, {
    orgId: string;
    status?: "aprovado" | "rascunho" | "pendente_aprovacao" | "rejeitado" | undefined;
    cursor?: string | undefined;
    produtoId?: string | undefined;
    busca?: string | undefined;
    limite?: number | undefined;
}>;
export declare const obterPrefichaInputSchema: z.ZodObject<{
    orgId: z.ZodString;
    prefichaId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    orgId: string;
    prefichaId: string;
}, {
    orgId: string;
    prefichaId: string;
}>;
export declare const adicionarComentarioInputSchema: z.ZodObject<{
    orgId: z.ZodString;
    prefichaId: z.ZodString;
    comentario: z.ZodString;
}, "strip", z.ZodTypeAny, {
    orgId: string;
    prefichaId: string;
    comentario: string;
}, {
    orgId: string;
    prefichaId: string;
    comentario: string;
}>;
export declare const prefichaViewSchema: z.ZodObject<{
    prefichaId: z.ZodString;
    orgId: z.ZodString;
    produtoId: z.ZodString;
    status: z.ZodEnum<["rascunho", "pendente_aprovacao", "aprovado", "rejeitado"]>;
    aprovadores: z.ZodArray<z.ZodObject<{
        userId: z.ZodString;
        aprovado: z.ZodBoolean;
        aprovadoEm: z.ZodNullable<z.ZodDate>;
        comentario: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        userId: string;
        aprovado: boolean;
        aprovadoEm: Date | null;
        comentario: string | null;
    }, {
        userId: string;
        aprovado: boolean;
        aprovadoEm: Date | null;
        comentario: string | null;
    }>, "many">;
    comentarios: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        userId: z.ZodString;
        comentario: z.ZodString;
        criadoEm: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        userId: string;
        id: string;
        comentario: string;
        criadoEm: Date;
    }, {
        userId: string;
        id: string;
        comentario: string;
        criadoEm: Date;
    }>, "many">;
    criadoPor: z.ZodString;
    atualizadoPor: z.ZodString;
    criadoEm: z.ZodDate;
    atualizadoEm: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    status: "aprovado" | "rascunho" | "pendente_aprovacao" | "rejeitado";
    orgId: string;
    criadoPor: string;
    produtoId: string;
    prefichaId: string;
    atualizadoPor: string;
    aprovadores: {
        userId: string;
        aprovado: boolean;
        aprovadoEm: Date | null;
        comentario: string | null;
    }[];
    comentarios: {
        userId: string;
        id: string;
        comentario: string;
        criadoEm: Date;
    }[];
    criadoEm: Date;
    atualizadoEm: Date;
}, {
    status: "aprovado" | "rascunho" | "pendente_aprovacao" | "rejeitado";
    orgId: string;
    criadoPor: string;
    produtoId: string;
    prefichaId: string;
    atualizadoPor: string;
    aprovadores: {
        userId: string;
        aprovado: boolean;
        aprovadoEm: Date | null;
        comentario: string | null;
    }[];
    comentarios: {
        userId: string;
        id: string;
        comentario: string;
        criadoEm: Date;
    }[];
    criadoEm: Date;
    atualizadoEm: Date;
}>;
export type CriarPrefichaInput = z.infer<typeof criarPrefichaInputSchema>;
export type AprovarPrefichaInput = z.infer<typeof aprovarPrefichaInputSchema>;
export type RejeitarPrefichaInput = z.infer<typeof rejeitarPrefichaInputSchema>;
export type ListarPrefichasInput = z.infer<typeof listarPrefichasInputSchema>;
export type ObterPrefichaInput = z.infer<typeof obterPrefichaInputSchema>;
export type AdicionarComentarioInput = z.infer<typeof adicionarComentarioInputSchema>;
export type PrefichaView = z.infer<typeof prefichaViewSchema>;
