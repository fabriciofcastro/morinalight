import { Injectable } from '@nestjs/common';
import type { AuditReport } from '../domain/types/audit-types';

export interface ExecutiveKPIs {
    // Security Metrics
    overallConformityScore: number;
    securityTrend: 'improving' | 'stable' | 'declining';
    criticalIssues: number;
    highRiskUsers: number;

    // Operational Metrics
    totalUsers: number;
    totalPermissions: number;
    totalRoles: number;
    auditFrequency: string;

    // Compliance Metrics
    sodViolations: number;
    policyCompliance: number;
    auditCoverage: number;

    // Performance Metrics
    lastAuditDuration: number;
    averageResolutionTime: number;
    automatedFixRate: number;

    // Trends (last 30 days)
    anomaliesTrend: number[];
    conformityTrend: number[];
    violationsTrend: number[];
}

export interface DepartmentComparison {
    department: string;
    conformityScore: number;
    anomaliesCount: number;
    criticalIssues: number;
    userCount: number;
    trend: 'up' | 'down' | 'stable';
}

export interface RiskMatrix {
    userId: string;
    userName: string;
    email: string;
    riskScore: number; // 0-100
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
    department?: string;
}

/**
 * Serviço para métricas executivas e dashboards C-level
 * Fornece KPIs e visualizações de alto nível
 */
@Injectable()
export class ExecutiveMetricsService {
    /**
     * Calcula KPIs executivos
     */
    async calculateKPIs(orgId: string): Promise<ExecutiveKPIs> {
        // Buscar dados históricos (últimos 30 dias)
        const historicalData = await this.getHistoricalData(orgId, 30);
        const latestAudit = historicalData[0];

        if (!latestAudit) {
            throw new Error('No audit data available');
        }

        // Security Metrics
        const overallConformityScore = latestAudit.summary.conformityScore;
        const securityTrend = this.calculateTrend(
            historicalData.map(a => a.summary.conformityScore)
        );
        const criticalIssues = latestAudit.summary.criticalIssues;
        const highRiskUsers = await this.countHighRiskUsers(orgId);

        // Operational Metrics
        const totalUsers = latestAudit.summary.totalUsers;
        const totalPermissions = await this.countTotalPermissions(orgId);
        const totalRoles = await this.countTotalRoles(orgId);
        const auditFrequency = this.calculateAuditFrequency(historicalData);

        // Compliance Metrics
        const sodViolations = latestAudit.sodViolations?.length || 0;
        const policyCompliance = this.calculatePolicyCompliance(latestAudit);
        const auditCoverage = this.calculateAuditCoverage(latestAudit);

        // Performance Metrics
        const lastAuditDuration = latestAudit.executionTime || 0;
        const averageResolutionTime = await this.calculateAvgResolutionTime(orgId);
        const automatedFixRate = this.calculateAutomatedFixRate(historicalData);

        // Trends
        const anomaliesTrend = historicalData.map(a => a.summary.anomaliesFound);
        const conformityTrend = historicalData.map(a => a.summary.conformityScore);
        const violationsTrend = historicalData.map(a => a.sodViolations?.length || 0);

        return {
            overallConformityScore,
            securityTrend,
            criticalIssues,
            highRiskUsers,
            totalUsers,
            totalPermissions,
            totalRoles,
            auditFrequency,
            sodViolations,
            policyCompliance,
            auditCoverage,
            lastAuditDuration,
            averageResolutionTime,
            automatedFixRate,
            anomaliesTrend,
            conformityTrend,
            violationsTrend,
        };
    }

    /**
     * Compara departamentos
     */
    async compareDepartments(orgId: string): Promise<DepartmentComparison[]> {
        const departments = await this.getDepartments(orgId);
        const comparisons: DepartmentComparison[] = [];

        for (const dept of departments) {
            const deptAudit = await this.getLatestDepartmentAudit(orgId, dept.id);
            const deptHistory = await this.getDepartmentHistory(orgId, dept.id, 7);

            comparisons.push({
                department: dept.name,
                conformityScore: deptAudit?.summary.conformityScore || 0,
                anomaliesCount: deptAudit?.summary.anomaliesFound || 0,
                criticalIssues: deptAudit?.summary.criticalIssues || 0,
                userCount: deptAudit?.summary.totalUsers || 0,
                trend: this.calculateDepartmentTrend(deptHistory),
            });
        }

        return comparisons.sort((a, b) => b.conformityScore - a.conformityScore);
    }

    /**
     * Gera matriz de risco de usuários
     */
    async generateRiskMatrix(orgId: string): Promise<RiskMatrix[]> {
        const users = await this.getAllUsers(orgId);
        const riskMatrix: RiskMatrix[] = [];

        for (const user of users) {
            const riskScore = await this.calculateUserRiskScore(user.id, orgId);
            const factors = await this.identifyRiskFactors(user.id, orgId);

            riskMatrix.push({
                userId: user.id,
                userName: user.name,
                email: user.email,
                riskScore,
                riskLevel: this.getRiskLevel(riskScore),
                factors,
                department: user.department?.name,
            });
        }

        return riskMatrix.sort((a, b) => b.riskScore - a.riskScore);
    }

