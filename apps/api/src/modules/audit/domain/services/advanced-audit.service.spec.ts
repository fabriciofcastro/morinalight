import { Test, TestingModule } from '@nestjs/testing';
import { AdvancedAuditService } from './advanced-audit.service';
import { PrismaService } from '@/core/database/prisma.service';

describe('AdvancedAuditService', () => {
    let service: AdvancedAuditService;
    let prisma: PrismaService;

    const mockPrismaService = {
        accessDecisionLog: {
            create: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AdvancedAuditService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<AdvancedAuditService>(AdvancedAuditService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('logAccessDecision', () => {
        it('deve registrar decisão de acesso com sucesso', async () => {
            const input = {
                orgId: 'org-123',
                userId: 'user-123',
                action: 'read',
                subject: 'Document',
                resourceId: 'doc-123',
                effect: 'ALLOW' as const,
                ipAddress: '192.168.1.100',
                riskScore: 15,
            };

            const mockLog = {
                id: 'log-123',
                ...input,
                reason: null,
                context: null,
                userAgent: null,
                country: null,
                city: null,
                isVpn: false,
                isProxy: false,
                isTor: false,
                anomalies: [],
                createdAt: new Date(),
            };

            mockPrismaService.accessDecisionLog.create.mockResolvedValue(mockLog);

            const result = await service.logAccessDecision(input);

            expect(result).toEqual(mockLog);
            expect(mockPrismaService.accessDecisionLog.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    orgId: input.orgId,
                    userId: input.userId,
                    action: input.action,
                    subject: input.subject,
                    effect: input.effect,
                }),
            });
        });

        it('deve registrar acesso negado com razão', async () => {
            const input = {
                orgId: 'org-123',
                userId: 'user-123',
                action: 'delete',
                subject: 'Document',
                effect: 'DENY' as const,
                reason: 'Sem permissão',
                ipAddress: '192.168.1.100',
                riskScore: 50,
            };

            mockPrismaService.accessDecisionLog.create.mockResolvedValue({
                id: 'log-123',
                ...input,
            });

            await service.logAccessDecision(input);

            expect(mockPrismaService.accessDecisionLog.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    effect: 'DENY',
                    reason: 'Sem permissão',
                }),
            });
        });
    });

    describe('searchLogs', () => {
        it('deve buscar logs com filtros', async () => {
            const filters = {
                orgId: 'org-123',
                effect: 'DENY' as const,
                minRiskScore: 50,
                page: 1,
                limit: 10,
            };

            const mockLogs = [
                {
                    id: 'log-1',
                    orgId: 'org-123',
                    effect: 'DENY',
                    riskScore: 75,
                },
                {
                    id: 'log-2',
                    orgId: 'org-123',
                    effect: 'DENY',
                    riskScore: 60,
                },
            ];

            mockPrismaService.accessDecisionLog.findMany.mockResolvedValue(mockLogs);
            mockPrismaService.accessDecisionLog.count.mockResolvedValue(2);

            const result = await service.searchLogs(filters);

            expect(result.data).toEqual(mockLogs);
            expect(result.total).toBe(2);
            expect(result.page).toBe(1);
            expect(result.limit).toBe(10);
        });

        it('deve aplicar filtro de data', async () => {
            const filters = {
                orgId: 'org-123',
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-12-31'),
                page: 1,
                limit: 10,
            };

            mockPrismaService.accessDecisionLog.findMany.mockResolvedValue([]);
            mockPrismaService.accessDecisionLog.count.mockResolvedValue(0);

            await service.searchLogs(filters);

            expect(mockPrismaService.accessDecisionLog.findMany).toHaveBeenCalledWith({
                where: expect.objectContaining({
                    createdAt: {
                        gte: filters.startDate,
                        lte: filters.endDate,
                    },
                }),
                skip: 0,
                take: 10,
                orderBy: { createdAt: 'desc' },
            });
        });
    });

    describe('getComplianceReport', () => {
        it('deve gerar relatório LGPD', async () => {
            const orgId = 'org-123';
            const period = {
                start: new Date('2024-01-01'),
                end: new Date('2024-12-31'),
            };

            mockPrismaService.accessDecisionLog.findMany.mockResolvedValue([
                { id: '1', effect: 'ALLOW', riskScore: 10 },
                { id: '2', effect: 'DENY', riskScore: 80 },
            ]);

            const report = await service.getComplianceReport('LGPD', orgId, period);

            expect(report.type).toBe('LGPD');
            expect(report.period).toEqual(period);
            expect(report.totalAccesses).toBe(2);
            expect(report.deniedAccesses).toBe(1);
        });

        it('deve gerar relatório SOC2', async () => {
            const orgId = 'org-123';
            const period = {
                start: new Date('2024-01-01'),
                end: new Date('2024-12-31'),
            };

            mockPrismaService.accessDecisionLog.findMany.mockResolvedValue([]);

            const report = await service.getComplianceReport('SOC2', orgId, period);

            expect(report.type).toBe('SOC2');
        });
    });

    describe('exportLogs', () => {
        it('deve exportar logs em CSV', async () => {
            const filters = {
                orgId: 'org-123',
            };

            mockPrismaService.accessDecisionLog.findMany.mockResolvedValue([
                {
                    id: 'log-1',
                    userId: 'user-1',
                    action: 'read',
                    subject: 'Document',
                    effect: 'ALLOW',
                    createdAt: new Date('2024-01-15T10:00:00Z'),
                },
            ]);

            const csv = await service.exportLogs(filters, 'CSV');

            expect(csv).toContain('userId,action,subject,effect,createdAt');
            expect(csv).toContain('user-1');
            expect(csv).toContain('read');
        });

        it('deve exportar logs em JSON', async () => {
            const filters = {
                orgId: 'org-123',
            };

            const mockLogs = [
                {
                    id: 'log-1',
                    userId: 'user-1',
                    action: 'read',
                    subject: 'Document',
                    effect: 'ALLOW',
                },
            ];

            mockPrismaService.accessDecisionLog.findMany.mockResolvedValue(mockLogs);

            const json = await service.exportLogs(filters, 'JSON');

            expect(JSON.parse(json)).toEqual(mockLogs);
        });
    });

    describe('getSuspiciousActivity', () => {
        it('deve retornar atividades suspeitas', async () => {
            const orgId = 'org-123';

            const mockLogs = [
                {
                    id: 'log-1',
                    riskScore: 85,
                    anomalies: ['unusual_location', 'unknown_device'],
                },
                {
                    id: 'log-2',
                    riskScore: 75,
                    anomalies: ['unusual_time'],
                },
            ];

            mockPrismaService.accessDecisionLog.findMany.mockResolvedValue(mockLogs);

            const result = await service.getSuspiciousActivity(orgId);

            expect(result).toHaveLength(2);
            expect(result[0].riskScore).toBeGreaterThanOrEqual(70);
        });
    });

    describe('getFailedAttempts', () => {
        it('deve retornar tentativas falhadas agrupadas', async () => {
            const orgId = 'org-123';

            const mockLogs = [
                {
                    userId: 'user-1',
                    action: 'read',
                    subject: 'Document',
                    effect: 'DENY',
                    reason: 'Sem permissão',
                    createdAt: new Date(),
                },
                {
                    userId: 'user-1',
                    action: 'read',
                    subject: 'Document',
                    effect: 'DENY',
                    reason: 'Sem permissão',
                    createdAt: new Date(),
                },
            ];

            mockPrismaService.accessDecisionLog.findMany.mockResolvedValue(mockLogs);

            const result = await service.getFailedAttempts(orgId);

            expect(result.length).toBeGreaterThan(0);
        });
    });
});
