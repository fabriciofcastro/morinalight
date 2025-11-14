import type { CompanySettings } from "../company-settings.schema";
import type { CompanySettingsRepository } from "./company-settings.repository";

export class InMemoryCompanySettingsRepository implements CompanySettingsRepository {
  private readonly store = new Map<string, CompanySettings>();

  async find(orgId: string): Promise<CompanySettings | null> {
    return this.store.get(orgId) ?? null;
  }

  async save(orgId: string, settings: CompanySettings) {
    this.store.set(orgId, settings);
  }
}
