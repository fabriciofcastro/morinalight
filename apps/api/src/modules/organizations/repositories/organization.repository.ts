export type OrganizationView = {
  organizationId: string;
  name: string;
  slug: string;
  role?: string;
};

export type OrganizationRecord = {
  organizationId: string;
  name: string;
  slug: string;
  description?: string | null;
  legalName?: string | null;
  cnpj?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
};

export type OrganizationMembershipRecord = {
  organizationId: string;
  userId: string;
  role: string;
  createdAt?: Date;
};

export type OrganizationMemberView = {
  organizationId: string;
  userId: string;
  role: string;
  createdAt: Date;
};

export interface OrganizationRepository {
  listarPorUsuario(userId: string): Promise<OrganizationView[]>;
  criar?(input: {
    organizationId: string;
    name: string;
    slug: string;
    description?: string | null;
  }): Promise<OrganizationRecord>;
  atualizar?(input: {
    organizationId: string;
    name?: string;
    slug?: string;
    description?: string | null;
    legalName?: string | null;
    cnpj?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
  }): Promise<OrganizationRecord | null>;
  deletar?(organizationId: string): Promise<void>;
  encontrarPorId?(organizationId: string): Promise<OrganizationRecord | null>;
  encontrarPorSlug?(slug: string): Promise<OrganizationRecord | null>;
  vincularUsuario?(organizationId: string, userId: string, role: string): Promise<void>;
  encontrarMembership?(
    organizationId: string,
    userId: string,
  ): Promise<OrganizationMembershipRecord | null>;
  listarMembros?(organizationId: string): Promise<OrganizationMemberView[]>;
  atualizarPapel?(
    organizationId: string,
    userId: string,
    role: string,
  ): Promise<OrganizationMembershipRecord | null>;
  removerMembro?(organizationId: string, userId: string): Promise<void>;
}
