/**
 * Threat Response Rules
 * 
 * Defines automated threat response rules and thresholds
 */

export interface ThreatRule {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    priority: number; // Higher = more important
    conditions: {
        alertType?: string | string[];
        severity?: string | string[];
        count?: number;
        timeWindowMinutes?: number;
        metadata?: Record<string, any>;
    };
    actions: {
        blockUser?: {
            enabled: boolean;
            durationMinutes: number;
        };
        blockIP?: {
            enabled: boolean;
            durationMinutes: number;
        };
        notify?: {
            enabled: boolean;
            channels: ('email' | 'sms')[];
        };
        escalate?: {
            enabled: boolean;
            to: string;
        };
    };
}

export const DEFAULT_THREAT_RULES: ThreatRule[] = [
    {
        id: 'rule_001',
        name: 'Multiple Failed Logins',
        description: 'Block user after 5 failed login attempts in 5 minutes',
        enabled: true,
        priority: 100,
        conditions: {
            alertType: 'multiple_failed_logins',
            count: 1,
            timeWindowMinutes: 5,
        },
        actions: {
            blockUser: {
                enabled: true,
                durationMinutes: 60, // 1 hour
            },
            notify: {
                enabled: true,
                channels: ['email'],
            },
        },
    },
    {
        id: 'rule_002',
        name: 'Impossible Travel',
        description: 'Immediately block on impossible travel detection',
        enabled: true,
        priority: 200,
        conditions: {
            alertType: 'impossible_travel',
            severity: 'critical',
        },
        actions: {
            blockUser: {
                enabled: true,
                durationMinutes: 120, // 2 hours
            },
            blockIP: {
                enabled: true,
                durationMinutes: 1440, // 24 hours
            },
            notify: {
                enabled: true,
                channels: ['email'],
            },
        },
    },
    {
        id: 'rule_003',
        name: 'Privilege Escalation',
        description: 'Block and escalate on privilege escalation attempts',
        enabled: true,
        priority: 300,
        conditions: {
            alertType: 'privilege_escalation_attempt',
            severity: 'critical',
        },
        actions: {
            blockUser: {
                enabled: true,
                durationMinutes: 0, // Permanent
            },
            notify: {
                enabled: true,
                channels: ['email'],
            },
            escalate: {
                enabled: true,
                to: 'security-team',
            },
        },
    },
    {
        id: 'rule_004',
        name: 'Brute Force Attack',
        description: 'Block IP on brute force detection',
        enabled: true,
        priority: 150,
        conditions: {
            alertType: ['multiple_failed_logins', 'brute_force'],
            count: 3,
            timeWindowMinutes: 15,
        },
        actions: {
            blockIP: {
                enabled: true,
                durationMinutes: 0, // Permanent
            },
            notify: {
                enabled: true,
                channels: ['email'],
            },
        },
    },
    {
        id: 'rule_005',
        name: 'After Hours Sensitive Access',
        description: 'Alert on sensitive data access outside business hours',
        enabled: true,
        priority: 80,
        conditions: {
            alertType: 'after_hours_sensitive_access',
            severity: 'high',
        },
        actions: {
            notify: {
                enabled: true,
                channels: ['email'],
            },
        },
    },
    {
        id: 'rule_006',
        name: 'Multiple IPs',
        description: 'Alert on access from multiple IPs in short time',
        enabled: true,
        priority: 70,
        conditions: {
            alertType: 'multiple_ips',
            count: 2,
            timeWindowMinutes: 60,
        },
        actions: {
            notify: {
                enabled: true,
                channels: ['email'],
            },
        },
    },
    {
        id: 'rule_007',
        name: 'Abnormal Volume',
        description: 'Block on abnormal request volume',
        enabled: true,
        priority: 120,
        conditions: {
            alertType: 'abnormal_volume',
            severity: ['high', 'critical'],
        },
        actions: {
            blockUser: {
                enabled: true,
                durationMinutes: 30,
            },
            notify: {
                enabled: true,
                channels: ['email'],
            },
        },
    },
];

/**
 * Validate a threat rule
 */
export function validateRule(rule: ThreatRule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!rule.id || !rule.name) {
        errors.push('Rule must have id and name');
    }

    if (rule.priority < 0 || rule.priority > 1000) {
        errors.push('Priority must be between 0 and 1000');
    }

    if (!rule.conditions || Object.keys(rule.conditions).length === 0) {
        errors.push('Rule must have at least one condition');
    }

    if (!rule.actions || Object.keys(rule.actions).length === 0) {
        errors.push('Rule must have at least one action');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Check if a rule matches given conditions
 */
export function ruleMatches(
    rule: ThreatRule,
    alert: {
        alertType: string;
        severity: string;
        metadata?: Record<string, any>;
    }
): boolean {
    if (!rule.enabled) {
        return false;
    }

    // Check alert type
    if (rule.conditions.alertType) {
        const types = Array.isArray(rule.conditions.alertType)
            ? rule.conditions.alertType
            : [rule.conditions.alertType];

        if (!types.includes(alert.alertType)) {
            return false;
        }
    }

    // Check severity
    if (rule.conditions.severity) {
        const severities = Array.isArray(rule.conditions.severity)
            ? rule.conditions.severity
            : [rule.conditions.severity];

        if (!severities.includes(alert.severity)) {
            return false;
        }
    }

    // Check metadata conditions
    if (rule.conditions.metadata && alert.metadata) {
        for (const [key, value] of Object.entries(rule.conditions.metadata)) {
            if (alert.metadata[key] !== value) {
                return false;
            }
        }
    }

    return true;
}
