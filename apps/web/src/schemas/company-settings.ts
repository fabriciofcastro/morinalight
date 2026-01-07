import { z } from "zod";

const hexColorRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const companySettingsSchema = z.object({
  logoUrl: z
    .string()
    .url("Informe uma URL válida.")
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value.trim() : undefined)),
  primaryColor: z
    .string()
    .regex(hexColorRegex, "Informe uma cor em formato hexadecimal (#RRGGBB).")
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value.trim() : undefined)),
  secondaryColor: z
    .string()
    .regex(hexColorRegex, "Informe uma cor em formato hexadecimal (#RRGGBB).")
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value.trim() : undefined)),
  themeMode: z.enum(["light", "dark", "auto"]).optional(),
  videoLink: z
    .string()
    .url("Informe uma URL válida.")
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value.trim() : undefined)),
});

export type CompanySettingsPayload = z.infer<typeof companySettingsSchema>;

export const DEFAULT_COMPANY_SETTINGS: CompanySettingsPayload = {
  logoUrl: undefined,
  primaryColor: "#2855FF",
  secondaryColor: "#9C27B0",
  themeMode: "auto",
  videoLink: undefined,
};
