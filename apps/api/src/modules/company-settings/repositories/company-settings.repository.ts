import type { CompanySettings } from "../company-settings.schema";

export interface CompanySettingsRepository {
  find(orgId: string): Promise<CompanySettings | null>;
  save(orgId: string, settings: CompanySettings): Promise<void>;
}
