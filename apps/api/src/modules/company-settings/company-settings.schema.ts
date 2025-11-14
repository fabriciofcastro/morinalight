import { z } from "zod";

const hexColorRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const companySettingsSchema = z.object({
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
});

export type CompanySettings = z.infer<typeof companySettingsSchema>;

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  primaryColor: "#2855FF",
  secondaryColor: "#9C27B0",
  themeMode: "auto",
};
