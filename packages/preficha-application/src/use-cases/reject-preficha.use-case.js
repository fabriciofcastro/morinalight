"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RejeitarPrefichaUseCase = void 0;
const node_crypto_1 = require("node:crypto");
const preficha_domain_1 = require("@morina/preficha-domain");
const preficha_1 = require("../schemas/preficha");
class RejeitarPrefichaUseCase {
    deps;
    constructor(deps) {
        this.deps = deps;
    }
    async execute(rawInput) {
        const input = preficha_1.rejeitarPrefichaInputSchema.parse(rawInput);
        const preficha = await this.deps.prefichaRepository.encontrarPorId(input.orgId, input.prefichaId);
        if (!preficha) {
            throw new Error("Preficha não encontrada");
        }
        if (preficha.dados.orgId !== input.orgId) {
            throw new Error("Preficha não pertence à organização");
        }
        preficha.rejeitar(this.deps.actorId, input.motivo);
        await this.deps.prefichaRepository.salvar(preficha);
        if (this.deps.auditoriaRepository) {
            await this.deps.auditoriaRepository.registrar(new preficha_domain_1.PrefichaAuditoria({
                id: (0, node_crypto_1.randomUUID)(),
                prefichaId: preficha.prefichaId,
                orgId: preficha.dados.orgId,
                acao: "preficha_rejeitada",
                actorId: this.deps.actorId,
                payload: {
                    motivo: input.motivo,
                },
                criadoEm: new Date(),
            }));
        }
        if (this.deps.eventBus) {
            await this.deps.eventBus.publish({
                name: "Preficha.Rejeitada",
                version: "v1",
                metadata: {
                    eventId: (0, node_crypto_1.randomUUID)(),
                    orgId: preficha.dados.orgId,
                    actorId: this.deps.actorId,
                    timestamp: new Date(),
                },
                payload: {
                    prefichaId: preficha.prefichaId,
                    produtoId: preficha.dados.produtoId,
                    motivo: input.motivo,
                },
            });
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
exports.RejeitarPrefichaUseCase = RejeitarPrefichaUseCase;
