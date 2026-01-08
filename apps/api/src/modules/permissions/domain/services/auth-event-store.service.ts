import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AuthEventStoreService {
  private readonly logger = new Logger(AuthEventStoreService.name);

  constructor(private readonly prisma: any) {} // Should be PrismaService

  /**
   * Logs an authorization event (Permission granted, Role assigned, etc)
   */
  async logEvent(params: {
    orgId: string;
    userId?: string;
    type: 'PERMISSION_GRANTED' | 'PERMISSION_REVOKED' | 'ROLE_ASSIGNED' | 'ROLE_REMOVED' | 'POLICY_VIOLATION' | 'RISK_SCORE_CHANGE';
    payload: any;
    metadata?: any;
  }): Promise<void> {
    try {
      await this.prisma.authorizationEvent.create({
        data: {
          orgId: params.orgId,
          userId: params.userId,
          type: params.type,
          payload: params.payload,
          metadata: params.metadata,
        },
      });
      
      this.logger.debug(`Auth event logged: ${params.type} for user ${params.userId}`);
    } catch (error) {
      this.logger.error(`Error logging auth event:`, error);
    }
  }

  /**
   * Retrieve events for a user (Audit trail)
   */
  async getEventsForUser(userId: string, orgId: string) {
    return this.prisma.authorizationEvent.findMany({
      where: { userId, orgId },
      orderBy: { timestamp: 'desc' },
    });
  }
}
