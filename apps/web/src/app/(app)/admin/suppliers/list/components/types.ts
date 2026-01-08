import type { Supplier } from "@/lib/api/suppliers";

export type FornecedorFichaCusto = {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    document: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
    status: "ativo";
    notes: string | null;
    createdBy: "sistema";
    updatedBy: "sistema";
    createdAt: string;
    updatedAt: string;
    origem: "ficha-custo";
};

export type FornecedorItem = Supplier | FornecedorFichaCusto;
