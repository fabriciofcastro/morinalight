"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prefichaViewSchema = exports.adicionarComentarioInputSchema = exports.obterPrefichaInputSchema = exports.listarPrefichasInputSchema = exports.rejeitarPrefichaInputSchema = exports.aprovarPrefichaInputSchema = exports.criarPrefichaInputSchema = void 0;
const zod_1 = require("zod");
exports.criarPrefichaInputSchema = zod_1.z.object({
    orgId: zod_1.z.string().min(1),
    produtoId: zod_1.z.string().min(1),
    aprovadoresIds: zod_1.z.array(zod_1.z.string().min(1)).min(1, "É necessário pelo menos um aprovador"),
});
exports.aprovarPrefichaInputSchema = zod_1.z.object({
    orgId: zod_1.z.string().min(1),
    prefichaId: zod_1.z.string().min(1),
    comentario: zod_1.z.string().optional(),
});
exports.rejeitarPrefichaInputSchema = zod_1.z.object({
    orgId: zod_1.z.string().min(1),
    prefichaId: zod_1.z.string().min(1),
    motivo: zod_1.z.string().min(1, "Motivo da rejeição é obrigatório"),
});
exports.listarPrefichasInputSchema = zod_1.z.object({
    orgId: zod_1.z.string().min(1),
    status: zod_1.z.enum(["rascunho", "pendente_aprovacao", "aprovado", "rejeitado"]).optional(),
    produtoId: zod_1.z.string().optional(),
    busca: zod_1.z.string().min(2).max(120).optional(),
    cursor: zod_1.z.string().optional(),
    limite: zod_1.z.number().int().min(1).max(50).optional(),
});
exports.obterPrefichaInputSchema = zod_1.z.object({
    orgId: zod_1.z.string().min(1),
    prefichaId: zod_1.z.string().min(1),
});
exports.adicionarComentarioInputSchema = zod_1.z.object({
    orgId: zod_1.z.string().min(1),
    prefichaId: zod_1.z.string().min(1),
    comentario: zod_1.z.string().min(1, "Comentário não pode ser vazio"),
});
exports.prefichaViewSchema = zod_1.z.object({
    prefichaId: zod_1.z.string(),
    orgId: zod_1.z.string(),
    produtoId: zod_1.z.string(),
    status: zod_1.z.enum(["rascunho", "pendente_aprovacao", "aprovado", "rejeitado"]),
    aprovadores: zod_1.z.array(zod_1.z.object({
        userId: zod_1.z.string(),
        aprovado: zod_1.z.boolean(),
        aprovadoEm: zod_1.z.date().nullable(),
        comentario: zod_1.z.string().nullable(),
    })),
    comentarios: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        userId: zod_1.z.string(),
        comentario: zod_1.z.string(),
        criadoEm: zod_1.z.date(),
    })),
    criadoPor: zod_1.z.string(),
    atualizadoPor: zod_1.z.string(),
    criadoEm: zod_1.z.date(),
    atualizadoEm: zod_1.z.date(),
});
