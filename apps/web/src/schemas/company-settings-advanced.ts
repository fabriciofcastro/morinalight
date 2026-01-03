import { z } from "zod";

/**
 * Schema completo e robusto para configurações de empresa
 * Validação avançada com Zod
 */

// Validação de CNPJ
const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
const cnpjSchema = z
  .string()
  .min(14, "CNPJ deve ter 14 dígitos")
  .regex(cnpjRegex, "CNPJ inválido. Use o formato: XX.XXX.XXX/XXXX-XX");

// Validação de CEP
const cepRegex = /^\d{5}-?\d{3}$/;
const cepSchema = z
  .string()
  .min(8, "CEP deve ter 8 dígitos")
  .regex(cepRegex, "CEP inválido. Use o formato: XXXXX-XXX");

// Validação de telefone
const phoneRegex = /^\(\d{2}\)\s?\d{4,5}-?\d{4}$/;
const phoneSchema = z
  .string()
  .optional()
  .refine((val) => !val || phoneRegex.test(val), {
    message: "Telefone inválido. Use o formato: (XX) XXXXX-XXXX",
  });

// Validação de URL
const urlSchema = z
  .string()
  .url("URL inválida")
  .optional()
  .or(z.literal(""));

// Validação de email
const emailSchema = z
  .string()
  .email("Email inválido")
  .optional()
  .or(z.literal(""));

// Schema de endereço
const addressSchema = z.object({
  street: z.string().min(3, "Logradouro é obrigatório"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, "Bairro é obrigatório"),
  city: z.string().min(2, "Cidade é obrigatória"),
  state: z
    .string()
    .length(2, "Estado deve ter 2 caracteres")
    .regex(/^[A-Z]{2}$/, "Estado inválido. Use sigla (ex: SP)"),
  zipCode: cepSchema,
  country: z.string().default("Brasil"),
});

// Schema de certificado digital
const digitalCertificateSchema = z.object({
  type: z.enum(["A1", "A3"], { required_error: "Tipo de certificado é obrigatório" }),
  serialNumber: z.string().optional(),
  issuer: z.string().optional(),
  validFrom: z.string().date().optional(),
  validUntil: z.string().date().optional(),
  subject: z.string().optional(),
  password: z.string().min(1, "Senha do certificado é obrigatória").optional(),
  fileUrl: z.string().url().optional(),
  fileStorageKey: z.string().optional(),
  fileName: z.string().optional(),
  fileSize: z.number().optional(),
  uploadedAt: z.string().datetime().optional(),
  uploadedBy: z.string().optional(),
  isActive: z.boolean().default(false),
  lastValidatedAt: z.string().datetime().optional(),
  validationStatus: z.enum(["VALID", "EXPIRED", "INVALID", "PENDING"]).default("PENDING"),
});

// Schema de documentos da empresa
const companyDocumentSchema = z.object({
  type: z.enum([
    "CONTRATO_SOCIAL",
    "ATA_ASSEMBLEIA",
    "CERTIDAO_FEDERAL",
    "CERTIDAO_ESTADUAL",
    "CERTIDAO_MUNICIPAL",
    "ALVARA_FUNCIONAMENTO",
    "INSCRICAO_ESTADUAL",
    "INSCRICAO_MUNICIPAL",
    "CERTIFICADO_DIGITAL",
    "OUTROS",
  ]),
  name: z.string().min(1, "Nome do documento é obrigatório"),
  fileUrl: z.string().url(),
  fileStorageKey: z.string(),
  fileName: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  uploadedAt: z.string().datetime(),
  uploadedBy: z.string(),
  expiresAt: z.string().date().optional(),
  isActive: z.boolean().default(true),
  description: z.string().optional(),
});

// Schema de logos múltiplos
const logosSchema = z.object({
  main: z.string().url().nullable().optional(), // Logo principal
  light: z.string().url().nullable().optional(), // Logo para tema claro
  dark: z.string().url().nullable().optional(), // Logo para tema escuro
  favicon: z.string().url().nullable().optional(), // Favicon
  icon: z.string().url().nullable().optional(), // Ícone da aplicação
  watermark: z.string().url().nullable().optional(), // Marca d'água
  banner: z.string().url().nullable().optional(), // Banner
  thumbnail: z.string().url().nullable().optional(), // Miniatura
});

// Schema de vídeos e mídia
const mediaSchema = z.object({
  videoInstitucional: z.string().url().nullable().optional(),
  videoApresentacao: z.string().url().nullable().optional(),
  videoTutorial: z.string().url().nullable().optional(),
  backgroundVideo: z.string().url().nullable().optional(),
  backgroundImage: z.string().url().nullable().optional(),
  gallery: z.array(z.string().url()).default([]),
});

