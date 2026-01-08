// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { passwordResetService } from '../lib/auth/password-reset';

// Mock DB Client
const mockPrisma = {
    user: {
        findUnique: vi.fn(),
        update: vi.fn(),
    },
    passwordResetToken: {
        create: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        deleteMany: vi.fn(),
        count: vi.fn(),
    },
    $transaction: vi.fn((ops) => Promise.all(ops)),
};

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
    getPrismaClient: vi.fn().mockResolvedValue(mockPrisma),
}));

vi.mock('@/lib/email/resend', () => ({
    emailService: {
        send: vi.fn(),
    },
}));

vi.mock('@/lib/audit/audit-service', () => ({
    auditService: {
        log: vi.fn(),
        logFailure: vi.fn(),
        logSuccess: vi.fn(),
    },
}));

vi.mock('bcryptjs', () => ({
    hash: vi.fn().mockResolvedValue('hashed_password'),
    compare: vi.fn().mockResolvedValue(true),
}));

describe('Password Recovery Flow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('requestReset', () => {
        it('should generate token and send email for valid user', async () => {
            const email = 'test@example.com';
            mockPrisma.user.findUnique.mockResolvedValue({ id: 'user1', email });
            mockPrisma.passwordResetToken.count.mockResolvedValue(0);

            await passwordResetService.requestReset(email);

            expect(mockPrisma.passwordResetToken.create).toHaveBeenCalled();
            // Verify expiry is set
            const createArgs = vi.mocked(mockPrisma.passwordResetToken.create).mock.calls[0]![0];
            expect(createArgs.data.expiresAt).toBeDefined();
        });

        it('should rate limit frequent requests', async () => {
            const email = 'test@example.com';
            mockPrisma.user.findUnique.mockResolvedValue({ id: 'user1', email });
            mockPrisma.passwordResetToken.count.mockResolvedValue(3); // Hit limit

            await passwordResetService.requestReset(email);

            // Should log failure and strictly speaking return true (to mask) but internally behave differently
            expect(mockPrisma.passwordResetToken.create).not.toHaveBeenCalled();
        });
    });

    describe('completeReset', () => {
        it('should reset password with valid token', async () => {
            const token = 'valid-token';
            const newPassword = 'new-password';

            mockPrisma.passwordResetToken.findUnique.mockResolvedValue({
                id: 'token1',
                userId: 'user1',
                expiresAt: new Date(Date.now() + 3600000), // Valid
                used: false,
                user: { email: 'test@example.com' }
            });

            const result = await passwordResetService.completeReset(token, newPassword);

            expect(result.success).toBe(true);
            expect(mockPrisma.user.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 'user1' },
                    data: expect.objectContaining({
                        passwordHash: 'hashed_password',
                        tokenVersion: { increment: 1 },
                    }),
                })
            );
        });

        it('should reject expired tokens', async () => {
            const token = 'expired-token';
            mockPrisma.passwordResetToken.findUnique.mockResolvedValue({
                id: 'token1',
                userId: 'user1',
                expiresAt: new Date(Date.now() - 3600000), // Expired
                used: false,
            });

            const result = await passwordResetService.completeReset(token, 'pass');
            expect(result.success).toBe(false);
            expect(result.error).toMatch(/expirou/i);
        });
    });
});
