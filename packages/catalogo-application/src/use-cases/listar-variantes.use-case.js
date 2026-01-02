"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListarVariantesUseCase = void 0;
const zod_1 = require("zod");
const product_1 = require("../schemas/product");
const listarVariantesInputSchema = zod_1.z.object({
    orgId: zod_1.z.string().min(1),
    productId: zod_1.z.string().uuid().optional(),
    ativo: zod_1.z.boolean().optional(),
    cursor: zod_1.z.string().optional(),
    limite: zod_1.z.number().int().min(1).max(50).optional(),
});
class ListarVariantesUseCase {
    deps;
    constructor(deps) {
        this.deps = deps;
    }
    async execute(rawInput) {
        const input = listarVariantesInputSchema.parse(rawInput);
        let pagina;
        if (input.productId) {
            pagina = await this.deps.varianteRepository.listarPorProduto(input.productId, input.orgId, {
                ativo: input.ativo,
                cursor: input.cursor,
                limite: input.limite,
            });
        }
        else {
            pagina = await this.deps.varianteRepository.listarPorOrg(input.orgId, {
                ativo: input.ativo,
                cursor: input.cursor,
                limite: input.limite,
            });
        }
        const itens = pagina.itens.map((variante) => product_1.varianteViewSchema.parse({
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
        }));
        return {
            itens,
            proximoCursor: pagina.proximoCursor ?? null,
        };
    }
}
exports.ListarVariantesUseCase = ListarVariantesUseCase;
