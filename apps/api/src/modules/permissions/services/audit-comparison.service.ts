import { getPrisma } from "../../../infra/database/prisma.service";

const prisma = getPrisma();

export type AuditComparison = {
  audit1: AuditSummary;
  audit2: AuditSummary;
  delta: DeltaMetrics;
  changes: ChangeLog[];
  timeline: TimelineEvent[];
};

export type AuditSummary = {
  id: string;
  executedAt: Date;
  orgId: string;
  totalUsers: number;
  totalAnomalies: number;
  complianceScore: number;
  anomaliesByType: Record<string, number>;
};

export type DeltaMetrics = {
  usersDelta: number;
  anomaliesDelta: number;
  scoreDelta: number;
  improvement: boolean;
  percentageChange: number;
};

export type ChangeLog = {
  type: "new" | "resolved" | "persistent";
  anomaly: any;
  userId?: string;
  timestamp: Date;
};

export type TimelineEvent = {
  timestamp: Date;
  event: string;
  impact: "positive" | "negative" | "neutral";
};

export class AuditComparisonService {
  async compareAudits(id1: string, id2: string): Promise<AuditComparison> {
    // Buscar ambas as auditorias
    const [audit1, audit2] = await Promise.all([
      this.getAuditSummary(id1),
      this.getAuditSummary(id2),
    ]);

    if (!audit1 || !audit2) {
      throw new Error("AUDIT_NOT_FOUND");
    }

    // Garantir ordem cronológica (audit1 = mais antiga)
    const [before, after] =
      audit1.executedAt < audit2.executedAt ? [audit1, audit2] : [audit2, audit1];

    // Calcular delta
    const delta = this.calculateDelta(before, after);

    // Identificar mudanças
    const changes = await this.identifyChanges(before.id, after.id);

    // Gerar timeline
    const timeline = this.generateTimeline(before, after, changes);

    return {
      audit1: before,
      audit2: after,
      delta,
      changes,
      timeline,
    };
  }

  private async getAuditSummary(auditId: string): Promise<AuditSummary | null> {
    try {
      const snapshot = await prisma.auditSnapshot.findUnique({
        where: { id: auditId },
      });

      if (!snapshot) {
        return null;
      }

      const summary = snapshot.summary as any;

      return {
        id: snapshot.id,
        executedAt: snapshot.executedAt,
        orgId: snapshot.orgId,
        totalUsers: summary.totalUsers || 0,
        totalAnomalies: summary.totalAnomalies || 0,
        complianceScore: summary.complianceScore || 0,
        anomaliesByType: summary.anomaliesByType || {},
      };
    } catch (error) {
      console.error("Error getting audit summary:", error);
      return null;
    }
  }

  private calculateDelta(before: AuditSummary, after: AuditSummary): DeltaMetrics {
    const usersDelta = after.totalUsers - before.totalUsers;
    const anomaliesDelta = after.totalAnomalies - before.totalAnomalies;
    const scoreDelta = after.complianceScore - before.complianceScore;

    const improvement = scoreDelta > 0 || anomaliesDelta < 0;
    const percentageChange =
      before.complianceScore > 0
        ? ((after.complianceScore - before.complianceScore) / before.complianceScore) * 100
        : 0;

    return {
      usersDelta,
      anomaliesDelta,
      scoreDelta,
      improvement,
      percentageChange,
    };
  }

