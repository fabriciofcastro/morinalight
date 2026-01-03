"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtualizarCategoriaUseCase = void 0;
const product_1 = require("../schemas/product");
class AtualizarCategoriaUseCase {
    deps;
    constructor(deps) {
        this.deps = deps;
    }
    async execute(rawInput) {
        const input = product_1.atualizarCategoriaInputSchema.parse(rawInput);
        const categoria = await this.deps.categoriaRepository.encontrarPorId(input.categoriaId, input.orgId);
        if (!categoria) {
            throw new Error("Categoria não encontrada");
        }
        if (input.name !== undefined) {
            categoria.atualizarNome(input.name);
        }
        if (input.description !== undefined) {
            categoria.atualizarDescricao(input.description);
        }
        if (input.ordem !== undefined) {
            categoria.atualizarOrdem(input.ordem);
        }
        if (input.parentId !== undefined) {
            if (input.parentId) {
                const parent = await this.deps.categoriaRepository.encontrarPorId(input.parentId, input.orgId);
                if (!parent) {
                    throw new Error("Categoria pai não encontrada");
                }
                // Verificar se não está criando um ciclo
                if (input.parentId === input.categoriaId) {
                    throw new Error("Categoria não pode ser pai de si mesma");
                }
            }
            categoria.moverParaCategoriaPai(input.parentId);
        }
        if (input.ativo !== undefined) {
            if (input.ativo) {
                categoria.ativar();
            }
            else {
                categoria.desativar();
            }
        }
        await this.deps.categoriaRepository.atualizar(categoria);
        return product_1.categoriaViewSchema.parse({
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
        });
    }
}
exports.AtualizarCategoriaUseCase = AtualizarCategoriaUseCase;
