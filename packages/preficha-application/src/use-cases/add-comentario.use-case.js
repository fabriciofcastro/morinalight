"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdicionarComentarioUseCase = void 0;
const node_crypto_1 = require("node:crypto");
const preficha_domain_1 = require("@morina/preficha-domain");
const preficha_1 = require("../schemas/preficha");
class AdicionarComentarioUseCase {
    deps;
    constructor(deps) {
        this.deps = deps;
    }
    async execute(rawInput) {
        const input = preficha_1.adicionarComentarioInputSchema.parse(rawInput);
        const preficha = await this.deps.prefichaRepository.encontrarPorId(input.orgId, input.prefichaId);
        if (!preficha) {
            throw new Error("Preficha não encontrada");
        }
        if (preficha.dados.orgId !== input.orgId) {
            throw new Error("Preficha não pertence à organização");
        }
        preficha.adicionarComentario(this.deps.actorId, input.comentario);
        await this.deps.prefichaRepository.salvar(preficha);
        if (this.deps.auditoriaRepository) {
            await this.deps.auditoriaRepository.registrar(new preficha_domain_1.PrefichaAuditoria({
                id: (0, node_crypto_1.randomUUID)(),
                prefichaId: preficha.prefichaId,
                orgId: preficha.dados.orgId,
                acao: "comentario_adicionado",
                actorId: this.deps.actorId,
                payload: {
                    comentario: input.comentario,
                },
                criadoEm: new Date(),
            }));
        }
        return preficha_1.prefichaViewSchema.parse({
            prefichaId: preficha.prefichaId,
            orgId: preficha.dados.orgId,
            produtoId: preficha.dados.produtoId,
            status: preficha.dados.status,
            aprovadores: preficha.dados.aprovadores,
            comentarios: preficha.dados.comentarios,
            criadoPor: preficha.dados.criadoPor,
            atualizadoPor: preficha.dados.atualizadoPor,
            criadoEm: preficha.dados.criadoEm,
            atualizadoEm: preficha.dados.atualizadoEm,
        });
    }
}
exports.AdicionarComentarioUseCase = AdicionarComentarioUseCase;
