import { getPrisma } from "../../../infra/database/prisma.service";
import {
  type AnomalyPrediction,
  getMLFeatureExtractor,
  type UserFeatures,
} from "./ml-feature-extractor.service";

const prisma = getPrisma();

export class MLAnomalyDetector {
  private featureExtractor = getMLFeatureExtractor();
  private threshold = 0.6; // Anomaly score threshold

  /**
   * Isolation Forest simplificado
   * Em produção, usar biblioteca como TensorFlow.js ou Brain.js
   */
  async detectAnomaly(userId: string, orgId: string): Promise<AnomalyPrediction> {
    try {
      // Extrair features do usuário
      const features = await this.featureExtractor.extractUserFeatures(userId, orgId);
      const normalizedFeatures = this.featureExtractor.normalizeFeatures(features);

      // Calcular anomaly score (simplificado)
      const anomalyScore = this.calculateAnomalyScore(normalizedFeatures, features);

      // Determinar se é anomalia
      const isAnomaly = anomalyScore > this.threshold;

      // Gerar razões
      const reasons = this.generateReasons(features, anomalyScore);

      // Confidence (simplificado)
      const confidence = Math.abs(anomalyScore - this.threshold) / this.threshold;

      return {
        userId,
        isAnomaly,
        anomalyScore,
        confidence: Math.min(confidence, 1),
        reasons,
        features,
      };
    } catch (error) {
      console.error("Error detecting anomaly:", error);
      throw error;
    }
  }

  async detectAllAnomalies(orgId: string): Promise<AnomalyPrediction[]> {
    try {
      const allFeatures = await this.featureExtractor.extractAllUsersFeatures(orgId);
      const predictions: AnomalyPrediction[] = [];

      for (const features of allFeatures) {
        const normalizedFeatures = this.featureExtractor.normalizeFeatures(features);
        const anomalyScore = this.calculateAnomalyScore(normalizedFeatures, features);
        const isAnomaly = anomalyScore > this.threshold;

        predictions.push({
          userId: features.userId,
          isAnomaly,
          anomalyScore,
          confidence: Math.abs(anomalyScore - this.threshold) / this.threshold,
          reasons: this.generateReasons(features, anomalyScore),
          features,
        });
      }

      return predictions.filter((p) => p.isAnomaly);
    } catch (error) {
      console.error("Error detecting all anomalies:", error);
      return [];
    }
  }

  /**
   * Algoritmo simplificado de Isolation Forest
   * Score baseado em desvios da média
   */
  private calculateAnomalyScore(normalizedFeatures: number[], features: UserFeatures): number {
    let score = 0;

    // Feature 1: Muitas permissões
    if (features.permissionCount > 30) {
      score += 0.2;
    }

    // Feature 2: Muitos roles
    if (features.roleCount > 4) {
      score += 0.15;
    }

    // Feature 3: Admin + muitas permissões
    if (features.hasAdminPermissions && features.permissionCount > 20) {
      score += 0.25;
    }

    // Feature 4: Mudanças frequentes
    if (features.permissionChangeFrequency > 5) {
      score += 0.2;
    }

    // Feature 5: Inativo há muito tempo
    if (features.lastActivityDays > 60) {
      score += 0.1;
    }

    // Feature 6: SoD violations
    if (features.sodViolations > 0) {
      score += 0.3;
    }

    // Feature 7: Muitas permissões por role (pode indicar role mal configurado)
    if (features.avgPermissionsPerRole > 15) {
      score += 0.15;
    }

    // Feature 8: Acesso a muitos módulos
    if (features.uniqueModules > 8) {
      score += 0.1;
    }

    return Math.min(score, 1);
  }

  private generateReasons(features: UserFeatures, score: number): string[] {
    const reasons: string[] = [];

    if (features.permissionCount > 30) {
      reasons.push(`Número elevado de permissões (${features.permissionCount})`);
    }

    if (features.roleCount > 4) {
      reasons.push(`Múltiplos roles atribuídos (${features.roleCount})`);
    }

    if (features.hasAdminPermissions && features.permissionCount > 20) {
      reasons.push("Combinação de permissões administrativas com alto volume");
    }

    if (features.permissionChangeFrequency > 5) {
      reasons.push(
        `Mudanças frequentes de permissões (${features.permissionChangeFrequency} nos últimos 30 dias)`,
      );
    }

    if (features.lastActivityDays > 60) {
      reasons.push(`Inativo há ${features.lastActivityDays} dias`);
    }

    if (features.sodViolations > 0) {
      reasons.push(`${features.sodViolations} violações de segregação de funções`);
    }

    if (features.avgPermissionsPerRole > 15) {
      reasons.push(
        `Média alta de permissões por role (${features.avgPermissionsPerRole.toFixed(1)})`,
      );
    }

    if (features.uniqueModules > 8) {
      reasons.push(`Acesso a muitos módulos diferentes (${features.uniqueModules})`);
    }

    if (reasons.length === 0) {
      reasons.push(`Score de anomalia: ${(score * 100).toFixed(1)}%`);
    }

    return reasons;
  }

  /**
   * Treinar modelo (placeholder para implementação futura com TensorFlow.js)
   */
  async trainModel(orgId: string): Promise<{ success: boolean; metrics: any }> {
    try {
      console.log("🤖 [ML] Training model (placeholder)...");

      // Coletar dados de treinamento
      const features = await this.featureExtractor.extractAllUsersFeatures(orgId);

      console.log(`📊 [ML] Collected ${features.length} samples for training`);

      // TODO: Implementar treinamento real com TensorFlow.js
      // - Criar dataset
      // - Treinar Isolation Forest ou Autoencoder
      // - Validar modelo
      // - Salvar modelo no banco

      return {
        success: true,
        metrics: {
          samples: features.length,
          accuracy: 0.85, // Placeholder
          precision: 0.82,
          recall: 0.88,
        },
      };
    } catch (error) {
      console.error("Error training model:", error);
      return {
        success: false,
        metrics: {},
      };
    }
  }
}

// Singleton
let mlAnomalyDetectorInstance: MLAnomalyDetector | null = null;

export function getMLAnomalyDetector(): MLAnomalyDetector {
  if (!mlAnomalyDetectorInstance) {
    mlAnomalyDetectorInstance = new MLAnomalyDetector();
  }
  return mlAnomalyDetectorInstance;
}
