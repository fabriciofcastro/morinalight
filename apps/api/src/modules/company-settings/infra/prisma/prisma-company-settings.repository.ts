import type { PrismaClient } from "@prisma/client";

import { getPrisma } from "../../../../infra/database/prisma.service";
import type { CompanySettings } from "../../company-settings.schema";
import type { CompanySettingsRepository } from "../../repositories/company-settings.repository";

type PersistencePayload = {
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  themeMode: string | null;
  videoLink: string | null;
};

export class PrismaCompanySettingsRepository implements CompanySettingsRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma ?? getPrisma();
  }

  async find(orgId: string): Promise<CompanySettings | null> {
    const record = await this.prisma.companySettings.findUnique({
      where: { orgId },
      select: {
        logoUrl: true,
        primaryColor: true,
        secondaryColor: true,
        themeMode: true,
        videoLink: true,
      },
    });

    if (!record) {
      return null;
    }

    return this.normalize(record);
  }

  async save(orgId: string, settings: CompanySettings): Promise<void> {
    const payload = this.toPersistence(settings);

    await this.prisma.companySettings.upsert({
      where: { orgId },
      update: payload,
      create: {
        orgId,
        ...payload,
      },
    });
  }

  private normalize(record: PersistencePayload): CompanySettings {
    return {
      logoUrl: record.logoUrl ?? undefined,
      primaryColor: record.primaryColor ?? undefined,
      secondaryColor: record.secondaryColor ?? undefined,
      themeMode: record.themeMode ? (record.themeMode as CompanySettings["themeMode"]) : undefined,
      videoLink: record.videoLink ?? undefined,
    };
  }

  private toPersistence(settings: CompanySettings): PersistencePayload {
    return {
      logoUrl: settings.logoUrl ?? null,
      primaryColor: settings.primaryColor ?? null,
      secondaryColor: settings.secondaryColor ?? null,
      themeMode: settings.themeMode ?? null,
      videoLink: settings.videoLink ?? null,
    };
  }
}
