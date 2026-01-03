import type { CompanySettings } from "../company-settings.schema";
import type { CompanySettingsRepository } from "./company-settings.repository";

export class CachedCompanySettingsRepository implements CompanySettingsRepository {
  constructor(
    private readonly primary: CompanySettingsRepository,
    private readonly cache: CompanySettingsRepository,
  ) {}

  async find(orgId: string): Promise<CompanySettings | null> {
    const cached = await this.cache.find(orgId);
    if (cached) {
      return cached;
    }

    const value = await this.primary.find(orgId);
    if (value) {
      await this.cache.save(orgId, value);
    }

    return value;
  }

  async save(orgId: string, settings: CompanySettings): Promise<void> {
    await this.primary.save(orgId, settings);
    await this.cache.save(orgId, settings);
  }
}
