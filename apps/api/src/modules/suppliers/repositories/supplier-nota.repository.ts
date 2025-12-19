export type NotaSupplierRecord = {
  id: string;
  supplierId: string;
  orgId: string;
  titulo?: string | null;
  conteudo: string;
  tipo: string; // nota, lembrete, observacao
  criadoPor: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateNotaSupplierInput = {
  supplierId: string;
  orgId: string;
  titulo?: string | null;
  conteudo: string;
  tipo?: string; // nota, lembrete, observacao
  criadoPor: string;
};

export type UpdateNotaSupplierInput = Partial<
  Omit<CreateNotaSupplierInput, "supplierId" | "criadoPor">
>;

export interface NotaSupplierRepository {
  create(input: CreateNotaSupplierInput): Promise<NotaSupplierRecord>;
  findById(id: string): Promise<NotaSupplierRecord | null>;
  findBySupplierId(
    supplierId: string,
    filters?: { tipo?: string; criadoPor?: string; busca?: string }
  ): Promise<NotaSupplierRecord[]>;
  update(id: string, input: UpdateNotaSupplierInput): Promise<NotaSupplierRecord>;
  delete(id: string): Promise<void>;
}

