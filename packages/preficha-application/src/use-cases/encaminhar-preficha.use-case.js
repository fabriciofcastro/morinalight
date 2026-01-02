"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncaminharPrefichaUseCase = void 0;
const node_crypto_1 = require("node:crypto");
const preficha_domain_1 = require("@morina/preficha-domain");
const preficha_1 = require("../schemas/preficha");
class EncaminharPrefichaUseCase {
    deps;
    constructor(deps) {
        this.deps = deps;
    }
    async execute(rawInput) {
        const input = preficha_1.criarPrefichaInputSchema.parse(rawInput);
        const preficha = await this.deps.prefichaRepository.encontrarPorProdutoId(input.orgId, input.produtoId);
        if (!preficha) {
            throw new Error("Preficha não encontrada");
        }
        if (preficha.dados.orgId !== input.orgId) {
            throw new Error("Preficha não pertence à organização");
        }
        preficha.encaminharParaAprovacao(this.deps.actorId, input.aprovadoresIds);
        await this.deps.prefichaRepository.salvar(preficha);
        if (this.deps.auditoriaRepository) {
            await this.deps.auditoriaRepository.registrar(new preficha_domain_1.PrefichaAuditoria({
                id: (0, node_crypto_1.randomUUID)(),
                prefichaId: preficha.prefichaId,
                orgId: preficha.dados.orgId,
                acao: "preficha_encaminhada",
                actorId: this.deps.actorId,
                payload: {
                    aprovadoresIds: input.aprovadoresIds,
                },
                criadoEm: new Date(),
            }));
        }
        if (this.deps.eventBus) {
            await this.deps.eventBus.publish({
                name: "Preficha.Encaminhada",
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
                    aprovadoresIds: input.aprovadoresIds,
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
exports.EncaminharPrefichaUseCase = EncaminharPrefichaUseCase;
