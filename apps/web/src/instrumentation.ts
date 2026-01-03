
export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { setupAuditSubscribers } = await import('@/lib/events/audit-subscriber');
        const { startThreatFeedUpdater } = await import('@/lib/threat-intel/threat-feed-updater');
        setupAuditSubscribers();
        startThreatFeedUpdater();
    }
}
