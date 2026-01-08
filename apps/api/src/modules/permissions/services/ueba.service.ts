import { MaxMindGeoIPService } from '../../security/integrations/maxmind-geoip.service';

export interface BehaviorAnalysisResult {
  isAnomalous: boolean;
  riskScoreAdjustment: number;
  reasons: string[];
}

@Injectable()
export class UebaService {
  private readonly logger = new Logger(UebaService.name);
  private readonly geoIpService = new MaxMindGeoIPService();
  
  // Storage for recent user actions
  private userRecentActions: Map<string, Array<{ action: string; timestamp: number; ip?: string }>> = new Map();

  constructor(private readonly prisma: any) {}

  /**
   * Analyzes current behavior against history and patterns
   */
  async analyzeBehavior(userId: string, orgId: string, context: { action: string; ip?: string }): Promise<BehaviorAnalysisResult> {
    const now = Date.now();
    const result: BehaviorAnalysisResult = {
      isAnomalous: false,
      riskScoreAdjustment: 0,
      reasons: [],
    };

    // 1. Get/Initialize user tracking
    if (!this.userRecentActions.has(userId)) {
      this.userRecentActions.set(userId, []);
    }
    const history = this.userRecentActions.get(userId)!;
    
    // 2. Velocity Check (Actions in the last minute)
    const oneMinuteAgo = now - 60000;
    const actionsLastMinute = history.filter(h => h.timestamp > oneMinuteAgo).length;
    
    if (actionsLastMinute > 30) {
      result.isAnomalous = true;
      result.riskScoreAdjustment += 30;
      result.reasons.push('High action velocity (potential brute force or script)');
    }

    // 3. Impossible Travel Check (Advanced via MaxMind)
    const lastAction = history[history.length - 1];
    if (lastAction && lastAction.ip && context.ip && lastAction.ip !== context.ip) {
      const timeDiffMinutes = (now - lastAction.timestamp) / 60000;
      const isImpossible = await this.geoIpService.detectImpossibleTravel(
        lastAction.ip,
        context.ip,
        timeDiffMinutes
      );

      if (isImpossible) {
        result.isAnomalous = true;
        result.riskScoreAdjustment += 70; // Critical anomaly
        result.reasons.push(`Impossible travel detected between ${lastAction.ip} and ${context.ip}`);
      }
    }


    // 4. Sequence Anomaly (e.g., sensitive actions without prior "view")
    const sensitiveActions = ['delete', 'export', 'manage'];
    if (sensitiveActions.includes(context.action)) {
       const hasRecentView = history.some(h => h.action.includes('view') || h.action.includes('list'));
       if (!hasRecentView && history.length > 5) {
         result.isAnomalous = true;
         result.riskScoreAdjustment += 20;
         result.reasons.push('Anomalous sequence: sensitive action without prior data browsing');
       }
    }

    // 5. Update history
    history.push({ action: context.action, timestamp: now, ip: context.ip });
    if (history.length > 50) history.shift(); // Keep window small for memory

    return result;
  }
}
