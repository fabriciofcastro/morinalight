import { Test, TestingModule } from '@nestjs/testing';
import { BehavioralAnalysisService } from './behavioral-analysis.service';
import { PrismaService } from '@/core/database/prisma.service';

describe('BehavioralAnalysisService', () => {
    let service: BehavioralAnalysisService;
    let prisma: PrismaService;

    const mockPrismaService = {
        userBehavioralProfile: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        accessDecisionLog: {
            findMany: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BehavioralAnalysisService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<BehavioralAnalysisService>(BehavioralAnalysisService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('detectAnomalies', () => {
        it('deve detectar horário incomum', async () => {
            const userId = 'user-123';
            const context = {
                userId,
                ipAddress: '192.168.1.100',
                timestamp: new Date('2024-01-15T02:00:00Z'), // 2h da manhã
            };

            const mockProfile = {
                userId,
                usualAccessHours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17], // Horário comercial
                usualAccessDays: [1, 2, 3, 4, 5],
                usualCountries: ['BR'],
                usualCities: ['São Paulo'],
                knownDeviceIds: [],
                usualResources: [],
                baselineRiskScore: 0,
                currentRiskScore: 0,
            };

            mockPrismaService.userBehavioralProfile.findUnique.mockResolvedValue(mockProfile);
            mockPrismaService.accessDecisionLog.findMany.mockResolvedValue([]);

            const anomalies = await service.detectAnomalies(userId, context);

            expect(anomalies).toHaveLength(1);
            expect(anomalies[0].type).toBe('unusual_time');
            expect(anomalies[0].severity).toBe('medium');
        });

        it('deve detectar país incomum', async () => {
            const userId = 'user-123';
            const context = {
                userId,
                ipAddress: '192.168.1.100',
                country: 'US',
                timestamp: new Date('2024-01-15T10:00:00Z'),
            };

            const mockProfile = {
                userId,
                usualAccessHours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                usualAccessDays: [1, 2, 3, 4, 5],
                usualCountries: ['BR'], // Apenas Brasil
                usualCities: ['São Paulo'],
                knownDeviceIds: [],
                usualResources: [],
                baselineRiskScore: 0,
                currentRiskScore: 0,
            };

            mockPrismaService.userBehavioralProfile.findUnique.mockResolvedValue(mockProfile);
            mockPrismaService.accessDecisionLog.findMany.mockResolvedValue([]);

            const anomalies = await service.detectAnomalies(userId, context);

            const countryAnomaly = anomalies.find(a => a.type === 'unusual_location');
            expect(countryAnomaly).toBeDefined();
            expect(countryAnomaly?.severity).toBe('high');
        });

        it('deve detectar dispositivo desconhecido', async () => {
            const userId = 'user-123';
            const context = {
                userId,
                ipAddress: '192.168.1.100',
                deviceId: 'new-device-123',
                timestamp: new Date('2024-01-15T10:00:00Z'),
            };

            const mockProfile = {
                userId,
                usualAccessHours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                usualAccessDays: [1, 2, 3, 4, 5],
                usualCountries: ['BR'],
                usualCities: ['São Paulo'],
                knownDeviceIds: ['device-1', 'device-2'],
                usualResources: [],
                baselineRiskScore: 0,
                currentRiskScore: 0,
            };

            mockPrismaService.userBehavioralProfile.findUnique.mockResolvedValue(mockProfile);
            mockPrismaService.accessDecisionLog.findMany.mockResolvedValue([]);

            const anomalies = await service.detectAnomalies(userId, context);

            const deviceAnomaly = anomalies.find(a => a.type === 'unknown_device');
            expect(deviceAnomaly).toBeDefined();
            expect(deviceAnomaly?.severity).toBe('high');
        });

        it('não deve detectar anomalias em acesso normal', async () => {
            const userId = 'user-123';
            const context = {
                userId,
                ipAddress: '192.168.1.100',
                country: 'BR',
                city: 'São Paulo',
                deviceId: 'device-1',
                timestamp: new Date('2024-01-15T10:00:00Z'), // Segunda, 10h
            };

            const mockProfile = {
                userId,
                usualAccessHours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                usualAccessDays: [1, 2, 3, 4, 5],
                usualCountries: ['BR'],
                usualCities: ['São Paulo'],
                knownDeviceIds: ['device-1'],
                usualResources: [],
                baselineRiskScore: 0,
                currentRiskScore: 0,
            };

            mockPrismaService.userBehavioralProfile.findUnique.mockResolvedValue(mockProfile);
            mockPrismaService.accessDecisionLog.findMany.mockResolvedValue([]);

            const anomalies = await service.detectAnomalies(userId, context);

            expect(anomalies).toHaveLength(0);
        });
    });

    describe('calculateRiskScore', () => {
        it('deve calcular score baixo para acesso normal', async () => {
            const userId = 'user-123';
            const context = {
                userId,
                ipAddress: '192.168.1.100',
                country: 'BR',
                timestamp: new Date('2024-01-15T10:00:00Z'),
            };

            const mockProfile = {
                userId,
                usualAccessHours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                usualAccessDays: [1, 2, 3, 4, 5],
                usualCountries: ['BR'],
                usualCities: [],
                knownDeviceIds: [],
                usualResources: [],
                baselineRiskScore: 0,
                currentRiskScore: 0,
            };

            mockPrismaService.userBehavioralProfile.findUnique.mockResolvedValue(mockProfile);
            mockPrismaService.accessDecisionLog.findMany.mockResolvedValue([]);

            const score = await service.calculateRiskScore(userId, context);

            expect(score).toBeLessThan(30);
        });

        it('deve calcular score alto para múltiplas anomalias', async () => {
            const userId = 'user-123';
            const context = {
                userId,
                ipAddress: '192.168.1.100',
                country: 'US', // País incomum
                deviceId: 'unknown-device', // Dispositivo desconhecido
                timestamp: new Date('2024-01-15T02:00:00Z'), // Horário incomum
            };

            const mockProfile = {
                userId,
                usualAccessHours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                usualAccessDays: [1, 2, 3, 4, 5],
                usualCountries: ['BR'],
                usualCities: ['São Paulo'],
                knownDeviceIds: ['device-1'],
                usualResources: [],
                baselineRiskScore: 0,
                currentRiskScore: 0,
            };

            mockPrismaService.userBehavioralProfile.findUnique.mockResolvedValue(mockProfile);
            mockPrismaService.accessDecisionLog.findMany.mockResolvedValue([]);

            const score = await service.calculateRiskScore(userId, context);

            expect(score).toBeGreaterThan(70); // Alto risco
        });

        it('deve limitar score a 100', async () => {
            const userId = 'user-123';
            const context = {
                userId,
                ipAddress: '192.168.1.100',
                timestamp: new Date(),
            };

            // Mock para retornar muitas anomalias
            jest.spyOn(service, 'detectAnomalies').mockResolvedValue([
                { type: 'test1', severity: 'high', description: 'test' },
                { type: 'test2', severity: 'high', description: 'test' },
                { type: 'test3', severity: 'high', description: 'test' },
                { type: 'test4', severity: 'high', description: 'test' },
            ]);

            const score = await service.calculateRiskScore(userId, context);

            expect(score).toBeLessThanOrEqual(100);
        });
    });

    describe('isAccessPatternNormal', () => {
        it('deve retornar true para padrão normal', async () => {
            const userId = 'user-123';
            const context = {
                userId,
                ipAddress: '192.168.1.100',
                timestamp: new Date('2024-01-15T10:00:00Z'),
            };

            jest.spyOn(service, 'detectAnomalies').mockResolvedValue([]);
            jest.spyOn(service, 'calculateRiskScore').mockResolvedValue(15);

            const result = await service.isAccessPatternNormal(userId, context);

            expect(result).toBe(true);
        });

        it('deve retornar false para anomalias de alta severidade', async () => {
            const userId = 'user-123';
            const context = {
                userId,
                ipAddress: '192.168.1.100',
                timestamp: new Date(),
            };

            jest.spyOn(service, 'detectAnomalies').mockResolvedValue([
                { type: 'test', severity: 'high', description: 'test' },
            ]);
            jest.spyOn(service, 'calculateRiskScore').mockResolvedValue(80);

            const result = await service.isAccessPatternNormal(userId, context);

            expect(result).toBe(false);
        });
    });
});
