import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class GovernancePepService {
  private readonly logger = new Logger(GovernancePepService.name);
  
  // Kill switches can be stored in Redis or DB for persistence
  private activeKillSwitches: Set<string> = new Set();
  private quarantinedUsers: Set<string> = new Set();
  private permissionRateLimits: Map<string, { count: number; lastReset: number }> = new Map();

  constructor(private readonly prisma: any) {}

  /**
   * Checks if a security kill switch is active for a permission
   */
  isFeatureDisabled(permission: string): boolean {
    return this.activeKillSwitches.has('*') || this.activeKillSwitches.has(permission);
  }

  /**
   * Activates a kill switch (e.g., in response to a global breach)
   */
  activateKillSwitch(permission: string = '*'): void {
    this.logger.warn(`🛑 KILL SWITCH ACTIVATED for: ${permission}`);
    this.activeKillSwitches.add(permission);
  }

  /**
   * Quarantines a user session (degrading access or blocking temporarily)
   */
  quarantineUser(userId: string): void {
    this.logger.error(`☣️ User QUARANTINED due to high risk: ${userId}`);
    this.quarantinedUsers.add(userId);
  }

  isUserQuarantined(userId: string): boolean {
    return this.quarantinedUsers.has(userId);
  }

  /**
   * Enforces rate limiting per permission
   */
  async checkRateLimit(userId: string, permission: string): Promise<boolean> {
    const key = `${userId}:${permission}`;
    const now = Date.now();
    const limit = 100; // actions per minute, should be configurable
    const windowMs = 60000;

    let data = this.permissionRateLimits.get(key);
    
    if (!data || (now - data.lastReset > windowMs)) {
      data = { count: 1, lastReset: now };
    } else {
      data.count++;
    }

    this.permissionRateLimits.set(key, data);

    if (data.count > limit) {
      this.logger.warn(`🚨 Rate limit exceeded for user ${userId} on ${permission}`);
      return false;
    }

    return true;
  }
}
