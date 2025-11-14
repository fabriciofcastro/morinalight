import { CategoryId } from "../value-objects/category-id";
export type CategoryProps = {
    orgId: string;
    name: string;
    slug: string;
    description?: string | null;
    parentId?: string | null;
    ordem: number;
    ativo: boolean;
    createdAt: Date;
    updatedAt: Date;
};
export declare class Category {
    private readonly props;
    private readonly id;
    constructor(props: CategoryProps, id?: CategoryId);
    static criar(input: Omit<CategoryProps, "criadoEm" | "atualizadoEm" | "ordem" | "ativo"> & {
        ordem?: number;
        ativo?: boolean;
    }): Category;
    static restaurar(props: CategoryProps, id: string): Category;
    get categoriaId(): string;
    get dados(): CategoryProps;
    desativar(): void;
    ativar(): void;
    atualizarNome(nome: string): void;
    atualizarDescricao(descricao: string | null): void;
    atualizarOrdem(ordem: number): void;
    moverParaCategoriaPai(parentId: string | null): void;
}
