import { apiClient } from "./base";

export interface Organization {
  organizationId: string;
  name: string; // Nome Fantasia
  slug: string;
  description?: string | null;
  legalName?: string | null; // Razão Social
  cnpj?: string | null;
  stateRegistration?: string | null; // Inscrição Estadual
  municipalRegistration?: string | null; // Inscrição Municipal

  // Endereço
  address?: {
    zipCode: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    country: string;
  } | null;

  // Contato
  phone?: string | null;
  secondaryPhone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  financialEmail?: string | null;
  website?: string | null;

  // Informações Complementares
  foundedAt?: string | null; // Data de fundação
  companySize?: "MEI" | "ME" | "EPP" | "MEDIO" | "GRANDE" | null;
  employeeCount?: number | null;
  annualRevenue?: number | null;

  // Configurações Fiscais
  taxRegime?: "SIMPLES" | "PRESUMIDO" | "REAL" | "MEI" | null;
  icmsRate?: number | null;
  issRate?: number | null;
  pisRate?: number | null;
  cofinsRate?: number | null;
  isTaxSubstitute?: boolean;

  // Certificado Digital
  hasDigitalCertificate?: boolean;
  certificateType?: "A1" | "A3" | null;
  certificateExpiresAt?: string | null;

  // Notas Fiscais
  issuesNFe?: boolean;
  issuesNFSe?: boolean;
  nfeSeriesDefault?: string | null;
  nfeNextNumber?: number | null;
  nfeEnvironment?: "HOMOLOGACAO" | "PRODUCAO" | null;

  // Branding
  logoUrl?: string | null;
  faviconUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  accentColor?: string | null;

  // Configurações
  currency?: string | null; // ISO currency code
  timezone?: string | null;
  locale?: string | null;

  // Segmentos de Negócio
  activeSegments?: string[]; // ["INFANTIL", "ADULTO", "UNIFORME", "EPI"]

  // Status
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export class OrganizationsApi {
  async getOrganization(organizationId: string): Promise<Organization> {
    const response = await apiClient.get<{ organization: Organization }>(
      `/organizations/${organizationId}`,
    );
    return response.organization;
  }

  async updateOrganization(
    organizationId: string,
    data: Partial<Organization>,
  ): Promise<Organization> {
    const response = await apiClient.put<{ organization: Organization }>(
      `/organizations/${organizationId}`,
      data,
    );
    return response.organization;
  }
}

export const organizationsApi = new OrganizationsApi();
