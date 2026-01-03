import type { CompanySettingsPayload } from "@/schemas/company-settings";
import { companySettingsSchema, DEFAULT_COMPANY_SETTINGS } from "@/schemas/company-settings";

export type NormalizedCompanySettings = CompanySettingsPayload;

export function normalizeCompanySettings(
  input?: Partial<CompanySettingsPayload> | null,
): NormalizedCompanySettings {
  const parsed = companySettingsSchema.partial().parse(input ?? {});

  return {
    ...DEFAULT_COMPANY_SETTINGS,
    ...parsed,
  };
}

export function sanitizeForPersistence(
  payload: CompanySettingsPayload,
): Record<string, string | null | undefined> {
  return {
    logoUrl: payload.logoUrl ?? null,
    primaryColor: payload.primaryColor ?? null,
    secondaryColor: payload.secondaryColor ?? null,
    themeMode: payload.themeMode ?? null,
    videoLink: payload.videoLink ?? null,
  };
}
