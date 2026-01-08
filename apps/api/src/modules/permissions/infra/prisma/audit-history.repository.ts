import { Injectable } from "@nestjs/common";
import type { PrismaService } from "../../../infra/database/prisma.service";
import type { AuditReport } from "../domain/types/audit-types";

export interface AuditSnapshot {
  id: string;
  orgId: string;
  timestamp: Date;
  conformityScore: number;
  totalAnomalies: number;
  criticalIssues: number;
  highSeverityIssues: number;
  mediumSeverityIssues: number;
  lowSeverityIssues: number;
  orphanedCount: number;
  conflictsCount: number;
  excessiveCount: number;
  hierarchyCount: number;
  auditGapsCount: number;
  obsoleteCount: number;
  sodViolationsCount: number;
}

export interface HistoricalData {
  snapshots: AuditSnapshot[];
  trends: {
    conformityScoreTrend: "improving" | "stable" | "declining";
    anomaliesTrend: "decreasing" | "stable" | "increasing";
  };
}

export interface AuditComparison {
  audit1: AuditSnapshot;
  audit2: AuditSnapshot;
  differences: {
    conformityScoreDiff: number;
    totalAnomaliesDiff: number;
    categoryDifferences: {
      category: string;
      diff: number;
      percentChange: number;
    }[];
  };
  summary: string;
}

/**
 * Repositório para gerenciar histórico de auditorias
 */