  private async identifyChanges(beforeId: string, afterId: string): Promise<ChangeLog[]> {
    try {
      const [beforeSnapshot, afterSnapshot] = await Promise.all([
        prisma.auditSnapshot.findUnique({ where: { id: beforeId } }),
        prisma.auditSnapshot.findUnique({ where: { id: afterId } }),
      ]);

      if (!beforeSnapshot || !afterSnapshot) {
        return [];
      }

      const beforeAnomalies = (beforeSnapshot.anomalies as any[]) || [];
      const afterAnomalies = (afterSnapshot.anomalies as any[]) || [];

      const changes: ChangeLog[] = [];

      // Anomalias resolvidas (estavam no before, não estão no after)
      for (const anomaly of beforeAnomalies) {
        const stillExists = afterAnomalies.some(
          (a) => a.userId === anomaly.userId && a.type === anomaly.type,
        );

        if (!stillExists) {
          changes.push({
            type: "resolved",
            anomaly,
            userId: anomaly.userId,
            timestamp: afterSnapshot.executedAt,
          });
        }
      }

      // Novas anomalias (não estavam no before, estão no after)
      for (const anomaly of afterAnomalies) {
        const wasPresent = beforeAnomalies.some(
          (a) => a.userId === anomaly.userId && a.type === anomaly.type,
        );

        if (!wasPresent) {
          changes.push({
            type: "new",
            anomaly,
            userId: anomaly.userId,
            timestamp: afterSnapshot.executedAt,
          });
        }
      }

      // Anomalias persistentes (estavam no before e continuam no after)
      for (const anomaly of afterAnomalies) {
        const wasPresent = beforeAnomalies.some(
          (a) => a.userId === anomaly.userId && a.type === anomaly.type,
        );

        if (wasPresent) {
          changes.push({
            type: "persistent",
            anomaly,
            userId: anomaly.userId,
            timestamp: afterSnapshot.executedAt,
          });
        }
      }

      return changes;
    } catch (error) {
      console.error("Error identifying changes:", error);
      return [];
    }
  }

  private generateTimeline(
    before: AuditSummary,
    after: AuditSummary,
    changes: ChangeLog[],
  ): TimelineEvent[] {
    const timeline: TimelineEvent[] = [];

    // Evento inicial
    timeline.push({
      timestamp: before.executedAt,
      event: `Auditoria inicial: ${before.totalAnomalies} anomalias detectadas`,
      impact: "neutral",
    });

    // Eventos de mudança
    const resolved = changes.filter((c) => c.type === "resolved").length;
    const newAnomalies = changes.filter((c) => c.type === "new").length;

    if (resolved > 0) {
      timeline.push({
        timestamp: after.executedAt,
        event: `${resolved} anomalias resolvidas`,
        impact: "positive",
      });
    }

    if (newAnomalies > 0) {
      timeline.push({
        timestamp: after.executedAt,
        event: `${newAnomalies} novas anomalias detectadas`,
        impact: "negative",
      });
    }

    // Evento final
    const scoreDelta = after.complianceScore - before.complianceScore;
    timeline.push({
      timestamp: after.executedAt,
      event: `Score de conformidade: ${before.complianceScore}% → ${after.complianceScore}% (${scoreDelta > 0 ? "+" : ""}${scoreDelta.toFixed(1)}%)`,
      impact: scoreDelta > 0 ? "positive" : scoreDelta < 0 ? "negative" : "neutral",
    });

    return timeline;
  }

  async getAvailableAudits(orgId: string, limit = 10): Promise<AuditSummary[]> {
    try {
      const snapshots = await prisma.auditSnapshot.findMany({
        where: { orgId },
        orderBy: { executedAt: "desc" },
        take: limit,
      });

      return snapshots.map((snapshot) => {
        const summary = snapshot.summary as any;
        return {
          id: snapshot.id,
          executedAt: snapshot.executedAt,
          orgId: snapshot.orgId,
          totalUsers: summary.totalUsers || 0,
          totalAnomalies: summary.totalAnomalies || 0,
          complianceScore: summary.complianceScore || 0,
          anomaliesByType: summary.anomaliesByType || {},
        };
      });
    } catch (error) {
      console.error("Error getting available audits:", error);
      return [];
    }
  }
}

// Singleton instance
let auditComparisonServiceInstance: AuditComparisonService | null = null;

export function getAuditComparisonService(): AuditComparisonService {
  if (!auditComparisonServiceInstance) {
    auditComparisonServiceInstance = new AuditComparisonService();
  }
  return auditComparisonServiceInstance;
}
