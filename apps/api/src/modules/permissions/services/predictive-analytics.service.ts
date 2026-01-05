import { Injectable } from '@nestjs/common';

export interface PredictiveModel {
    type: 'violation_forecast' | 'risk_prediction' | 'anomaly_forecast';
    accuracy: number;
    lastTrained: Date;
    predictions: number;
}

export interface ViolationPrediction {
    userId: string;
    userName: string;
    violationType: string;
    probability: number; // 0-1
    predictedDate: Date;
    factors: string[];
    preventiveActions: string[];
}

export interface RiskScore {
    userId: string;
    userName: string;
    overallRisk: number; // 0-100
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    riskFactors: Array<{
        factor: string;
        weight: number;
        contribution: number;
    }>;
    trend: 'increasing' | 'stable' | 'decreasing';
    recommendations: string[];
}

export interface ProactiveRecommendation {
    userId: string;
    type: 'remove_permission' | 'add_training' | 'review_access' | 'apply_policy';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    description: string;
    expectedImpact: string;
    estimatedEffort: 'low' | 'medium' | 'high';
}

/**
 * Serviço de análise preditiva
 * Prevê violações futuras e fornece recomendações proativas
 */
@Injectable()
export class PredictiveAnalyticsService {
    /**
     * Prevê violações futuras
     */
    async predictViolations(orgId: string, daysAhead: number = 30): Promise<ViolationPrediction[]> {
        const predictions: ViolationPrediction[] = [];

        // Obter dados históricos
        const historicalData = await this.getHistoricalViolations(orgId, 90);
        const users = await this.getAllUsers(orgId);

        for (const user of users) {
            // Calcular probabilidade de violação baseado em padrões históricos
            const userHistory = historicalData.filter(v => v.userId === user.id);
            const probability = this.calculateViolationProbability(user, userHistory);

            if (probability > 0.3) { // Threshold de 30%
                const factors = this.identifyRiskFactors(user, userHistory);
                const preventiveActions = this.generatePreventiveActions(factors);

                predictions.push({
                    userId: user.id,
                    userName: user.name,
                    violationType: this.predictViolationType(userHistory),
                    probability,
                    predictedDate: this.estimatePredictedDate(probability, daysAhead),
                    factors,
                    preventiveActions,
                });
            }
        }

        return predictions.sort((a, b) => b.probability - a.probability);
    }

    /**
     * Calcula score de risco por usuário
     */
    async calculateRiskScores(orgId: string): Promise<RiskScore[]> {
        const users = await this.getAllUsers(orgId);
        const scores: RiskScore[] = [];

        for (const user of users) {
            const riskFactors = await this.analyzeRiskFactors(user.id, orgId);
            const overallRisk = this.calculateOverallRisk(riskFactors);
            const trend = await this.calculateRiskTrend(user.id, orgId);

            scores.push({
                userId: user.id,
                userName: user.name,
                overallRisk,
                riskLevel: this.getRiskLevel(overallRisk),
                riskFactors,
                trend,
                recommendations: this.generateRiskRecommendations(riskFactors),
            });
        }

        return scores.sort((a, b) => b.overallRisk - a.overallRisk);
    }

