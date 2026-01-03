/**
 * Threat Intelligence Feed Aggregator
 * 
 * Integrate with multiple threat intelligence sources
 */

import axios from 'axios';
import NodeCache from 'node-cache';
import { logger } from '@/lib/observability';

export interface ThreatIntelligence {
    ip: string;
    riskScore: number; // 0-100
    isMalicious: boolean;
    categories: string[];
    lastSeen?: Date;
    reports: number;
    source: string;
}

export interface AttackPattern {
    pattern: RegExp;
    type: 'sql_injection' | 'xss' | 'path_traversal' | 'command_injection' | 'credential_stuffing';
    severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * IP Reputation Service
 */
export class IPReputationService {
    private cache: NodeCache;
    private abuseIPDBKey: string;
    private threshold: number;

    constructor() {
        // Cache for 1 hour
        this.cache = new NodeCache({ stdTTL: 3600 });
        this.abuseIPDBKey = process.env.ABUSEIPDB_API_KEY || '';
        this.threshold = parseInt(process.env.THREAT_INTEL_BLOCK_THRESHOLD || '75', 10);
    }

    /**
     * Check IP reputation
     */
    async checkIP(ip: string): Promise<ThreatIntelligence | null> {
        // Skip local/private IPs
        if (this.isPrivateIP(ip)) {
            return null;
        }

        // Check cache first
        const cached = this.cache.get<ThreatIntelligence>(ip);
        if (cached) {
            return cached;
        }

        try {
            const intel = await this.queryAbuseIPDB(ip);

            if (intel) {
                this.cache.set(ip, intel);
            }

            return intel;
        } catch (error) {
            logger.error(`Failed to check IP reputation for ${ip}`, error as Error);
            return null;
        }
    }

    /**
     * Query AbuseIPDB API
     */
    private async queryAbuseIPDB(ip: string): Promise<ThreatIntelligence | null> {
        if (!this.abuseIPDBKey) {
            return null;
        }

        try {
            const response = await axios.get('https://api.abuseipdb.com/api/v2/check', {
                params: {
                    ipAddress: ip,
                    maxAgeInDays: 90,
                    verbose: true,
                },
                headers: {
                    'Key': this.abuseIPDBKey,
                    'Accept': 'application/json',
                },
                timeout: 5000,
            });

            const data = response.data.data;

            return {
                ip,
                riskScore: data.abuseConfidenceScore,
                isMalicious: data.abuseConfidenceScore >= this.threshold,
                categories: data.usageType ? [data.usageType] : [],
                reports: data.totalReports,
                source: 'AbuseIPDB',
            };
        } catch (error) {
            logger.error(`AbuseIPDB API error for ${ip}`, error as Error);
            return null;
        }
    }

    /**
     * Check if IP is private/local
     */
    private isPrivateIP(ip: string): boolean {
        const privateRanges = [
            /^127\./,
            /^10\./,
            /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
            /^192\.168\./,
            /^::1$/,
            /^fc00:/,
            /^fe80:/,
        ];

        return privateRanges.some(range => range.test(ip));
    }

