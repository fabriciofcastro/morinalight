"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtualizarVarianteUseCase = void 0;
const product_1 = require("../schemas/product");
class AtualizarVarianteUseCase {
    deps;
    constructor(deps) {
        this.deps = deps;
    }
    async execute(rawInput) {
        const input = product_1.atualizarVarianteInputSchema.parse(rawInput);
        const variante = await this.deps.varianteRepository.encontrarPorId(input.varianteId, input.orgId);
        if (!variante) {
            throw new Error("Variante não encontrada");
        }
        if (input.nome !== undefined) {
            variante.atualizarNome(input.nome, this.deps.actorId);
        }
        if (input.atributos !== undefined) {
            variante.atualizarAtributos(input.atributos, this.deps.actorId);
        }
        if (input.preco !== undefined) {
            variante.atualizarPreco(input.preco, this.deps.actorId);
        }
        if (input.estoque !== undefined) {
            variante.atualizarEstoque(input.estoque, this.deps.actorId);
        }
        if (input.ativo !== undefined) {
            if (input.ativo) {
                variante.ativar(this.deps.actorId);
            }
            else {
                variante.desativar(this.deps.actorId);
            }
        }
        await this.deps.varianteRepository.atualizar(variante);
        return product_1.varianteViewSchema.parse({
            varianteId: variante.varianteId,
            orgId: variante.dados.orgId,
            productId: variante.dados.productId,
            sku: variante.dados.sku,
            nome: variante.dados.nome,
            atributos: variante.dados.atributos,
            preco: variante.dados.preco ?? null,
            estoque: variante.dados.estoque ?? null,
            ativo: variante.dados.ativo,
            createdBy: variante.dados.createdBy,
            updatedBy: variante.dados.updatedBy,
            createdAt: variante.dados.createdAt,
            updatedAt: variante.dados.updatedAt,
        });
    }
}
exports.AtualizarVarianteUseCase = AtualizarVarianteUseCase;