    /**
     * Gera recomendações proativas
     */
    async generateProactiveRecommendations(orgId: string): Promise<ProactiveRecommendation[]> {
        const recommendations: ProactiveRecommendation[] = [];

        // Analisar usuários de alto risco
        const riskScores = await this.calculateRiskScores(orgId);
        const highRiskUsers = riskScores.filter(s => s.riskLevel === 'high' || s.riskLevel === 'critical');

        for (const user of highRiskUsers) {
            // Gerar recomendações baseadas nos fatores de risco
            for (const factor of user.riskFactors) {
                const recommendation = this.createRecommendation(user.userId, factor);
                if (recommendation) {
                    recommendations.push(recommendation);
                }
            }
        }

        // Analisar violações previstas
        const predictions = await this.predictViolations(orgId);
        const highProbabilityPredictions = predictions.filter(p => p.probability > 0.7);

        for (const prediction of highProbabilityPredictions) {
            recommendations.push({
                userId: prediction.userId,
                type: 'review_access',
                priority: 'urgent',
                description: `High probability (${(prediction.probability * 100).toFixed(0)}%) of ${prediction.violationType} violation`,
                expectedImpact: 'Prevent future compliance violation',
                estimatedEffort: 'medium',
            });
        }

        return recommendations.sort((a, b) => {
            const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }

    /**
     * Prevê anomalias futuras
     */
    async forecastAnomalies(orgId: string, daysAhead: number = 30): Promise<{
        forecast: Array<{
            date: Date;
            predictedAnomalies: number;
            confidence: number;
        }>;
        trend: 'increasing' | 'stable' | 'decreasing';
        recommendations: string[];
    }> {
        // Obter dados históricos
        const historicalData = await this.getHistoricalAnomalies(orgId, 90);

        // Calcular tendência
        const trend = this.calculateAnomalyTrend(historicalData);

        // Gerar previsão
        const forecast = [];
        const today = new Date();

        for (let i = 1; i <= daysAhead; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i);

            const predictedAnomalies = this.predictAnomaliesForDate(historicalData, date);
            const confidence = this.calculateConfidence(historicalData, i);

            forecast.push({
                date,
                predictedAnomalies,
                confidence,
            });
        }

        // Gerar recomendações
        const recommendations = this.generateForecastRecommendations(forecast, trend);

        return {
            forecast,
            trend,
            recommendations,
        };
    }

    // Helper methods
    private async getHistoricalViolations(orgId: string, days: number): Promise<any[]> {
        // Implementar busca
        return [];
    }

    private async getAllUsers(orgId: string): Promise<any[]> {
        // Implementar busca
        return [];
    }

    private calculateViolationProbability(user: any, history: any[]): number {
        // Implementar cálculo usando ML ou heurísticas
        // Fatores: histórico de violações, permissões excessivas, mudanças recentes, etc.
        return 0.5;
    }

    private identifyRiskFactors(user: any, history: any[]): string[] {
        const factors: string[] = [];

        // Implementar identificação de fatores
        if (history.length > 0) {
            factors.push('Previous violations');
        }

        return factors;
    }

    private generatePreventiveActions(factors: string[]): string[] {
        const actions: string[] = [];

        for (const factor of factors) {
            switch (factor) {
                case 'Previous violations':
                    actions.push('Schedule compliance training');
                    break;
                case 'Excessive permissions':
                    actions.push('Review and reduce permissions');
                    break;
                case 'Inactive account':
                    actions.push('Deactivate or review account');
                    break;
            }
        }

        return actions;
    }

    private predictViolationType(history: any[]): string {
        // Implementar predição baseada em histórico
        return 'SoD violation';
    }

    private estimatePredictedDate(probability: number, daysAhead: number): Date {
        const date = new Date();
        // Quanto maior a probabilidade, mais cedo a data prevista
        const daysUntil = Math.floor(daysAhead * (1 - probability));
        date.setDate(date.getDate() + daysUntil);
        return date;
    }

    private async analyzeRiskFactors(userId: string, orgId: string): Promise<Array<{
        factor: string;
        weight: number;
        contribution: number;
    }>> {
        // Implementar análise de fatores de risco
        return [
            { factor: 'Excessive permissions', weight: 0.3, contribution: 25 },
            { factor: 'SoD violations', weight: 0.4, contribution: 40 },
            { factor: 'Inactive account', weight: 0.2, contribution: 15 },
            { factor: 'Recent changes', weight: 0.1, contribution: 10 },
        ];
    }

    private calculateOverallRisk(factors: Array<{ factor: string; weight: number; contribution: number }>): number {
        return factors.reduce((sum, f) => sum + f.contribution, 0);
    }

    private getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
        if (score >= 80) return 'critical';
        if (score >= 60) return 'high';
        if (score >= 40) return 'medium';
        return 'low';
    }

    private async calculateRiskTrend(userId: string, orgId: string): Promise<'increasing' | 'stable' | 'decreasing'> {
        // Implementar cálculo de tendência
        return 'stable';
    }

    private generateRiskRecommendations(factors: Array<{ factor: string; weight: number; contribution: number }>): string[] {
        return factors
            .filter(f => f.contribution > 20)
            .map(f => `Address ${f.factor.toLowerCase()}`);
    }

    private createRecommendation(userId: string, factor: { factor: string; weight: number; contribution: number }): ProactiveRecommendation | null {
        if (factor.contribution < 20) return null;

        let type: ProactiveRecommendation['type'] = 'review_access';
        let description = '';

        switch (factor.factor) {
            case 'Excessive permissions':
                type = 'remove_permission';
                description = 'Remove unnecessary permissions to reduce risk';
                break;
            case 'SoD violations':
                type = 'apply_policy';
                description = 'Apply SoD policy to prevent violations';
                break;
            case 'Inactive account':
                type = 'review_access';
                description = 'Review or deactivate inactive account';
                break;
        }

        return {
            userId,
            type,
            priority: factor.contribution >= 40 ? 'high' : 'medium',
            description,
            expectedImpact: `Reduce risk by ${factor.contribution}%`,
            estimatedEffort: 'medium',
        };
    }

    private async getHistoricalAnomalies(orgId: string, days: number): Promise<any[]> {
        // Implementar busca
        return [];
    }

    private calculateAnomalyTrend(data: any[]): 'increasing' | 'stable' | 'decreasing' {
        // Implementar cálculo
        return 'stable';
    }

    private predictAnomaliesForDate(historicalData: any[], date: Date): number {
        // Implementar predição usando time series
        return 5;
    }

    private calculateConfidence(historicalData: any[], daysAhead: number): number {
        // Confiança diminui com o tempo
        return Math.max(0.5, 1 - (daysAhead / 100));
    }

    private generateForecastRecommendations(forecast: any[], trend: string): string[] {
        const recommendations: string[] = [];

        if (trend === 'increasing') {
            recommendations.push('Increase audit frequency');
            recommendations.push('Review and tighten security policies');
        }

        const avgAnomalies = forecast.reduce((sum, f) => sum + f.predictedAnomalies, 0) / forecast.length;
        if (avgAnomalies > 10) {
            recommendations.push('Consider implementing additional preventive controls');
        }

        return recommendations;
    }
}
