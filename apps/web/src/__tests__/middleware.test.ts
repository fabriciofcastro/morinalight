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

            const middleware = authMiddleware();
            const result = await middleware(mockRequest, {});
            expect(result).toBeNull(); // No response = middleware passed
        });

        it('should reject requests without token', async () => {
            const mockRequest = new NextRequest('http://localhost:3000/api/test');

            const middleware = authMiddleware();
            const result = await middleware(mockRequest, {});
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

            const middleware = rateLimitMiddleware({ maxRequests: 100, windowMs: 60000 });
            const result = await middleware(mockRequest, {});
            expect(result).toBeNull();
        });

        it('should block requests exceeding rate limit', async () => {
            const mockRequest = new NextRequest('http://localhost:3000/api/test', {
                headers: {
                    'x-forwarded-for': '192.168.1.1',
                },
            });

            // Simulate multiple requests
            const middleware = rateLimitMiddleware({ maxRequests: 100, windowMs: 60000 });
            for (let i = 0; i < 101; i++) {
                await middleware(mockRequest, {});
            }

            const result = await middleware(mockRequest, {});
            expect(result).toBeTruthy();
            expect(result?.status).toBe(429);
        });
    });
});
