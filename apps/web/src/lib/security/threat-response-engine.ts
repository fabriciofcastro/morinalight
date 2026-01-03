/**
 * Threat Response Engine
 * 
 * Automated threat response system based on configurable rules
 */

import { getPrismaClient } from '@/lib/prisma';
import { notificationService } from '@/lib/services/notification-service';
import { DEFAULT_THREAT_RULES, ThreatRule, ruleMatches } from './threat-rules';

export interface ThreatResponseResult {
    ruleId: string;
    ruleName: string;
    actionsExecuted: string[];
    success: boolean;
    errors?: string[];
}

class ThreatResponseEngine {
    private rules: ThreatRule[] = [];
    private enabled: boolean;
    private dryRun: boolean;

    constructor() {
        this.enabled = process.env.THREAT_RESPONSE_ENABLED === 'true';
        this.dryRun = process.env.THREAT_RESPONSE_DRY_RUN === 'true';
        this.rules = DEFAULT_THREAT_RULES;
    }

    /**
     * Process a security alert and execute matching rules
     */
    async processAlert(alert: {
        id: string;
        userId: string;
        alertType: string;
        severity: string;
        metadata?: Record<string, any>;
    }): Promise<ThreatResponseResult[]> {
        if (!this.enabled) {
            console.log('[Threat Response] Engine disabled');
            return [];
        }

        const results: ThreatResponseResult[] = [];

        // Find matching rules (sorted by priority)
        const matchingRules = this.rules
            .filter(rule => ruleMatches(rule, alert))
            .sort((a, b) => b.priority - a.priority);

        if (matchingRules.length === 0) {
            console.log('[Threat Response] No matching rules for alert:', alert.alertType);
            return [];
        }

        // Execute each matching rule
        for (const rule of matchingRules) {
            const result = await this.executeRule(rule, alert);
            results.push(result);

            // Log the action
            await this.logAction(alert, rule, result);
        }

        return results;
    }

    /**
     * Execute a single rule
     */
    private async executeRule(
        rule: ThreatRule,
        alert: {
            id: string;
            userId: string;
            alertType: string;
            severity: string;
            metadata?: Record<string, any>;
        }
    ): Promise<ThreatResponseResult> {
        const actionsExecuted: string[] = [];
        const errors: string[] = [];

        console.log(
            `[Threat Response] ${this.dryRun ? '[DRY RUN] ' : ''}Executing rule: ${rule.name}`
        );

        try {
            // Block user
            if (rule.actions.blockUser?.enabled) {
                if (this.dryRun) {
                    console.log(
                        `[Threat Response] [DRY RUN] Would block user ${alert.userId} for ${rule.actions.blockUser.durationMinutes} minutes`
                    );
                    actionsExecuted.push('block_user (dry-run)');
                } else {
                    await this.blockUser(alert.userId, rule.actions.blockUser.durationMinutes);
                    actionsExecuted.push('block_user');
                }
            }

            // Block IP
            if (rule.actions.blockIP?.enabled && alert.metadata?.ip) {
                if (this.dryRun) {
                    console.log(
                        `[Threat Response] [DRY RUN] Would block IP ${alert.metadata.ip} for ${rule.actions.blockIP.durationMinutes} minutes`
                    );
                    actionsExecuted.push('block_ip (dry-run)');
                } else {
                    await this.blockIP(
                        alert.metadata.ip,
                        rule.actions.blockIP.durationMinutes,
                        `Automated block: ${rule.name}`
                    );
                    actionsExecuted.push('block_ip');
                }
            }

            // Send notifications
            if (rule.actions.notify?.enabled) {
                if (this.dryRun) {
                    console.log(
                        `[Threat Response] [DRY RUN] Would send notification via ${rule.actions.notify.channels.join(', ')}`
                    );
                    actionsExecuted.push('notify (dry-run)');
                } else {
                    await this.sendNotification(alert, rule);
                    actionsExecuted.push('notify');
                }
            }

            // Escalate
            if (rule.actions.escalate?.enabled) {
                if (this.dryRun) {
                    console.log(
                        `[Threat Response] [DRY RUN] Would escalate to ${rule.actions.escalate.to}`
                    );
                    actionsExecuted.push('escalate (dry-run)');
                } else {
                    await this.escalate(alert, rule);
                    actionsExecuted.push('escalate');
                }
            }

            return {
                ruleId: rule.id,
                ruleName: rule.name,
                actionsExecuted,
                success: true,
            };
        } catch (error) {
            console.error('[Threat Response] Error executing rule:', error);
            errors.push(error instanceof Error ? error.message : 'Unknown error');

            return {
                ruleId: rule.id,
                ruleName: rule.name,
                actionsExecuted,
                success: false,
                errors,
            };
        }
    }

