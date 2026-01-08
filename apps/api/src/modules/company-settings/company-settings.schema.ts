import { z } from "zod";

const hexColorRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

// Schema expandido para suportar todas as funcionalidades avançadas
const themeSchema = z
  .object({
    primaryColor: z.string().regex(hexColorRegex).optional(),
    secondaryColor: z.string().regex(hexColorRegex).optional(),
    accentColor: z.string().regex(hexColorRegex).optional(),
    successColor: z.string().regex(hexColorRegex).optional(),
    warningColor: z.string().regex(hexColorRegex).optional(),
    errorColor: z.string().regex(hexColorRegex).optional(),
    infoColor: z.string().regex(hexColorRegex).optional(),
    backgroundColor: z.string().regex(hexColorRegex).optional(),
    surfaceColor: z.string().regex(hexColorRegex).optional(),
    cardColor: z.string().regex(hexColorRegex).optional(),
    textPrimaryColor: z.string().regex(hexColorRegex).optional(),
    textSecondaryColor: z.string().regex(hexColorRegex).optional(),
    gradient: z
      .object({
        from: z.string().regex(hexColorRegex),
        to: z.string().regex(hexColorRegex),
        direction: z
          .enum(["to-r", "to-l", "to-b", "to-t", "to-br", "to-bl", "to-tr", "to-tl"])
          .optional(),
      })
      .optional(),
    fontFamily: z.string().optional(),
    headingFont: z.string().optional(),
    bodyFont: z.string().optional(),
    borderRadius: z.enum(["none", "sm", "md", "lg", "xl", "2xl", "full"]).optional(),
    shadowIntensity: z.enum(["none", "sm", "md", "lg", "xl"]).optional(),
    glassMorphism: z.boolean().optional(),
    blurIntensity: z.number().min(0).max(100).optional(),
    darkMode: z.boolean().optional(),
    autoDarkMode: z.boolean().optional(),
    animationsEnabled: z.boolean().optional(),
    animationSpeed: z.enum(["slow", "normal", "fast"]).optional(),
    layoutStyle: z.enum(["modern", "classic", "minimal", "corporate"]).optional(),
    sidebarStyle: z.enum(["default", "compact", "floating"]).optional(),
    logos: z
      .object({
        main: z.string().url().nullable().optional(),
        light: z.string().url().nullable().optional(),
        dark: z.string().url().nullable().optional(),
        favicon: z.string().url().nullable().optional(),
        icon: z.string().url().nullable().optional(),
        watermark: z.string().url().nullable().optional(),
        banner: z.string().url().nullable().optional(),
        thumbnail: z.string().url().nullable().optional(),
      })
      .optional(),
    videoUrl: z.string().url().nullable().optional(),
  })
  .optional();

const socialMediaSchema = z
  .object({
    linkedin: z.string().url().optional().or(z.literal("")),
    instagram: z.string().url().optional().or(z.literal("")),
    facebook: z.string().url().optional().or(z.literal("")),
    twitter: z.string().url().optional().or(z.literal("")),
    youtube: z.string().url().optional().or(z.literal("")),
    tiktok: z.string().url().optional().or(z.literal("")),
  })
  .optional();

const digitalCertificateSchema = z
  .object({
    type: z.enum(["A1", "A3"]).optional(),
    serialNumber: z.string().optional(),
    issuer: z.string().optional(),
    validFrom: z.string().datetime().optional(),
    validUntil: z.string().datetime().optional(),
    subject: z.string().optional(),
    fileUrl: z.string().url().optional(),
    fileStorageKey: z.string().optional(),
    fileName: z.string().optional(),
    fileSize: z.number().optional(),
    isActive: z.boolean().optional(),
    validationStatus: z.enum(["VALID", "EXPIRED", "INVALID", "PENDING"]).optional(),
  })
  .optional();

export const companySettingsSchema = z.object({
  // Compatibilidade com schema antigo
  logoUrl: z
    .string()
    .url()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value.trim() : undefined)),
  primaryColor: z
    .string()
    .regex(hexColorRegex)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value.trim() : undefined)),
  secondaryColor: z
    .string()
    .regex(hexColorRegex)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value.trim() : undefined)),
  themeMode: z.enum(["light", "dark", "auto"]).optional(),
  videoLink: z
    .string()
    .url()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value.trim() : undefined)),

  // Novos campos avançados
  theme: themeSchema,
  socialMedia: socialMediaSchema,
  digitalCertificate: digitalCertificateSchema,
  documents: z
    .array(
      z.object({
        type: z.string(),
        name: z.string(),
        fileUrl: z.string().url(),
        fileName: z.string(),
        fileSize: z.number(),
        mimeType: z.string(),
        uploadedAt: z.string().datetime(),
        expiresAt: z.string().datetime().optional(),
        isActive: z.boolean().optional(),
        description: z.string().optional(),
      }),
    )
    .optional(),
  advancedSettings: z
    .object({
      emailNotifications: z.boolean().optional(),
      pushNotifications: z.boolean().optional(),
      smsNotifications: z.boolean().optional(),
      twoFactorAuth: z.boolean().optional(),
      sessionTimeout: z.number().optional(),
      integrations: z
        .object({
          nfeEnabled: z.boolean().optional(),
          nfceEnabled: z.boolean().optional(),
          cteEnabled: z.boolean().optional(),
          mdfeEnabled: z.boolean().optional(),
          apiEnabled: z.boolean().optional(),
          webhookUrl: z.string().url().optional().or(z.literal("")),
        })
        .optional(),
      autoBackup: z.boolean().optional(),
      backupFrequency: z.enum(["daily", "weekly", "monthly"]).optional(),
      versioningEnabled: z.boolean().optional(),
      retentionDays: z.number().optional(),
    })
    .optional(),
});

export type CompanySettings = z.infer<typeof companySettingsSchema>;

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  primaryColor: "#2855FF",
  secondaryColor: "#9C27B0",
  themeMode: "auto",
};
