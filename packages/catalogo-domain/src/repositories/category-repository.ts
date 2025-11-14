import type { Category } from "../entities/category";

export interface CategoryRepository {
  criar(categoria: Category): Promise<void>;
  atualizar(categoria: Category): Promise<void>;
  encontrarPorId(categoriaId: string, orgId: string): Promise<Category | null>;
  encontrarPorSlug(slug: string, orgId: string): Promise<Category | null>;
  listarPorOrg(
    orgId: string,
    options?: {
      parentId?: string | null;
      ativo?: boolean;
      cursor?: string;
      limite?: number;
    },
  ): Promise<{ itens: Category[]; proximoCursor?: string | null }>;
  listarPorParent(
    orgId: string,
    parentId: string | null,
  ): Promise<Category[]>;
  contarPorOrg(orgId: string, ativo?: boolean): Promise<number>;
  remover(categoriaId: string, orgId: string): Promise<void>;
}


