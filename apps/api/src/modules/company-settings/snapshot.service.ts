import type { PrismaClient } from "@prisma/client";
import type { CompanySettings } from "./company-settings.schema";

export class SnapshotService {
  constructor(private prisma: PrismaClient) {}

  async createSnapshot(orgId: string, actorId: string, name?: string) {
    // 1. Get current settings
    const currentSettings = await this.prisma.companySettings.findUnique({
      where: { orgId },
    });

    if (!currentSettings) throw new Error("Settings not found");

    // 2. Get latest version number
    const lastVersion = await this.prisma.companySettingsVersion.findFirst({
      where: { orgId },
      orderBy: { version: "desc" },
    });

    const newVersion = (lastVersion?.version || 0) + 1;

    // 3. Create snapshot
    return this.prisma.companySettingsVersion.create({
      data: {
        orgId,
        version: newVersion,
        snapshot: currentSettings as any, // Full JSON dump
        name: name || `Versão ${newVersion}`,
        createdBy: actorId,
      },
    });
  }

  async getVersions(orgId: string) {
    return this.prisma.companySettingsVersion.findMany({
      where: { orgId },
      orderBy: { version: "desc" },
      include: {
        creator: {
          select: { displayName: true, email: true, avatarUrl: true },
        },
      },
    });
  }

  async restoreSnapshot(orgId: string, versionId: string, actorId: string) {
    // 1. Get snapshot
    const version = await this.prisma.companySettingsVersion.findUnique({
      where: { id: versionId },
      include: { creator: true },
    });

    if (!version || version.orgId !== orgId) {
      throw new Error("Version not found or access denied");
    }

    const snapshotData = version.snapshot as Partial<CompanySettings>;

    // 2. Update current settings
    // Remove metadata that shouldn't be restored blindly if we want to be safe,
    // but usually restore means "make it exactly like this".
    // We should exclude `id`, `orgId`, `createdAt`, `updatedAt` from the spread if they are in snapshot.

    // Using prisma update
    const { id, orgId: _orgId, createdAt, updatedAt, ...rest } = snapshotData as any;

    const restored = await this.prisma.companySettings.update({
      where: { orgId },
      data: rest,
    });

    // 3. Mark as restored
    await this.prisma.companySettingsVersion.update({
      where: { id: versionId },
      data: { restoredAt: new Date() },
    });

    // 4. Log audit (optional, caller might handle it, but good to ensure)
    // We can rely on the existing route logic if we call this from route,
    // OR we log explicit RESTORE action here.

    return restored;
  }
}
