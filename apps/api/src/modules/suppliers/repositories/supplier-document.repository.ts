export type DocumentoSupplierRecord = {
  id: string;
  supplierId: string;
  tipo: string;
  nomeArquivo: string;
  arquivoUrl: string;
  arquivoStorageKey: string;
  tamanhoBytes: bigint;
  mimeType: string;
  descricao?: string | null;
  anexadoPor: string;
  createdAt: Date;
};

export type CreateDocumentoSupplierInput = {
  supplierId: string;
  tipo: string;
  nomeArquivo: string;
  arquivoUrl: string;
  arquivoStorageKey: string;
  tamanhoBytes: bigint;
  mimeType: string;
  descricao?: string | null;
  anexadoPor: string;
};

export type UpdateDocumentoSupplierInput = Partial<
  Omit<CreateDocumentoSupplierInput, "supplierId" | "arquivoUrl" | "arquivoStorageKey" | "tamanhoBytes" | "mimeType">
>;

export interface DocumentoSupplierRepository {
  create(input: CreateDocumentoSupplierInput): Promise<DocumentoSupplierRecord>;
  findById(id: string): Promise<DocumentoSupplierRecord | null>;
  findBySupplierId(supplierId: string): Promise<DocumentoSupplierRecord[]>;
  findByType(supplierId: string, tipo: string): Promise<DocumentoSupplierRecord[]>;
  update(id: string, input: UpdateDocumentoSupplierInput): Promise<DocumentoSupplierRecord>;
  delete(id: string): Promise<void>;
}





