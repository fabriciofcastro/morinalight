import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ChaosSecurityService {
  private readonly logger = new Logger(ChaosSecurityService.name);
  private activeExperiments: Set<string> = new Set();

  /**
   * Injects a failure into a specific security component
   */
  async injectFailure(experimentId: string, durationMs: number = 30000): Promise<void> {
    this.logger.warn(`🚀 Starting Chaos Security Experiment: ${experimentId}`);
    this.activeExperiments.add(experimentId);
    
    setTimeout(() => {
      this.activeExperiments.delete(experimentId);
      this.logger.log(`🛑 Chaos Security Experiment Finished: ${experimentId}`);
    }, durationMs);
  }

  /**
   * Checks if an experiment is active
   */
  isExperimentActive(experimentId: string): boolean {
    return this.activeExperiments.has(experimentId);
  }

  /**
   * Simulate specific security failures
   */
  getSecurityFaults() {
    return {
      opaLatency: this.isExperimentActive('opa_latency') ? 2000 : 0,
      opaDown: this.isExperimentActive('opa_down'),
      fakeHighRisk: this.isExperimentActive('fake_high_risk'),
      ignoreCache: this.isExperimentActive('ignore_auth_cache'),
    };
  }
}
