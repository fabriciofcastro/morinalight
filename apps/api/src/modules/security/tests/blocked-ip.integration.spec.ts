import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { blockedIpService } from '../application/services/blocked-ip.service';
import { getRedisClient } from '../../../infra/cache/redis.service';
import { getPrisma } from '../../../infra/database/prisma.service';

const prisma = getPrisma();

describe('BlockedIp Integration', () => {
    const testIp = '1.1.1.1';

    beforeEach(async () => {
        await blockedIpService.unblockIp(testIp);
    });

    afterEach(async () => {
        await blockedIpService.unblockIp(testIp);
    });

    it('should block an IP and store it in both Redis and DB', async () => {
        await blockedIpService.blockIp(testIp, 'Test reason');

        // Check DB
        const dbRecord = await prisma.blockedIP.findUnique({ where: { ip: testIp } });
        expect(dbRecord).toBeTruthy();
        expect(dbRecord?.reason).toBe('Test reason');

        // Check isIpBlocked (uses Redis)
        const isBlocked = await blockedIpService.isIpBlocked(testIp);
        expect(isBlocked).toBe(true);
    });

    it('should unblock an IP and remove it from both', async () => {
        await blockedIpService.blockIp(testIp, 'To be removed');
        await blockedIpService.unblockIp(testIp);

        const isBlocked = await blockedIpService.isIpBlocked(testIp);
        expect(isBlocked).toBe(false);

        const dbRecord = await prisma.blockedIP.findUnique({ where: { ip: testIp } });
        expect(dbRecord).toBeNull();
    });

    it('should respect expiration time', async () => {
        // Block for 1 second
        const expiresAt = new Date(Date.now() + 1000);
        await blockedIpService.blockIp(testIp, 'Temporary', expiresAt);

        expect(await blockedIpService.isIpBlocked(testIp)).toBe(true);

        // Mock time forward
        vi.useFakeTimers();
        vi.setSystemTime(new Date(Date.now() + 2000));

        // Note: Redis might still have it if we don't mock redis ttl, 
        // but isIpBlocked falling back to DB check will handle expiration
        const isBlocked = await blockedIpService.isIpBlocked(testIp);
        expect(isBlocked).toBe(false);

        vi.useRealTimers();
    });
});
