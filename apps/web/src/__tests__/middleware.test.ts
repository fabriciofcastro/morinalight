import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { authMiddleware, rateLimitMiddleware } from '../lib/middleware/security-middleware';

describe('Security Middleware', () => {
    describe('authMiddleware', () => {
        it('should allow requests with valid JWT', async () => {
            const mockRequest = new NextRequest('http://localhost:3000/api/test', {
                headers: {
                    'Authorization': 'Bearer valid-token',
                },
            });

            // Mock JWT verification
            vi.mock('../lib/auth/jwt', () => ({
                verifyToken: vi.fn().mockResolvedValue({ userId: '123' }),
            }));

            const result = await authMiddleware(mockRequest, {});
            expect(result).toBeNull(); // No response = middleware passed
        });

        it('should reject requests without token', async () => {
            const mockRequest = new NextRequest('http://localhost:3000/api/test');

            const result = await authMiddleware(mockRequest, {});
            expect(result).toBeTruthy();
            expect(result?.status).toBe(401);
        });
    });

    describe('rateLimitMiddleware', () => {
        beforeEach(() => {
            vi.clearAllMocks();
        });

        it('should allow requests within rate limit', async () => {
            const mockRequest = new NextRequest('http://localhost:3000/api/test', {
                headers: {
                    'x-forwarded-for': '192.168.1.1',
                },
            });

            const result = await rateLimitMiddleware(mockRequest, {});
            expect(result).toBeNull();
        });

        it('should block requests exceeding rate limit', async () => {
            const mockRequest = new NextRequest('http://localhost:3000/api/test', {
                headers: {
                    'x-forwarded-for': '192.168.1.1',
                },
            });

            // Simulate multiple requests
            for (let i = 0; i < 101; i++) {
                await rateLimitMiddleware(mockRequest, {});
            }

            const result = await rateLimitMiddleware(mockRequest, {});
            expect(result).toBeTruthy();
            expect(result?.status).toBe(429);
        });
    });
});
