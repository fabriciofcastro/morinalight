export type VersaoSupplierRecord = {
  id: string;
  supplierId: string;
  versao: number;
  dadosSnapshot: unknown;
  criadoPor: string;
  motivoAlteracao?: string | null;
  createdAt: Date;
};

export type CreateVersaoSupplierInput = {
  supplierId: string;
  versao: number;
  dadosSnapshot: unknown;
  criadoPor: string;
  motivoAlteracao?: string | null;
};

export interface VersaoSupplierRepository {
  create(input: CreateVersaoSupplierInput): Promise<VersaoSupplierRecord>;
  findBySupplierId(supplierId: string): Promise<VersaoSupplierRecord[]>;
  findByVersion(supplierId: string, versao: number): Promise<VersaoSupplierRecord | null>;
  getLatestVersion(supplierId: string): Promise<VersaoSupplierRecord | null>;
  getNextVersionNumber(supplierId: string): Promise<number>;
}
