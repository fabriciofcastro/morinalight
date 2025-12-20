export type SupplierContactRecord = {
  id: string;
  supplierId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  cargo?: string | null;
  isPrincipal: boolean;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateSupplierContactInput = {
  supplierId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  cargo?: string | null;
  isPrincipal?: boolean;
  notes?: string | null;
};

export type UpdateSupplierContactInput = Partial<
  Omit<CreateSupplierContactInput, "supplierId">
>;

export interface SupplierContactRepository {
  create(input: CreateSupplierContactInput): Promise<SupplierContactRecord>;
  findById(id: string): Promise<SupplierContactRecord | null>;
  findBySupplierId(supplierId: string): Promise<SupplierContactRecord[]>;
  update(id: string, input: UpdateSupplierContactInput): Promise<SupplierContactRecord>;
  delete(id: string): Promise<void>;
  setPrincipal(supplierId: string, contactId: string): Promise<void>;
  getPrincipal(supplierId: string): Promise<SupplierContactRecord | null>;
}


