"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const category_id_1 = require("../value-objects/category-id");
class Category {
    props;
    id;
    constructor(props, id = category_id_1.CategoryId.from()) {
        this.props = props;
        this.id = id;
        if (!props.orgId) {
            throw new Error("Categoria requer orgId");
        }
        if (!props.name) {
            throw new Error("Categoria requer nome");
        }
        if (!props.slug) {
            throw new Error("Categoria requer slug");
        }
    }
    static criar(input) {
        const agora = new Date();
        return new Category({
            ...input,
            ordem: input.ordem ?? 0,
            ativo: input.ativo ?? true,
            createdAt: agora,
            updatedAt: agora,
        }, category_id_1.CategoryId.from());
    }
    static restaurar(props, id) {
        return new Category({ ...props }, category_id_1.CategoryId.from(id));
    }
    get categoriaId() {
        return this.id.toString();
    }
    get dados() {
        return this.props;
    }
    desativar() {
        this.props.ativo = false;
        this.props.updatedAt = new Date();
    }
    ativar() {
        this.props.ativo = true;
        this.props.updatedAt = new Date();
    }
    atualizarNome(nome) {
        if (!nome || nome.trim().length === 0) {
            throw new Error("Nome da categoria não pode ser vazio");
        }
        this.props.name = nome;
        this.props.updatedAt = new Date();
    }
    atualizarDescricao(descricao) {
        this.props.description = descricao;
        this.props.updatedAt = new Date();
    }
    atualizarOrdem(ordem) {
        if (ordem < 0) {
            throw new Error("Ordem não pode ser negativa");
        }
        this.props.ordem = ordem;
        this.props.updatedAt = new Date();
    }
    moverParaCategoriaPai(parentId) {
        this.props.parentId = parentId;
        this.props.updatedAt = new Date();
    }
}
exports.Category = Category;
