export type SupplierRecord = {
  id: string;
  orgId: string;
  name: string;
  email: string | null;
  phone: string | null;
  document: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  status: string;
  notes: string | null;
  website: string | null;
  contatoPrincipal: string | null;
  cargoContato: string | null;
  ramoAtividade: string | null;
  tipoFornecedor: string | null;
  prazoPagamento: number | null;
  condicaoPagamento: string | null;
  limiteCredito: number | null;
  avaliacao: number | null;
  dataUltimaCompra: Date | null;
  totalCompras: number | null;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  deletedBy: string | null;
};

export type CreateSupplierInput = {
  orgId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  document?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  status?: string;
  notes?: string | null;
  website?: string | null;
  contatoPrincipal?: string | null;
  cargoContato?: string | null;
  ramoAtividade?: string | null;
  tipoFornecedor?: string | null;
  prazoPagamento?: number | null;
  condicaoPagamento?: string | null;
  limiteCredito?: number | null;
  createdBy: string;
  updatedBy: string;
};

export type UpdateSupplierInput = Partial<Omit<CreateSupplierInput, "orgId" | "createdBy">> & {
  updatedBy: string;
};

export type SupplierListResult = {
  itens: SupplierRecord[];
  total: number;
  pagina: number;
  tamanhoPagina: number;
  totalPaginas: number;
};

export interface SupplierRepository {
  findById(id: string, includeDeleted?: boolean): Promise<SupplierRecord | null>;
  findByOrgId(
    orgId: string,
    filters?: {
      status?: string;
      busca?: string;
      documento?: string;
      cidade?: string;
      estado?: string;
      email?: string;
      telefone?: string;
      pagina?: number;
      tamanhoPagina?: number;
      ordenarPor?: "name" | "createdAt" | "updatedAt" | "status";
      ordem?: "asc" | "desc";
      includeDeleted?: boolean;
      onlyDeleted?: boolean;
    },
  ): Promise<SupplierListResult>;
  create(input: CreateSupplierInput): Promise<SupplierRecord>;
  update(id: string, input: UpdateSupplierInput): Promise<SupplierRecord>;
  delete(id: string, deletedBy: string): Promise<void>;
  restore(id: string): Promise<SupplierRecord>;
  hardDelete(id: string): Promise<void>;
}
