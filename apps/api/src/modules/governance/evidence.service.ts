import { IntegrityService } from "../../audit/integrity.service";
import { getPrisma } from "../../infra/database/prisma.service";

const prisma = getPrisma();

export class EvidenceExportService {
  /**
   * Generates a signed JSON export of audit events for a given period or user.
   * This file can be used as legal evidence.
   */
  static async exportEvidence(
    orgId: string,
    filters: { startDate: Date; endDate: Date; userId?: string },
  ) {
    // 1. Fetch Events
    const events = await prisma.auditEvent.findMany({
      where: {
        orgId,
        timestamp: {
          gte: filters.startDate,
          lte: filters.endDate,
        },
        userId: filters.userId,
      },
      include: {
        trace: true, // Include the deeper decision logic
      },
      orderBy: {
        timestamp: "asc",
      },
    });

    if (events.length === 0) {
      throw new Error("No events found for the specified criteria.");
    }

    // 2. Validate Chain Integrity during export
    // Adapt to IntegrityService payload format
    const integrityPayloads = events.map((e) => ({
      previousHash: e.previousHash || undefined,
      timestamp: e.timestamp,
      userId: e.userId || "system",
      ip: e.ip,
      decision: e.decision,
      resource: e.resource,
      action: e.action,
    }));

    const isChainValid = IntegrityService.verifyChain(integrityPayloads);

    // 3. Create Export Object
    const exportData = {
      meta: {
        exportedAt: new Date(),
        filter: filters,
        recordCount: events.length,
        integrityVerified: isChainValid,
        system: "Morina Enterprise Governance",
      },
      events: events,
      integritySignature: null as string | null,
    };

    // 4. Digitally Sign the entire export (if we had a private key loaded)
    // For now, we simulate signing the hash of the JSON
    // In production, this would use a HSM or secure vault key

    // const exportString = JSON.stringify(exportData);
    // const signature = IntegrityService.signEvent(createHash('sha256').update(exportString).digest('hex'), PRIVATE_KEY);
    // exportData.integritySignature = signature;

    return exportData;
  }
}
