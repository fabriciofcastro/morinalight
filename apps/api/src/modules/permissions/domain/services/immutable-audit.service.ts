import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';

@Injectable()
export class ImmutableAuditService {
  private readonly logger = new Logger(ImmutableAuditService.name);

  constructor(private readonly prisma: any) {} // Should be PrismaService

  /**
   * Logs an event with hash chaining
   */
  async logEvent(params: {
    orgId: string;
    userId?: string;
    type: string;
    payload: any;
    metadata?: any;
  }): Promise<void> {
    try {
      // 1. Get the last event's hash to create the link
      const lastEvent = await this.prisma.authorizationEvent.findFirst({
        where: { orgId: params.orgId },
        orderBy: { timestamp: 'desc' },
      });

      const previousHash = lastEvent?.hash || null;
      
      // 2. Prepare data for hashing
      const dataToHash = JSON.stringify({
        orgId: params.orgId,
        userId: params.userId,
        type: params.type,
        payload: params.payload,
        previousHash,
        timestamp: new Date().toISOString(), // Use a fixed time for the record
      });

      // 3. Generate SHA-256 hash
      const hash = createHash('sha256').update(dataToHash).digest('hex');

      // 4. Persistence
      await this.prisma.authorizationEvent.create({
        data: {
          orgId: params.orgId,
          userId: params.userId,
          type: params.type,
          payload: params.payload,
          metadata: params.metadata,
          hash,
          previousHash,
        },
      });

      this.logger.debug(`Immutable event logged: ${params.type} (Hash: ${hash.substring(0, 8)}...)`);
    } catch (error) {
      this.logger.error('Failed to log immutable event:', error);
    }
  }

  /**
   * Verifies the integrity of the audit chain
   */
  async verifyChainIntegrity(orgId: string): Promise<{ isValid: boolean; corruptedEventId?: string }> {
    const events = await this.prisma.authorizationEvent.findMany({
      where: { orgId },
      orderBy: { timestamp: 'asc' },
    });

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const previousHash = i === 0 ? null : events[i - 1].hash;

      if (event.previousHash !== previousHash) {
        return { isValid: false, corruptedEventId: event.id };
      }

      // Re-calculate hash and compare
      const dataToHash = JSON.stringify({
        orgId: event.orgId,
        userId: event.userId,
        type: event.type,
        payload: event.payload,
        previousHash: event.previousHash,
        timestamp: event.timestamp.toISOString(),
      });

      const calculatedHash = createHash('sha256').update(dataToHash).digest('hex');
      
      if (calculatedHash !== event.hash) {
        return { isValid: false, corruptedEventId: event.id };
      }
    }

    return { isValid: true };
  }
}
