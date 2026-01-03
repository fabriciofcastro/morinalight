"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListarCategoriasUseCase = void 0;
const zod_1 = require("zod");
const product_1 = require("../schemas/product");
const listarCategoriasInputSchema = zod_1.z.object({
    orgId: zod_1.z.string().min(1),
    parentId: zod_1.z.string().uuid().nullable().optional(),
    ativo: zod_1.z.boolean().optional(),
    cursor: zod_1.z.string().optional(),
    limite: zod_1.z.number().int().min(1).max(50).optional(),
});
class ListarCategoriasUseCase {
    deps;
    constructor(deps) {
        this.deps = deps;
    }
    async execute(rawInput) {
        const input = listarCategoriasInputSchema.parse(rawInput);
        const pagina = await this.deps.categoriaRepository.listarPorOrg(input.orgId, {
            parentId: input.parentId ?? undefined,
            ativo: input.ativo,
            cursor: input.cursor,
            limite: input.limite,
        });
        const itens = pagina.itens.map((categoria) => product_1.categoriaViewSchema.parse({
            categoriaId: categoria.categoriaId,
            orgId: categoria.dados.orgId,
            name: categoria.dados.name,
            slug: categoria.dados.slug,
            description: categoria.dados.description ?? null,
            parentId: categoria.dados.parentId ?? null,
            ordem: categoria.dados.ordem,
            ativo: categoria.dados.ativo,
            createdAt: categoria.dados.createdAt,
            updatedAt: categoria.dados.updatedAt,
        }));
        return {
            itens,
            proximoCursor: pagina.proximoCursor ?? null,
        };
    }
}
exports.ListarCategoriasUseCase = ListarCategoriasUseCase;
