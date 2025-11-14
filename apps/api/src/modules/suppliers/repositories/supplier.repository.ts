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
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
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
  createdBy: string;
  updatedBy: string;
};

export type UpdateSupplierInput = Partial<Omit<CreateSupplierInput, "orgId" | "createdBy">> & {
  updatedBy: string;
};

export interface SupplierRepository {
  findById(id: string): Promise<SupplierRecord | null>;
  findByOrgId(
    orgId: string,
    filters?: { status?: string; busca?: string },
  ): Promise<SupplierRecord[]>;
  create(input: CreateSupplierInput): Promise<SupplierRecord>;
  update(id: string, input: UpdateSupplierInput): Promise<SupplierRecord>;
  delete(id: string): Promise<void>;
}