    /**
     * Exporta dados para PowerBI/Tableau
     */
    async exportForBI(orgId: string, format: 'powerbi' | 'tableau'): Promise<any> {
        const kpis = await this.calculateKPIs(orgId);
        const departments = await this.compareDepartments(orgId);
        const riskMatrix = await this.generateRiskMatrix(orgId);

        if (format === 'powerbi') {
            return this.formatForPowerBI({ kpis, departments, riskMatrix });
        } else {
            return this.formatForTableau({ kpis, departments, riskMatrix });
        }
    }

    // Helper methods
    private async getHistoricalData(orgId: string, days: number): Promise<any[]> {
        // Implementar busca de dados históricos
        return [];
    }

    private calculateTrend(values: number[]): 'improving' | 'stable' | 'declining' {
        if (values.length < 2) return 'stable';

        const recent = values.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
        const older = values.slice(-3).reduce((a, b) => a + b, 0) / 3;

        if (recent > older + 5) return 'improving';
        if (recent < older - 5) return 'declining';
        return 'stable';
    }

    private async countHighRiskUsers(orgId: string): Promise<number> {
        const riskMatrix = await this.generateRiskMatrix(orgId);
        return riskMatrix.filter(u => u.riskLevel === 'high' || u.riskLevel === 'critical').length;
    }

    private async countTotalPermissions(orgId: string): Promise<number> {
        // Implementar contagem
        return 0;
    }

    private async countTotalRoles(orgId: string): Promise<number> {
        // Implementar contagem
        return 0;
    }

    private calculateAuditFrequency(historicalData: any[]): string {
        if (historicalData.length < 2) return 'Unknown';

        const avgDaysBetween = historicalData.length > 1
            ? 30 / historicalData.length
            : 30;

        if (avgDaysBetween <= 1) return 'Daily';
        if (avgDaysBetween <= 7) return 'Weekly';
        if (avgDaysBetween <= 30) return 'Monthly';
        return 'Quarterly';
    }

    private calculatePolicyCompliance(audit: any): number {
        const totalPolicies = 6; // 6 políticas SoD pré-definidas
        const violations = audit.sodViolations?.length || 0;
        return Math.max(0, ((totalPolicies - violations) / totalPolicies) * 100);
    }

    private calculateAuditCoverage(audit: any): number {
        const totalUsers = audit.summary.totalUsers;
        const auditedUsers = audit.summary.totalUsers; // Todos são auditados
        return (auditedUsers / totalUsers) * 100;
    }

    private async calculateAvgResolutionTime(orgId: string): Promise<number> {
        // Implementar cálculo de tempo médio de resolução
        return 0;
    }

    private calculateAutomatedFixRate(historicalData: any[]): number {
        if (historicalData.length === 0) return 0;

        const totalAnomalies = historicalData.reduce((sum, a) => sum + a.summary.anomaliesFound, 0);
        const autoFixed = historicalData.reduce((sum, a) => sum + (a.summary.autoFixed || 0), 0);

        return totalAnomalies > 0 ? (autoFixed / totalAnomalies) * 100 : 0;
    }

    private async getDepartments(orgId: string): Promise<any[]> {
        // Implementar busca de departamentos
        return [];
    }

    private async getLatestDepartmentAudit(orgId: string, deptId: string): Promise<any> {
        // Implementar busca
        return null;
    }

    private async getDepartmentHistory(orgId: string, deptId: string, days: number): Promise<any[]> {
        // Implementar busca
        return [];
    }

    private calculateDepartmentTrend(history: any[]): 'up' | 'down' | 'stable' {
        if (history.length < 2) return 'stable';

        const scores = history.map(h => h.summary?.conformityScore || 0);
        const trend = this.calculateTrend(scores);

        if (trend === 'improving') return 'up';
        if (trend === 'declining') return 'down';
        return 'stable';
    }

    private async getAllUsers(orgId: string): Promise<any[]> {
        // Implementar busca
        return [];
    }

    private async calculateUserRiskScore(userId: string, orgId: string): Promise<number> {
        // Implementar cálculo de risco
        // Baseado em: permissões excessivas, violações SoD, anomalias ML, etc.
        return 0;
    }

    private async identifyRiskFactors(userId: string, orgId: string): Promise<string[]> {
        const factors: string[] = [];

        // Implementar identificação de fatores de risco
        // Ex: "Excessive permissions", "SoD violations", "Inactive account", etc.

        return factors;
    }

    private getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
        if (score >= 80) return 'critical';
        if (score >= 60) return 'high';
        if (score >= 40) return 'medium';
        return 'low';
    }

    private formatForPowerBI(data: any): any {
        // Formatar dados para PowerBI
        return {
            tables: [
                {
                    name: 'KPIs',
                    rows: [data.kpis],
                },
                {
                    name: 'Departments',
                    rows: data.departments,
                },
                {
                    name: 'RiskMatrix',
                    rows: data.riskMatrix,
                },
            ],
        };
    }

    private formatForTableau(data: any): any {
        // Formatar dados para Tableau
        return {
            schema: [
                { name: 'KPIs', columns: Object.keys(data.kpis) },
                { name: 'Departments', columns: ['department', 'conformityScore', 'anomaliesCount'] },
                { name: 'RiskMatrix', columns: ['userName', 'riskScore', 'riskLevel'] },
            ],
            data: {
                kpis: [data.kpis],
                departments: data.departments,
                riskMatrix: data.riskMatrix,
            },
        };
    }
}
