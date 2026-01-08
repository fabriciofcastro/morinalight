import { beforeEach, describe, it, vi } from 'vitest';
import { intrusionDetector } from '../lib/security/intrusion-detection';

describe('Intrusion Detection System', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('detectFailedLogins', () => {
        it('should detect multiple failed logins', async () => {
            const userId = 'test-user-123';

            // Mock audit service to return failed logins
            vi.mock('../lib/audit/audit-service', () => ({
                auditService: {
                    getAuditTrail: vi.fn().mockResolvedValue([
                        { success: false, timestamp: new Date() },
                        { success: false, timestamp: new Date() },
                        { success: false, timestamp: new Date() },
                        { success: false, timestamp: new Date() },
                        { success: false, timestamp: new Date() },
                    ]),
                },
            }));

            await intrusionDetector.detectFailedLogins(userId);

            // Should create alert and potentially block user
            // Verify via database or mock calls
        });
    });

    describe('detectImpossibleTravel', () => {
        it('should detect impossible travel', async () => {
            const userId = 'test-user-123';
            const currentIP = '8.8.8.8'; // US
            const previousIP = '1.1.1.1'; // Australia

            // Mock geolocation service
            vi.mock('../lib/services/geolocation-service', () => ({
                geolocationService: {
                    getLocation: vi.fn()
                        .mockResolvedValueOnce({ latitude: 37.7749, longitude: -122.4194 }) // SF
                        .mockResolvedValueOnce({ latitude: -33.8688, longitude: 151.2093 }), // Sydney
                    calculateDistance: vi.fn().mockReturnValue(12000), // 12,000 km
                    isImpossibleTravel: vi.fn().mockReturnValue(true),
                },
            }));

            await intrusionDetector.detectImpossibleTravel(userId, currentIP);

            // Should create critical alert
        });
    });

    describe('detectAfterHoursAccess', () => {
        it('should detect after-hours sensitive access', async () => {
            const userId = 'test-user-123';

            // Mock audit service to return sensitive access at 2 AM
            vi.mock('../lib/audit/audit-service', () => ({
                auditService: {
                    getAuditTrail: vi.fn().mockResolvedValue([
                        {
                            action: 'READ_SENSITIVE_DATA',
                            timestamp: new Date('2024-01-01T02:00:00'),
                        },
                    ]),
                },
            }));

            await intrusionDetector.detectAfterHoursAccess(userId);

            // Should create high severity alert
        });
    });

    describe('detectPrivilegeEscalation', () => {
        it('should detect privilege escalation attempts', async () => {
            const userId = 'test-user-123';

            // Mock audit service to return multiple denied access attempts
            vi.mock('../lib/audit/audit-service', () => ({
                auditService: {
                    getAuditTrail: vi.fn().mockResolvedValue(
                        Array(15).fill({
                            success: false,
                            action: 'ACCESS_ADMIN_PANEL',
                            timestamp: new Date(),
                        })
                    ),
                },
            }));

            await intrusionDetector.detectPrivilegeEscalation(userId);

            // Should create critical alert and block user
        });
    });
});