// Schema de tema personalizado avançado
const themeSchema = z.object({
  // Cores principais
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor deve estar no formato hexadecimal"),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor deve estar no formato hexadecimal").optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  successColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  warningColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  errorColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  infoColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  
  // Cores de fundo
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  surfaceColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  cardColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  
  // Cores de texto
  textPrimaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  textSecondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  
  // Gradientes
  primaryGradient: z.object({
    from: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    to: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    direction: z.enum(["to-r", "to-l", "to-b", "to-t", "to-br", "to-bl", "to-tr", "to-tl"]).default("to-r"),
  }).optional(),
  
  // Tipografia
  fontFamily: z.string().optional(),
  headingFont: z.string().optional(),
  bodyFont: z.string().optional(),
  
  // Efeitos
  borderRadius: z.enum(["none", "sm", "md", "lg", "xl", "2xl", "full"]).default("lg"),
  shadowIntensity: z.enum(["none", "sm", "md", "lg", "xl"]).default("md"),
  glassMorphism: z.boolean().default(true),
  blurIntensity: z.number().min(0).max(100).default(20),
  
  // Modo escuro/claro
  darkMode: z.boolean().default(false),
  autoDarkMode: z.boolean().default(false),
  
  // Logos e mídia
  logos: logosSchema.optional(),
  media: mediaSchema.optional(),
  
  // Animações
  animationsEnabled: z.boolean().default(true),
  animationSpeed: z.enum(["slow", "normal", "fast"]).default("normal"),
  
  // Layout
  layoutStyle: z.enum(["modern", "classic", "minimal", "corporate"]).default("modern"),
  sidebarStyle: z.enum(["default", "compact", "floating"]).default("default"),
});

// Schema de configurações fiscais
const fiscalSchema = z.object({
  taxRegime: z.enum(["SIMPLES", "PRESUMIDO", "REAL", "MEI"], {
    required_error: "Regime tributário é obrigatório",
  }),
  icmsRate: z.number().min(0).max(100).default(0),
  issRate: z.number().min(0).max(100).default(0),
  pisRate: z.number().min(0).max(100).optional(),
  cofinsRate: z.number().min(0).max(100).optional(),
  nfeEnvironment: z.enum(["PRODUCAO", "HOMOLOGACAO"]).default("HOMOLOGACAO"),
  substituteTax: z.boolean().default(false),
  stateRegistration: z.string().optional(),
  municipalRegistration: z.string().optional(),
});

// Schema principal expandido
export const companySettingsSchema = z.object({
  // Identidade
  id: z.string().optional(),
  name: z.string().min(2, "Nome fantasia deve ter pelo menos 2 caracteres"),
  legalName: z.string().min(2, "Razão social é obrigatória"),
  cnpj: cnpjSchema,
  
  // Dados corporativos
  companySize: z.enum(["MEI", "ME", "EPP", "MEDIO", "GRANDE"], {
    required_error: "Porte da empresa é obrigatório",
  }),
  foundedAt: z.string().date("Data de fundação inválida"),
  cnaePrincipal: z.string().optional(),
  cnaesSecundarios: z.array(z.string()).optional(),
  
  // Endereço
  address: addressSchema,
  
  // Contato
  email: emailSchema,
  financialEmail: emailSchema,
  phone: phoneSchema,
  secondaryPhone: phoneSchema,
  whatsapp: phoneSchema,
  website: urlSchema,
  
  // Redes sociais
  socialMedia: z.object({
    linkedin: urlSchema,
    instagram: urlSchema,
    facebook: urlSchema,
    twitter: urlSchema,
    youtube: urlSchema,
    tiktok: urlSchema,
  }).optional(),
  
  // Fiscal
  fiscal: fiscalSchema,
  
  // Certificado Digital
  digitalCertificate: digitalCertificateSchema.optional(),
  
  // Documentos
  documents: z.array(companyDocumentSchema).default([]),
  
  // Tema avançado
  theme: themeSchema.optional(),
  
  // Metadados
  logoUrl: z.string().url().nullable().optional(), // Mantido para compatibilidade
  description: z.string().max(2000, "Descrição deve ter no máximo 2000 caracteres").optional(),
  active: z.boolean().default(true),
  
  // Configurações avançadas
  advancedSettings: z.object({
    // Notificações
    emailNotifications: z.boolean().default(true),
    pushNotifications: z.boolean().default(true),
    smsNotifications: z.boolean().default(false),
    
    // Segurança
    twoFactorAuth: z.boolean().default(false),
    sessionTimeout: z.number().min(5).max(480).default(30), // minutos
    passwordPolicy: z.object({
      minLength: z.number().min(6).max(32).default(8),
      requireUppercase: z.boolean().default(true),
      requireLowercase: z.boolean().default(true),
      requireNumbers: z.boolean().default(true),
      requireSpecialChars: z.boolean().default(true),
      expirationDays: z.number().min(0).max(365).default(90),
    }).optional(),
    
    // Integrações
    integrations: z.object({
      nfeEnabled: z.boolean().default(false),
      nfceEnabled: z.boolean().default(false),
      cteEnabled: z.boolean().default(false),
      mdfeEnabled: z.boolean().default(false),
      apiEnabled: z.boolean().default(false),
      webhookUrl: urlSchema,
    }).optional(),
    
    // Backup e versionamento
    autoBackup: z.boolean().default(true),
    backupFrequency: z.enum(["daily", "weekly", "monthly"]).default("daily"),
    versioningEnabled: z.boolean().default(true),
    retentionDays: z.number().min(7).max(365).default(90),
  }).optional(),
});

export type CompanySettingsFormData = z.infer<typeof companySettingsSchema>;

// Schema para validação parcial (usado durante edição)
export const companySettingsPartialSchema = companySettingsSchema.partial();

// Validação customizada
export function validateCompanySettings(data: unknown): {
  success: boolean;
  data?: CompanySettingsFormData;
  errors?: z.ZodError;
} {
  const result = companySettingsSchema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return { success: false, errors: result.error };
}


