import { Test, TestingModule } from '@nestjs/testing';
import { AlertService } from './alert.service';
import { PrismaService } from '@/core/database/prisma.service';

describe('AlertService', () => {
    let service: AlertService;
    let prisma: PrismaService;

    const mockPrismaService = {
        securityAlert: {
            create: jest.fn(),
            update: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AlertService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<AlertService>(AlertService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createAlert', () => {
        it('deve criar alerta com sucesso', async () => {
            const input = {
                userId: 'user-123',
                alertType: 'unusual_location',
                severity: 'high' as const,
                description: 'Acesso de localização incomum',
            };

            const mockAlert = {
                id: 'alert-123',
                ...input,
                acknowledged: false,
                resolved: false,
                createdAt: new Date(),
            };

            mockPrismaService.securityAlert.create.mockResolvedValue(mockAlert);

            const result = await service.createAlert(input);

            expect(result).toEqual(mockAlert);
            expect(mockPrismaService.securityAlert.create).toHaveBeenCalled();
        });
    });

    describe('acknowledgeAlert', () => {
        it('deve reconhecer alerta', async () => {
            const alertId = 'alert-123';
            const acknowledgedBy = 'admin-123';

            const mockAlert = {
                id: alertId,
                acknowledged: true,
                acknowledgedBy,
                acknowledgedAt: new Date(),
            };

            mockPrismaService.securityAlert.update.mockResolvedValue(mockAlert);

            const result = await service.acknowledgeAlert(alertId, acknowledgedBy);

            expect(result.acknowledged).toBe(true);
            expect(mockPrismaService.securityAlert.update).toHaveBeenCalledWith({
                where: { id: alertId },
                data: {
                    acknowledged: true,
                    acknowledgedBy,
                    acknowledgedAt: expect.any(Date),
                },
            });
        });
    });

    describe('resolveAlert', () => {
        it('deve resolver alerta', async () => {
            const alertId = 'alert-123';
            const resolvedBy = 'admin-123';
            const resolution = 'Falso positivo';

            mockPrismaService.securityAlert.update.mockResolvedValue({
                id: alertId,
                resolved: true,
            });

            await service.resolveAlert(alertId, resolvedBy, resolution);

            expect(mockPrismaService.securityAlert.update).toHaveBeenCalledWith({
                where: { id: alertId },
                data: {
                    resolved: true,
                    resolvedBy,
                    resolvedAt: expect.any(Date),
                    resolution,
                },
            });
        });
    });

    describe('getActiveAlerts', () => {
        it('deve retornar apenas alertas não resolvidos', async () => {
            const userId = 'user-123';

            const mockAlerts = [
                { id: 'alert-1', resolved: false },
                { id: 'alert-2', resolved: false },
            ];

            mockPrismaService.securityAlert.findMany.mockResolvedValue(mockAlerts);

            const result = await service.getActiveAlerts(userId);

            expect(result).toHaveLength(2);
            expect(mockPrismaService.securityAlert.findMany).toHaveBeenCalledWith({
                where: {
                    userId,
                    resolved: false,
                },
                orderBy: { createdAt: 'desc' },
            });
        });
    });

    describe('createMultipleFailedLoginsAlert', () => {
        it('deve criar alerta de múltiplas tentativas', async () => {
            const userId = 'user-123';
            const attempts = 5;
            const ipAddress = '192.168.1.100';

            mockPrismaService.securityAlert.create.mockResolvedValue({
                id: 'alert-123',
                alertType: 'multiple_failed_logins',
            });

            const result = await service.createMultipleFailedLoginsAlert(
                userId,
                attempts,
                ipAddress
            );

            expect(result.alertType).toBe('multiple_failed_logins');
            expect(mockPrismaService.securityAlert.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    userId,
                    alertType: 'multiple_failed_logins',
                    severity: 'high',
                }),
            });
        });
    });

    describe('createUnusualLocationAlert', () => {
        it('deve criar alerta de localização incomum', async () => {
            const userId = 'user-123';
            const location = { country: 'US', city: 'New York' };

            mockPrismaService.securityAlert.create.mockResolvedValue({
                id: 'alert-123',
                alertType: 'unusual_location',
            });

            const result = await service.createUnusualLocationAlert(userId, location);

            expect(result.alertType).toBe('unusual_location');
        });
    });

    describe('createVpnDetectedAlert', () => {
        it('deve criar alerta de VPN detectada', async () => {
            const userId = 'user-123';
            const ipAddress = '192.168.1.100';

            mockPrismaService.securityAlert.create.mockResolvedValue({
                id: 'alert-123',
                alertType: 'vpn_detected',
            });

            const result = await service.createVpnDetectedAlert(userId, ipAddress);

            expect(result.alertType).toBe('vpn_detected');
            expect(mockPrismaService.securityAlert.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    severity: 'medium',
                }),
            });
        });
    });

    describe('listAlerts', () => {
        it('deve listar alertas com filtros', async () => {
            const filters = {
                userId: 'user-123',
                severity: 'high' as const,
                acknowledged: false,
            };

            mockPrismaService.securityAlert.findMany.mockResolvedValue([
                { id: 'alert-1', severity: 'high', acknowledged: false },
            ]);

            const result = await service.listAlerts(filters);

            expect(result).toHaveLength(1);
            expect(mockPrismaService.securityAlert.findMany).toHaveBeenCalledWith({
                where: filters,
                orderBy: { createdAt: 'desc' },
            });
        });
    });

    describe('dismissFalsePositive', () => {
        it('deve descartar falso positivo', async () => {
            const alertId = 'alert-123';
            const dismissedBy = 'admin-123';

            mockPrismaService.securityAlert.update.mockResolvedValue({
                id: alertId,
                resolved: true,
                resolution: 'Falso positivo',
            });

            await service.dismissFalsePositive(alertId, dismissedBy);

            expect(mockPrismaService.securityAlert.update).toHaveBeenCalledWith({
                where: { id: alertId },
                data: expect.objectContaining({
                    resolved: true,
                    resolution: 'Falso positivo',
                }),
            });
        });
    });
});
