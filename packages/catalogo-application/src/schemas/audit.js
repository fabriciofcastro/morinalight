"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listarAuditoriaFeedResultadoSchema = exports.auditoriaFeedItemSchema = exports.listarAuditoriaFeedInputSchema = void 0;
const zod_1 = require("zod");
const product_1 = require("./product");
exports.listarAuditoriaFeedInputSchema = zod_1.z
    .object({
    orgId: zod_1.z.string().min(1),
    acao: zod_1.z.string().min(3).max(120).optional(),
    cursor: zod_1.z.string().optional(),
    limite: zod_1.z.number().int().min(1).max(50).optional(),
    inicio: zod_1.z.coerce.date().optional(),
    fim: zod_1.z.coerce.date().optional(),
})
    .strict();
exports.auditoriaFeedItemSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    produtoId: zod_1.z.string().uuid(),
    orgId: zod_1.z.string().min(1),
    acao: zod_1.z.string().min(1),
    actorId: zod_1.z.string().min(1),
    payload: zod_1.z.unknown().nullable(),
    criadoEm: zod_1.z.date(),
    produto: product_1.produtoViewSchema.nullable().optional(),
});
exports.listarAuditoriaFeedResultadoSchema = zod_1.z.object({
    itens: zod_1.z.array(exports.auditoriaFeedItemSchema),
    proximoCursor: zod_1.z.string().nullable().optional(),
});
