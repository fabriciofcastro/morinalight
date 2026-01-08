import type { PrismaClient } from "@prisma/client";

interface AuditLogInput {
  orgId: string;
  action: string;
  entity: string;
  fieldName?: string;
  fieldLabel?: string;
  oldValue?: any;
  newValue?: any;
  actorId: string;
  actorName?: string;
  ipAddress?: string;
  userAgent?: string;
  justification?: string;
  metadata?: Record<string, any>;
}

/**
 * Helper para registrar alterações em Company Settings
 */
export async function logCompanySettingsChange(
  prisma: PrismaClient,
  input: AuditLogInput,
): Promise<void> {
  try {
    await prisma.companySettingsAuditLog.create({
      data: {
        orgId: input.orgId,
        action: input.action,
        entity: input.entity,
        fieldName: input.fieldName || null,
        fieldLabel: input.fieldLabel || null,
        oldValue: input.oldValue !== undefined ? input.oldValue : null,
        newValue: input.newValue !== undefined ? input.newValue : null,
        actorId: input.actorId,
        actorName: input.actorName || null,
        ipAddress: input.ipAddress || null,
        userAgent: input.userAgent || null,
        justification: input.justification || null,
        metadata: input.metadata || null,
      },
    });
  } catch (error) {
    console.error("[AuditLogger] Falha ao registrar log:", error);
    // Não devemos falhar a operação principal se o log falhar
  }
}

/**
 * Compara dois objetos e retorna as diferenças
 */
export function getChangedFields(
  oldData: Record<string, any>,
  newData: Record<string, any>,
): Array<{ fieldName: string; oldValue: any; newValue: any }> {
  const changes: Array<{ fieldName: string; oldValue: any; newValue: any }> = [];

  for (const key of Object.keys(newData)) {
    if (oldData[key] !== newData[key]) {
      changes.push({
        fieldName: key,
        oldValue: oldData[key],
        newValue: newData[key],
      });
    }
  }

  return changes;
}

/**
 * Mapeamento de nomes técnicos para labels amigáveis
 */
export const FIELD_LABELS: Record<string, string> = {
  nomeFantasia: "Nome Fantasia",
  razaoSocial: "Razão Social",
  cnpj: "CNPJ",
  inscricaoEstadual: "Inscrição Estadual",
  inscricaoMunicipal: "Inscrição Municipal",
  regimeTributario: "Regime Tributário",
  email: "E-mail",
  telefone: "Telefone",
  site: "Site",
  cep: "CEP",
  logradouro: "Logradouro",
  numero: "Número",
  complemento: "Complemento",
  bairro: "Bairro",
  cidade: "Cidade",
  estado: "Estado",
  pais: "País",
  codigoIBGE: "Código IBGE",
  logoUrl: "Logo",
  primaryColor: "Cor Primária",
  secondaryColor: "Cor Secundária",
  themeMode: "Modo do Tema",
  timezone: "Fuso Horário",
  locale: "Idioma",
  currency: "Moeda",
  dateFormat: "Formato de Data",
  timeFormat: "Formato de Hora",
  ambienteNFe: "Ambiente NFe",
  certificadoDigital: "Certificado Digital",
  senhaCertificado: "Senha do Certificado",
};
