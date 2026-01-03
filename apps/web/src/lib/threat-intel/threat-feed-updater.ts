/**
 * Threat Feed Updater Cron Job
 * 
 * Periodically update threat intelligence feeds
 */

import { threatFeedAggregator } from './threat-feed-aggregator';
import { logger } from '@/lib/observability';
import { getPrismaClient } from '@/lib/prisma';

/**
 * Update threat feeds
 */
export async function updateThreatFeeds(): Promise<void> {
    try {
        logger.info('Starting threat feed update');

        // Update blocklist from database
        await syncBlocklistFromDatabase();

        // Cleanup old entries
        await cleanupExpiredBlocks();

        logger.info('Threat feed update completed');
    } catch (error) {
        logger.error('Failed to update threat feeds', error as Error);
    }
}

/**
 * Sync blocklist from database
 */
async function syncBlocklistFromDatabase(): Promise<void> {
    const prisma = await getPrismaClient();
    if (!prisma) return;

    // Get all blocked IPs from security alerts
    const blockedIPs = await prisma.securityAlert.findMany({
        where: {
            alertType: 'ip_blocked',
            acknowledged: false,
        },
        select: {
            ipAddress: true,
        },
    });

    for (const alert of blockedIPs) {
        if (alert.ipAddress) {
            await threatFeedAggregator.blockIP(alert.ipAddress);
        }
    }
}

/**
 * Cleanup expired blocks
 */
async function cleanupExpiredBlocks(): Promise<void> {
    const prisma = await getPrismaClient();
    if (!prisma) return;

    // Remove blocks older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await prisma.securityAlert.updateMany({
        where: {
            alertType: 'ip_blocked',
            createdAt: {
                lt: thirtyDaysAgo,
            },
        },
        data: {
            acknowledged: true,
        },
    });
}

/**
 * Run threat feed update on schedule
 */
export function startThreatFeedUpdater(): void {
    const updateInterval = parseInt(
        process.env.THREAT_INTEL_UPDATE_INTERVAL || '3600000',
        10
    ); // Default: 1 hour

    // Initial update
    updateThreatFeeds();

    // Schedule periodic updates
    setInterval(() => {
        updateThreatFeeds();
    }, updateInterval);

    logger.info(`Threat feed updater started (interval: ${updateInterval}ms)`);
}

/**
 * USAGE:
 * 
 * In your application startup:
 * 
 * import { startThreatFeedUpdater } from '@/lib/threat-intel/threat-feed-updater';
 * 
 * startThreatFeedUpdater();
 */