    /**
     * Should block IP based on reputation
     */
    shouldBlock(intel: ThreatIntelligence | null): boolean {
        if (!intel) return false;
        return intel.isMalicious;
    }
}

/**
 * Attack Pattern Detector
 */
export class AttackPatternDetector {
    private patterns: AttackPattern[] = [
        // SQL Injection
        {
            pattern: /(\bUNION\b.*\bSELECT\b|\bOR\b.*=.*|'.*--|\bDROP\b.*\bTABLE\b)/i,
            type: 'sql_injection',
            severity: 'critical',
        },
        {
            pattern: /(\bSELECT\b.*\bFROM\b.*\bWHERE\b|;\s*DROP\s+TABLE)/i,
            type: 'sql_injection',
            severity: 'critical',
        },
        // XSS
        {
            pattern: /<script[^>]*>.*<\/script>/i,
            type: 'xss',
            severity: 'high',
        },
        {
            pattern: /javascript:|onerror=|onload=/i,
            type: 'xss',
            severity: 'high',
        },
        // Path Traversal
        {
            pattern: /\.\.[\/\\]/,
            type: 'path_traversal',
            severity: 'high',
        },
        {
            pattern: /%2e%2e[\/\\]/i,
            type: 'path_traversal',
            severity: 'high',
        },
        // Command Injection
        {
            pattern: /[;&|`$()]/,
            type: 'command_injection',
            severity: 'critical',
        },
    ];

    /**
     * Detect attack patterns in input
     */
    detect(input: string): AttackPattern[] {
        const detected: AttackPattern[] = [];

        for (const pattern of this.patterns) {
            if (pattern.pattern.test(input)) {
                detected.push(pattern);
            }
        }

        return detected;
    }

    /**
     * Check if input contains malicious patterns
     */
    isMalicious(input: string): boolean {
        return this.detect(input).length > 0;
    }

    /**
     * Get highest severity from detected patterns
     */
    getHighestSeverity(patterns: AttackPattern[]): 'low' | 'medium' | 'high' | 'critical' | null {
        if (patterns.length === 0) return null;

        const severityOrder = ['low', 'medium', 'high', 'critical'];
        const severities = patterns.map(p => p.severity);

        return severities.reduce((highest, current) => {
            return severityOrder.indexOf(current) > severityOrder.indexOf(highest)
                ? current
                : highest;
        }) as 'low' | 'medium' | 'high' | 'critical';
    }
}

/**
 * Threat Feed Aggregator
 */
export class ThreatFeedAggregator {
    private ipReputationService: IPReputationService;
    private attackPatternDetector: AttackPatternDetector;
    private blocklist: Set<string> = new Set();

    constructor() {
        this.ipReputationService = new IPReputationService();
        this.attackPatternDetector = new AttackPatternDetector();
        this.loadBlocklist();
    }

    /**
     * Load blocklist from database or cache
     */
    private async loadBlocklist() {
        // TODO: Load from database
        // For now, using in-memory set
    }

    /**
     * Check if IP should be blocked
     */
    async shouldBlockIP(ip: string): Promise<{
        shouldBlock: boolean;
        reason?: string;
        riskScore?: number;
    }> {
        // Check manual blocklist first
        if (this.blocklist.has(ip)) {
            return {
                shouldBlock: true,
                reason: 'IP in manual blocklist',
            };
        }

        // Check reputation
        const intel = await this.ipReputationService.checkIP(ip);

        if (intel && this.ipReputationService.shouldBlock(intel)) {
            return {
                shouldBlock: true,
                reason: `High risk score: ${intel.riskScore}`,
                riskScore: intel.riskScore,
            };
        }

        return { shouldBlock: false };
    }

    /**
     * Check request for attack patterns
     */
    checkRequest(request: {
        url: string;
        body?: any;
        headers?: Record<string, string>;
    }): {
        isMalicious: boolean;
        patterns: AttackPattern[];
        severity: 'low' | 'medium' | 'high' | 'critical' | null;
    } {
        const inputs: string[] = [
            request.url,
        ];

        if (request.body) {
            inputs.push(JSON.stringify(request.body));
        }

        if (request.headers) {
            inputs.push(JSON.stringify(request.headers));
        }

        const allPatterns: AttackPattern[] = [];

        for (const input of inputs) {
            const patterns = this.attackPatternDetector.detect(input);
            allPatterns.push(...patterns);
        }

        return {
            isMalicious: allPatterns.length > 0,
            patterns: allPatterns,
            severity: this.attackPatternDetector.getHighestSeverity(allPatterns),
        };
    }

    /**
     * Add IP to blocklist
     */
    async blockIP(ip: string): Promise<void> {
        this.blocklist.add(ip);
        // TODO: Persist to database
        logger.info(`IP added to blocklist: ${ip}`);
    }

    /**
     * Remove IP from blocklist
     */
    async unblockIP(ip: string): Promise<void> {
        this.blocklist.delete(ip);
        // TODO: Remove from database
        logger.info(`IP removed from blocklist: ${ip}`);
    }
}

export const threatFeedAggregator = new ThreatFeedAggregator();

/**
 * USAGE:
 * 
 * import { threatFeedAggregator } from '@/lib/threat-intel/threat-feed-aggregator';
 * 
 * // Check IP reputation
 * const ipCheck = await threatFeedAggregator.shouldBlockIP('1.2.3.4');
 * if (ipCheck.shouldBlock) {
 *   return NextResponse.json({ error: 'Blocked' }, { status: 403 });
 * }
 * 
 * // Check for attack patterns
 * const requestCheck = threatFeedAggregator.checkRequest({
 *   url: req.url,
 *   body: await req.json(),
 * });
 * 
 * if (requestCheck.isMalicious) {
 *   logger.warn('Attack detected', { patterns: requestCheck.patterns });
 *   return NextResponse.json({ error: 'Malicious request' }, { status: 400 });
 * }
 */
