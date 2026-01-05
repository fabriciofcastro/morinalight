import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuditPermissionAnomaliesUseCase } from './audit-permission-anomalies.use-case';
import type { PrismaService } from '../../../../infra/database/prisma.service';

describe('AuditPermissionAnomaliesUseCase', () => {
    let useCase: AuditPermissionAnomaliesUseCase;
    let mockPrisma: Partial<PrismaService>;

    beforeEach(() => {
        // Mock do Prisma
        mockPrisma = {
            userPermission: {
                findMany: vi.fn(),
                count: vi.fn(),
            } as any,
            positionPermission: {
                findMany: vi.fn(),
            } as any,
            sectorPermission: {
                findMany: vi.fn(),
            } as any,
            departmentPermission: {
                findMany: vi.fn(),
            } as any,
            subdepartmentPermission: {
                findMany: vi.fn(),
            } as any,
            user: {
                findMany: vi.fn(),
                count: vi.fn(),
            } as any,
            position: {
                count: vi.fn(),
            } as any,
            sector: {
                findMany: vi.fn(),
                count: vi.fn(),
            } as any,
            department: {
                count: vi.fn(),
            } as any,
            permission: {
                findMany: vi.fn(),
                count: vi.fn(),
            } as any,
            permissionAuditLog: {
                findFirst: vi.fn(),
            } as any,
        };

        useCase = new AuditPermissionAnomaliesUseCase({
            prisma: mockPrisma as PrismaService,
        });
    });

    describe('findOrphanedPermissions', () => {
        it('deve encontrar permissões de usuário órfãs', async () => {
            // Arrange
            const orgId = 'org-123';
            const actorId = 'user-123';

            vi.mocked(mockPrisma.userPermission!.findMany).mockResolvedValue([
                {
                    id: 'perm-1',
                    orgId,
                    userId: 'deleted-user',
                    permissionId: 'permission-1',
                    granted: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    createdBy: 'admin',
                    updatedBy: 'admin',
                    reason: null,
                    user: null,
                    permission: {
                        id: 'permission-1',
                        code: 'TEST_PERMISSION',
                        name: 'Test Permission',
                        description: null,
                        module: 'TEST',
                        level: 'READ',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                } as any,
            ]);

            vi.mocked(mockPrisma.positionPermission!.findMany).mockResolvedValue([]);
            vi.mocked(mockPrisma.sectorPermission!.findMany).mockResolvedValue([]);
            vi.mocked(mockPrisma.departmentPermission!.findMany).mockResolvedValue([]);
            vi.mocked(mockPrisma.subdepartmentPermission!.findMany).mockResolvedValue([]);

            // Mock outros métodos necessários
            vi.mocked(mockPrisma.user!.findMany).mockResolvedValue([]);
            vi.mocked(mockPrisma.user!.count).mockResolvedValue(0);
            vi.mocked(mockPrisma.position!.count).mockResolvedValue(0);
            vi.mocked(mockPrisma.sector!.count).mockResolvedValue(0);
            vi.mocked(mockPrisma.department!.count).mockResolvedValue(0);
            vi.mocked(mockPrisma.permission!.findMany).mockResolvedValue([]);
            vi.mocked(mockPrisma.permission!.count).mockResolvedValue(0);
            vi.mocked(mockPrisma.sector!.findMany).mockResolvedValue([]);

            // Act
            const report = await useCase.execute({
                orgId,
                actorId,
                filters: {
                    includeOrphaned: true,
                    includeConflicts: false,
                    includeExcessive: false,
                    includeHierarchy: false,
                    includeAuditGaps: false,
                    includeObsolete: false,
                    includeSoD: false,
                },
            });

            // Assert
            expect(report.orphanedPermissions).toHaveLength(1);
            expect(report.orphanedPermissions[0]).toMatchObject({
                type: 'user',
                permissionId: 'permission-1',
                entityId: 'deleted-user',
                reason: 'Usuário não existe mais no sistema',
            });
        });
    });

    describe('findPermissionConflicts', () => {
        it('deve encontrar conflitos de permissões', async () => {
            // Arrange
            const orgId = 'org-123';
            const actorId = 'user-123';

            const mockUser = {
                id: 'user-1',
                email: 'test@example.com',
                displayName: 'Test User',
                userPermissions: [
                    {
                        permissionId: 'perm-1',
                        granted: true,
                        permission: { code: 'TEST_PERM' },
                    },
                ],
                positionMemberships: [
                    {
                        positionId: 'pos-1',
                        position: {
                            permissions: [
                                {
                                    permissionId: 'perm-1',
                                    granted: false,
                                },
                            ],
                        },
                    },
                ],
            };

            vi.mocked(mockPrisma.user!.findMany).mockResolvedValue([mockUser as any]);
            vi.mocked(mockPrisma.userPermission!.findMany).mockResolvedValue([]);
            vi.mocked(mockPrisma.positionPermission!.findMany).mockResolvedValue([]);
            vi.mocked(mockPrisma.sectorPermission!.findMany).mockResolvedValue([]);
            vi.mocked(mockPrisma.departmentPermission!.findMany).mockResolvedValue([]);
            vi.mocked(mockPrisma.subdepartmentPermission!.findMany).mockResolvedValue([]);
            vi.mocked(mockPrisma.user!.count).mockResolvedValue(1);
            vi.mocked(mockPrisma.position!.count).mockResolvedValue(0);
            vi.mocked(mockPrisma.sector!.count).mockResolvedValue(0);
            vi.mocked(mockPrisma.department!.count).mockResolvedValue(0);
            vi.mocked(mockPrisma.permission!.findMany).mockResolvedValue([]);
            vi.mocked(mockPrisma.permission!.count).mockResolvedValue(0);
            vi.mocked(mockPrisma.sector!.findMany).mockResolvedValue([]);

            // Act
            const report = await useCase.execute({
                orgId,
                actorId,
                filters: {
                    includeOrphaned: false,
                    includeConflicts: true,
                    includeExcessive: false,
                    includeHierarchy: false,
                    includeAuditGaps: false,
                    includeObsolete: false,
                    includeSoD: false,
                },
            });

            // Assert
            expect(report.conflicts).toHaveLength(1);
            expect(report.conflicts[0]).toMatchObject({
                userId: 'user-1',
                permissionId: 'perm-1',
            });
            expect(report.conflicts[0].sources).toHaveLength(2);
        });
    });

    describe('calculateSummary', () => {
        it('deve calcular score de conformidade corretamente', async () => {
            // Arrange
            const orgId = 'org-123';
            const actorId = 'user-123';

            vi.mocked(mockPrisma.userPermission!.findMany).mockResolvedValue([]);
            vi.mocked(mockPrisma.positionPermission!.findMany).mockResolvedValue([]);
            vi.mocked(mockPrisma.sectorPermission!.findMany).mockResolvedValue([]);
            vi.mocked(mockPrisma.departmentPermission!.findMany).mockResolvedValue([]);
            vi.mocked(mockPrisma.subdepartmentPermission!.findMany).mockResolvedValue([]);
            vi.mocked(mockPrisma.user!.findMany).mockResolvedValue([]);
            vi.mocked(mockPrisma.sector!.findMany).mockResolvedValue([]);
            vi.mocked(mockPrisma.permission!.findMany).mockResolvedValue([]);

            vi.mocked(mockPrisma.permission!.count).mockResolvedValue(100);
            vi.mocked(mockPrisma.user!.count).mockResolvedValue(10);
            vi.mocked(mockPrisma.position!.count).mockResolvedValue(5);
            vi.mocked(mockPrisma.sector!.count).mockResolvedValue(3);
            vi.mocked(mockPrisma.department!.count).mockResolvedValue(2);

            // Act
            const report = await useCase.execute({
                orgId,
                actorId,
                filters: {},
            });

            // Assert
            expect(report.summary).toMatchObject({
                totalPermissions: 100,
                totalUsers: 10,
                totalPositions: 5,
                totalSectors: 3,
                totalDepartments: 2,
                anomaliesFound: 0,
            });
            expect(report.summary.conformityScore).toBeGreaterThanOrEqual(0);
            expect(report.summary.conformityScore).toBeLessThanOrEqual(100);
        });
    });

    describe('generateRecommendations', () => {
        it('deve gerar recomendações quando não há anomalias', async () => {
            // Arrange
            const orgId = 'org-123';
            const actorId = 'user-123';

            vi.mocked(mockPrisma.userPermission!.findMany).mockResolvedValue([]);
            vi.mocked(mockPrisma.positionPermission!.findMany).mockResolvedValue([]);
            vi.mocked(mockPrisma.sectorPermission!.findMany).mockResolvedValue([]);
            vi.mocked(mockPrisma.departmentPermission!.findMany).mockResolvedValue([]);
            vi.mocked(mockPrisma.subdepartmentPermission!.findMany).mockResolvedValue([]);
            vi.mocked(mockPrisma.user!.findMany).mockResolvedValue([]);
            vi.mocked(mockPrisma.sector!.findMany).mockResolvedValue([]);
            vi.mocked(mockPrisma.permission!.findMany).mockResolvedValue([]);
            vi.mocked(mockPrisma.permission!.count).mockResolvedValue(0);
            vi.mocked(mockPrisma.user!.count).mockResolvedValue(0);
            vi.mocked(mockPrisma.position!.count).mockResolvedValue(0);
            vi.mocked(mockPrisma.sector!.count).mockResolvedValue(0);
            vi.mocked(mockPrisma.department!.count).mockResolvedValue(0);

            // Act
            const report = await useCase.execute({
                orgId,
                actorId,
                filters: {},
            });

            // Assert
            expect(report.recommendations).toContain(
                'Sistema de permissões está em conformidade! Nenhuma anomalia detectada.',
            );
        });
    });
});
