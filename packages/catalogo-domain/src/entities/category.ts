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

export class Category {
  constructor(
    private readonly props: CategoryProps,
    private readonly id: CategoryId = CategoryId.from(),
  ) {
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

  static criar(
    input: Omit<CategoryProps, "createdAt" | "updatedAt" | "ordem" | "ativo"> & {
      ordem?: number;
      ativo?: boolean;
    },
  ) {
    const agora = new Date();
    return new Category(
      {
        ...input,
        ordem: input.ordem ?? 0,
        ativo: input.ativo ?? true,
        createdAt: agora,
        updatedAt: agora,
      },
      CategoryId.from(),
    );
  }

  static restaurar(props: CategoryProps, id: string) {
    return new Category({ ...props }, CategoryId.from(id));
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

  atualizarNome(nome: string) {
    if (!nome || nome.trim().length === 0) {
      throw new Error("Nome da categoria não pode ser vazio");
    }
    this.props.name = nome;
    this.props.updatedAt = new Date();
  }

  atualizarDescricao(descricao: string | null) {
    this.props.description = descricao;
    this.props.updatedAt = new Date();
  }

  atualizarOrdem(ordem: number) {
    if (ordem < 0) {
      throw new Error("Ordem não pode ser negativa");
    }
    this.props.ordem = ordem;
    this.props.updatedAt = new Date();
  }

  moverParaCategoriaPai(parentId: string | null) {
    this.props.parentId = parentId;
    this.props.updatedAt = new Date();
  }
}
