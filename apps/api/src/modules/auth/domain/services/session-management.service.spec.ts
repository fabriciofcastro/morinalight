import { Test, TestingModule } from '@nestjs/testing';
import { SessionManagementService } from './session-management.service';
import { PrismaService } from '@/core/database/prisma.service';

describe('SessionManagementService', () => {
    let service: SessionManagementService;
    let prisma: PrismaService;

    const mockPrismaService = {
        userSession: {
            create: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            updateMany: jest.fn(),
            deleteMany: jest.fn(),
            count: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SessionManagementService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<SessionManagementService>(SessionManagementService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createSession', () => {
        it('deve criar sessão com sucesso', async () => {
            const input = {
                userId: 'user-123',
                token: 'token-123',
                ipAddress: '192.168.1.100',
                userAgent: 'Mozilla/5.0',
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            };

            const mockSession = {
                id: 'session-123',
                ...input,
                isActive: true,
                lastActivity: new Date(),
                createdAt: new Date(),
            };

            mockPrismaService.userSession.create.mockResolvedValue(mockSession);

            const result = await service.createSession(input);

            expect(result).toEqual(mockSession);
            expect(mockPrismaService.userSession.create).toHaveBeenCalled();
        });
    });

    describe('validateSession', () => {
        it('deve validar sessão ativa', async () => {
            const token = 'token-123';

            const mockSession = {
                id: 'session-123',
                token,
                isActive: true,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            };

            mockPrismaService.userSession.findUnique.mockResolvedValue(mockSession);

            const result = await service.validateSession(token);

            expect(result).toEqual(mockSession);
        });

        it('deve retornar null para sessão expirada', async () => {
            const token = 'token-123';

            const mockSession = {
                id: 'session-123',
                token,
                isActive: true,
                expiresAt: new Date(Date.now() - 1000), // Expirada
            };

            mockPrismaService.userSession.findUnique.mockResolvedValue(mockSession);

            const result = await service.validateSession(token);

            expect(result).toBeNull();
        });

        it('deve retornar null para sessão inativa', async () => {
            const token = 'token-123';

            const mockSession = {
                id: 'session-123',
                token,
                isActive: false,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            };

            mockPrismaService.userSession.findUnique.mockResolvedValue(mockSession);

            const result = await service.validateSession(token);

            expect(result).toBeNull();
        });
    });

    describe('revokeSession', () => {
        it('deve revogar sessão', async () => {
            const sessionId = 'session-123';
            const revokedBy = 'admin-123';

            mockPrismaService.userSession.update.mockResolvedValue({
                id: sessionId,
                isActive: false,
            });

            await service.revokeSession(sessionId, revokedBy);

            expect(mockPrismaService.userSession.update).toHaveBeenCalledWith({
                where: { id: sessionId },
                data: {
                    isActive: false,
                    revokedBy,
                    revokedAt: expect.any(Date),
                },
            });
        });
    });

    describe('revokeAllUserSessions', () => {
        it('deve revogar todas as sessões do usuário', async () => {
            const userId = 'user-123';
            const revokedBy = 'admin-123';

            mockPrismaService.userSession.updateMany.mockResolvedValue({ count: 3 });

            const result = await service.revokeAllUserSessions(userId, revokedBy);

            expect(result).toBe(3);
            expect(mockPrismaService.userSession.updateMany).toHaveBeenCalledWith({
                where: {
                    userId,
                    isActive: true,
                },
                data: {
                    isActive: false,
                    revokedBy,
                    revokedAt: expect.any(Date),
                },
            });
        });
    });

    describe('getActiveSessions', () => {
        it('deve retornar sessões ativas do usuário', async () => {
            const userId = 'user-123';

            const mockSessions = [
                { id: 'session-1', isActive: true },
                { id: 'session-2', isActive: true },
            ];

            mockPrismaService.userSession.findMany.mockResolvedValue(mockSessions);

            const result = await service.getActiveSessions(userId);

            expect(result).toHaveLength(2);
            expect(mockPrismaService.userSession.findMany).toHaveBeenCalledWith({
                where: {
                    userId,
                    isActive: true,
                    expiresAt: { gt: expect.any(Date) },
                },
                orderBy: { lastActivity: 'desc' },
            });
        });
    });

    describe('updateSessionActivity', () => {
        it('deve atualizar última atividade', async () => {
            const sessionId = 'session-123';

            mockPrismaService.userSession.update.mockResolvedValue({
                id: sessionId,
                lastActivity: new Date(),
            });

            await service.updateSessionActivity(sessionId);

            expect(mockPrismaService.userSession.update).toHaveBeenCalledWith({
                where: { id: sessionId },
                data: {
                    lastActivity: expect.any(Date),
                },
            });
        });
    });

    describe('cleanupExpiredSessions', () => {
        it('deve limpar sessões expiradas', async () => {
            mockPrismaService.userSession.deleteMany.mockResolvedValue({ count: 5 });

            const result = await service.cleanupExpiredSessions();

            expect(result).toBe(5);
            expect(mockPrismaService.userSession.deleteMany).toHaveBeenCalledWith({
                where: {
                    OR: [
                        { expiresAt: { lt: expect.any(Date) } },
                        { isActive: false },
                    ],
                },
            });
        });
    });

    describe('detectSimultaneousSessions', () => {
        it('deve detectar sessões simultâneas de locais diferentes', async () => {
            const userId = 'user-123';

            const mockSessions = [
                {
                    id: 'session-1',
                    country: 'BR',
                    city: 'São Paulo',
                    ipAddress: '192.168.1.100',
                    lastActivity: new Date(),
                },
                {
                    id: 'session-2',
                    country: 'US',
                    city: 'New York',
                    ipAddress: '10.0.0.1',
                    lastActivity: new Date(),
                },
            ];

            mockPrismaService.userSession.findMany.mockResolvedValue(mockSessions);

            const result = await service.detectSimultaneousSessions(userId);

            expect(result.hasSuspiciousActivity).toBe(true);
            expect(result.sessions).toHaveLength(2);
        });

        it('deve não detectar atividade suspeita para sessões do mesmo local', async () => {
            const userId = 'user-123';

            const mockSessions = [
                {
                    id: 'session-1',
                    country: 'BR',
                    city: 'São Paulo',
                    ipAddress: '192.168.1.100',
                    lastActivity: new Date(),
                },
            ];

            mockPrismaService.userSession.findMany.mockResolvedValue(mockSessions);

            const result = await service.detectSimultaneousSessions(userId);

            expect(result.hasSuspiciousActivity).toBe(false);
        });
    });

    describe('countActiveSessions', () => {
        it('deve contar sessões ativas', async () => {
            const userId = 'user-123';

            mockPrismaService.userSession.count.mockResolvedValue(3);

            const result = await service.countActiveSessions(userId);

            expect(result).toBe(3);
        });
    });

    describe('renewSession', () => {
        it('deve renovar sessão', async () => {
            const sessionId = 'session-123';
            const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

            mockPrismaService.userSession.update.mockResolvedValue({
                id: sessionId,
                expiresAt: newExpiresAt,
            });

            await service.renewSession(sessionId, newExpiresAt);

            expect(mockPrismaService.userSession.update).toHaveBeenCalledWith({
                where: { id: sessionId },
                data: {
                    expiresAt: newExpiresAt,
                    lastActivity: expect.any(Date),
                },
            });
        });
    });
});