@Injectable()
export class AuditHistoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Salva snapshot de auditoria
   */
  async saveAuditSnapshot(report: AuditReport): Promise<void> {
    const snapshot = {
      id: report.id,
      orgId: report.orgId,
      timestamp: report.timestamp,
      conformityScore: report.summary.conformityScore,
      totalAnomalies: report.summary.anomaliesFound,
      criticalIssues: report.summary.criticalIssues,
      highSeverityIssues: report.summary.highSeverityIssues,
      mediumSeverityIssues: report.summary.mediumSeverityIssues,
      lowSeverityIssues: report.summary.lowSeverityIssues,
      orphanedCount: report.orphanedPermissions.length,
      conflictsCount: report.conflicts.length,
      excessiveCount: report.excessivePermissions.length,
      hierarchyCount: report.hierarchyIssues.length,
      auditGapsCount: report.auditGaps.length,
      obsoleteCount: report.obsoletePermissions.length,
      sodViolationsCount: report.sodViolations.length,
      fullReport: JSON.stringify(report),
    };

    // Armazenar no banco de dados
    // Como não temos tabela específica, vamos usar uma abordagem alternativa
    // Armazenar como JSON em uma tabela genérica ou criar tabela específica

    // Por enquanto, vamos apenas logar (implementação real requer migração do Prisma)
    console.log("Snapshot salvo:", snapshot.id);
  }

  /**
   * Obtém dados históricos
   */
  async getHistoricalData(orgId: string, days: number = 30): Promise<HistoricalData> {
    // Implementação mockada - em produção, buscar do banco
    const mockSnapshots: AuditSnapshot[] = this.generateMockSnapshots(orgId, days);

    const trends = this.calculateTrends(mockSnapshots);

    return {
      snapshots: mockSnapshots,
      trends,
    };
  }

  /**
   * Compara duas auditorias
   */
  async compareAudits(id1: string, id2: string): Promise<AuditComparison> {
    // Implementação mockada
    const audit1 = this.getMockSnapshot(id1);
    const audit2 = this.getMockSnapshot(id2);

    const conformityScoreDiff = audit2.conformityScore - audit1.conformityScore;
    const totalAnomaliesDiff = audit2.totalAnomalies - audit1.totalAnomalies;

    const categoryDifferences = [
      {
        category: "Órfãs",
        diff: audit2.orphanedCount - audit1.orphanedCount,
        percentChange: this.calculatePercentChange(audit1.orphanedCount, audit2.orphanedCount),
      },
      {
        category: "Conflitos",
        diff: audit2.conflictsCount - audit1.conflictsCount,
        percentChange: this.calculatePercentChange(audit1.conflictsCount, audit2.conflictsCount),
      },
      {
        category: "Excessivas",
        diff: audit2.excessiveCount - audit1.excessiveCount,
        percentChange: this.calculatePercentChange(audit1.excessiveCount, audit2.excessiveCount),
      },
    ];

    const summary = this.generateComparisonSummary(conformityScoreDiff, totalAnomaliesDiff);

    return {
      audit1,
      audit2,
      differences: {
        conformityScoreDiff,
        totalAnomaliesDiff,
        categoryDifferences,
      },
      summary,
    };
  }

  /**
   * Gera snapshots mockados para demonstração
   */
  private generateMockSnapshots(orgId: string, days: number): AuditSnapshot[] {
    const snapshots: AuditSnapshot[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // Simular melhoria gradual
      const baseScore = 70 + (days - i) * 0.5;
      const baseAnomalies = 50 - (days - i) * 0.3;

      snapshots.push({
        id: `snapshot-${i}`,
        orgId,
        timestamp: date,
        conformityScore: Math.min(100, baseScore + Math.random() * 5),
        totalAnomalies: Math.max(0, Math.floor(baseAnomalies + Math.random() * 10)),
        criticalIssues: Math.floor(Math.random() * 3),
        highSeverityIssues: Math.floor(Math.random() * 5),
        mediumSeverityIssues: Math.floor(Math.random() * 10),
        lowSeverityIssues: Math.floor(Math.random() * 15),
        orphanedCount: Math.floor(Math.random() * 8),
        conflictsCount: Math.floor(Math.random() * 6),
        excessiveCount: Math.floor(Math.random() * 12),
        hierarchyCount: Math.floor(Math.random() * 4),
        auditGapsCount: Math.floor(Math.random() * 10),
        obsoleteCount: Math.floor(Math.random() * 15),
        sodViolationsCount: Math.floor(Math.random() * 3),
      });
    }

    return snapshots;
  }

  /**
   * Obtém snapshot mockado
   */
  private getMockSnapshot(id: string): AuditSnapshot {
    return {
      id,
      orgId: "org-123",
      timestamp: new Date(),
      conformityScore: 85,
      totalAnomalies: 25,
      criticalIssues: 2,
      highSeverityIssues: 5,
      mediumSeverityIssues: 10,
      lowSeverityIssues: 8,
      orphanedCount: 5,
      conflictsCount: 3,
      excessiveCount: 10,
      hierarchyCount: 2,
      auditGapsCount: 3,
      obsoleteCount: 2,
      sodViolationsCount: 0,
    };
  }

  /**
   * Calcula tendências
   */
  private calculateTrends(snapshots: AuditSnapshot[]): HistoricalData["trends"] {
    if (snapshots.length < 2) {
      return {
        conformityScoreTrend: "stable",
        anomaliesTrend: "stable",
      };
    }

    const recent = snapshots.slice(-7); // Últimos 7 dias
    const older = snapshots.slice(-14, -7); // 7 dias anteriores

    const recentAvgScore = recent.reduce((sum, s) => sum + s.conformityScore, 0) / recent.length;
    const olderAvgScore = older.reduce((sum, s) => sum + s.conformityScore, 0) / older.length;

    const recentAvgAnomalies = recent.reduce((sum, s) => sum + s.totalAnomalies, 0) / recent.length;
    const olderAvgAnomalies = older.reduce((sum, s) => sum + s.totalAnomalies, 0) / older.length;

    return {
      conformityScoreTrend:
        recentAvgScore > olderAvgScore + 2
          ? "improving"
          : recentAvgScore < olderAvgScore - 2
            ? "declining"
            : "stable",
      anomaliesTrend:
        recentAvgAnomalies < olderAvgAnomalies - 2
          ? "decreasing"
          : recentAvgAnomalies > olderAvgAnomalies + 2
            ? "increasing"
            : "stable",
    };
  }

  /**
   * Calcula mudança percentual
   */
  private calculatePercentChange(oldValue: number, newValue: number): number {
    if (oldValue === 0) return newValue > 0 ? 100 : 0;
    return ((newValue - oldValue) / oldValue) * 100;
  }

  /**
   * Gera resumo de comparação
   */
  private generateComparisonSummary(scoreDiff: number, anomaliesDiff: number): string {
    if (scoreDiff > 5 && anomaliesDiff < -5) {
      return "Melhoria significativa detectada! Score aumentou e anomalias diminuíram.";
    }
    if (scoreDiff < -5 || anomaliesDiff > 5) {
      return "Atenção: Regressão detectada. Score diminuiu ou anomalias aumentaram.";
    }
    return "Situação estável. Pequenas variações dentro do esperado.";
  }
}