    /**
     * Block a user
     */
    private async blockUser(userId: string, minutes: number): Promise<void> {
        const prisma = await getPrismaClient();
        if (!prisma) {
            throw new Error('Database unavailable');
        }

        const blockedUntil = minutes > 0 ? new Date(Date.now() + minutes * 60000) : null;

        await prisma.user.update({
            where: { id: userId },
            data: { blockedUntil },
        });

        console.log(`[Threat Response] Blocked user ${userId} until ${blockedUntil?.toISOString() || 'permanent'}`);
    }

    /**
     * Block an IP address
     */
    private async blockIP(ip: string, minutes: number, reason: string): Promise<void> {
        const prisma = await getPrismaClient();
        if (!prisma) {
            throw new Error('Database unavailable');
        }

        const expiresAt = minutes > 0 ? new Date(Date.now() + minutes * 60000) : null;

        await prisma.blockedIP.upsert({
            where: { ip },
            update: { expiresAt, reason },
            create: {
                ip,
                reason,
                expiresAt,
                blockedAt: new Date(),
                createdBy: 'threat-response-engine',
            },
        });

        console.log(`[Threat Response] Blocked IP ${ip} until ${expiresAt?.toISOString() || 'permanent'}`);
    }

    /**
     * Send notification
     */
    private async sendNotification(
        alert: {
            userId: string;
            alertType: string;
            severity: string;
            metadata?: Record<string, any>;
        },
        rule: ThreatRule
    ): Promise<void> {
        const prisma = await getPrismaClient();
        if (!prisma) return;

        const user = await prisma.user.findUnique({
            where: { id: alert.userId },
            select: { email: true, displayName: true },
        });

        if (!user) return;

        await notificationService.sendSecurityAlert({
            alertType: alert.alertType,
            severity: alert.severity,
            description: `Automated response triggered: ${rule.name}`,
            userEmail: user.email,
            userName: user.displayName || undefined,
            timestamp: new Date(),
            metadata: alert.metadata,
        });

        console.log(`[Threat Response] Sent notification for alert ${alert.alertType}`);
    }

    /**
     * Escalate to security team
     */
    private async escalate(
        alert: {
            userId: string;
            alertType: string;
            severity: string;
            metadata?: Record<string, any>;
        },
        rule: ThreatRule
    ): Promise<void> {
        // TODO: Implement escalation logic (e.g., create ticket, notify team)
        console.log(`[Threat Response] Escalated alert ${alert.alertType} to ${rule.actions.escalate?.to}`);
    }

    /**
     * Log automated action
     */
    private async logAction(
        alert: {
            id: string;
            userId: string;
            alertType: string;
            metadata?: Record<string, any>;
        },
        rule: ThreatRule,
        result: ThreatResponseResult
    ): Promise<void> {
        const prisma = await getPrismaClient();
        if (!prisma) return;

        try {
            // Update alert metadata with response info
            await prisma.securityAlert.update({
                where: { id: alert.id },
                data: {
                    metadata: {
                        ...(alert.metadata || {}),
                        automatedResponse: {
                            ruleId: rule.id,
                            ruleName: rule.name,
                            actionsExecuted: result.actionsExecuted,
                            success: result.success,
                            timestamp: new Date().toISOString(),
                        },
                    },
                },
            });
        } catch (error) {
            console.error('[Threat Response] Failed to log action:', error);
        }
    }

    /**
     * Get all rules
     */
    getRules(): ThreatRule[] {
        return this.rules;
    }

    /**
     * Update rules
     */
    setRules(rules: ThreatRule[]): void {
        this.rules = rules;
    }

    /**
     * Enable/disable engine
     */
    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    /**
     * Enable/disable dry-run mode
     */
    setDryRun(dryRun: boolean): void {
        this.dryRun = dryRun;
    }
}

export const threatResponseEngine = new ThreatResponseEngine();
