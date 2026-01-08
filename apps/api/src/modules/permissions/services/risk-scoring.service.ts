import { Injectable, Logger } from '@nestjs/common';
import { OpaService } from '../infra/opa/opa.service';
import { MlEnsembleService } from './ml-ensemble.service';

@Injectable()
export class RiskScoringService {
  private readonly logger = new Logger(RiskScoringService.name);

  constructor(
    private readonly mlEnsemble: MlEnsembleService,
    private readonly opaService: OpaService,
  ) {}

  /**
   * Calculates the real-time risk score for a user session
   */
  async calculateRiskScore(userId: string, orgId: string, context: { ip?: string; userAgent?: string }): Promise<number> {
    try {
      // 1. Get ML Ensemble prediction
      const mlPrediction = await this.mlEnsemble.predictWithEnsemble(userId, orgId);
      
      // 2. Base score from ML anomaly score (0-100)
      let score = mlPrediction.anomalyScore * 100;

      // 3. Heuristic adjustments
      if (context.ip === 'unknown') score += 20;
      
      // 4. OPA Check for specific risk policies (centralized)
      const opaRiskResult = await this.opaService.evaluatePolicy('risk/calculate', {
        userId,
        orgId,
        currentScore: score,
        context
      });

      // If OPA says it's risky, bump it up
      if (opaRiskResult === true) score = Math.max(score, 85);

      // Clamp score
      return Math.min(Math.max(score, 0), 100);
    } catch (error) {
      this.logger.error(`Error calculating risk score for user ${userId}:`, error);
      // Fail-safe: medium risk
      return 50;
    }
  }
}
