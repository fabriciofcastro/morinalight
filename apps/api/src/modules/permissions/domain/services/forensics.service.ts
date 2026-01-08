import { Injectable, Logger } from '@nestjs/common';
import { ImmutableAuditService } from './immutable-audit.service';

@Injectable()
export class ForensicsService {
  private readonly logger = new Logger(ForensicsService.name);

  constructor(
    private readonly prisma: any,
    private readonly immutableAudit: ImmutableAuditService
  ) {}

  /**
   * Verifies the entire audit trail for an organization
   */
  async fullAuditVerification(orgId: string) {
    this.logger.log(`🔍 Starting full forensics verification for org: ${orgId}`);
    const result = await this.immutableAudit.verifyChainIntegrity(orgId);
    
    if (!result.isValid) {
      this.logger.error(`🚨 DATA TAMPERING DETECTED! Corrupted event ID: ${result.corruptedEventId}`);
      // In a real SGS, this would trigger a global security alert/lockout
    } else {
      this.logger.log('✅ Audit chain integrity verified.');
    }
    
    return result;
  }

  /**
   * Replays events to identify the exact point of a breach
   */
  async replayEvents(orgId: string, startTime: Date, endTime: Date) {
    const events = await this.prisma.authorizationEvent.findMany({
      where: {
        orgId,
        timestamp: { gte: startTime, lte: endTime }
      },
      orderBy: { timestamp: 'asc' }
    });

    this.logger.log(`🔄 Replaying ${events.length} security events...`);
    
    return events.map(event => ({
      time: event.timestamp,
      user: event.userId,
      type: event.type,
      riskAtTime: event.payload.riskScore,
      action: event.payload.permission,
      status: event.type === 'ACCESS_GRANTED' ? 'ALLOWED' : 'DENIED/VIOLATION'
    }));
  }

  /**
   * Automatic response to pattern deviation
   */
  async handleAnomalyDetection(userId: string, orgId: string, anomalyType: string) {
    this.logger.warn(`🤖 SGS Automated Response triggered for ${userId}: ${anomalyType}`);
    
    // Example: Automatic quarantine for sequence anomalies
    if (anomalyType === 'HIGH_VELOCITY_SENSITIVE_ACTIONS') {
       // Trigger quarantine via GovernancePep would happen here
    }
    
    await this.immutableAudit.logEvent({
      orgId,
      userId,
      type: 'SGS_AUTOMATED_RESPONSE',
      payload: { anomalyType, action: 'LOG_AND_MONITOR' }
    });
  }
}
