import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FixPermissionAnomaliesUseCase } from './fix-permission-anomalies.use-case';
import type { PrismaService } from '../../../../infra/database/prisma.service';
import type { PermissionAuditLogRepository } from '../../domain/repositories/permission-audit-log-repository';

describe('FixPermissionAnomaliesUseCase', () => {
    let useCase: FixPermissionAnomaliesUseCase;
    let mockPrisma: Partial<PrismaService>;
    let mockAuditLogRepository: Partial<PermissionAuditLogRepository>;

    beforeEach(() => {
        // Mock do Prisma
        mockPrisma = {
            userPermission: {
                deleteMany: vi.fn(),
            } as any,
            positionPermission: {
                deleteMany: vi.fn(),
            } as any,
            sectorPermission: {
                deleteMany: vi.fn(),
            } as any,
            departmentPermission: {
                deleteMany: vi.fn(),
            } as any,
            subdepartmentPermission: {
                deleteMany: vi.fn(),
            } as any,
        };

        // Mock do AuditLogRepository
        mockAuditLogRepository = {
            registrar: vi.fn(),
        };

        useCase = new FixPermissionAnomaliesUseCase({
            prisma: mockPrisma as PrismaService,
            auditLogRepository: mockAuditLogRepository as PermissionAuditLogRepository,
        });
    });

    describe('removeOrphanedPermissions', () => {
        it('deve remover permissões órfãs em modo real', async () => {
            // Arrange
            const orgId = 'org-123';
            const actorId = 'user-123';
            const orphaned = [
                {
                    type: 'user' as const,
                    permissionId: 'perm-1',
                    entityId: 'deleted-user',
                    reason: 'Usuário deletado',
                    createdAt: new Date(),
                },
            ];

            vi.mocked(mockPrisma.userPermission!.deleteMany).mockResolvedValue({ count: 1 });
            vi.mocked(mockAuditLogRepository.registrar!).mockResolvedValue();

            // Act
            const result = await useCase.execute({
                orgId,
                actorId,
                options: {
                    removeOrphaned: true,
                    dryRun: false,
                },
                anomalies: {
                    orphaned,
                    conflicts: [],
                    excessive: [],
                    gaps: [],
                },
            });

            // Assert
            expect(result.success).toBe(true);
            expect(result.itemsFixed).toBe(1);
            expect(result.errors).toHaveLength(0);
            expect(mockPrisma.userPermission!.deleteMany).toHaveBeenCalledWith({
                where: {
                    orgId,
                    userId: 'deleted-user',
                    permissionId: 'perm-1',
                },
            });
            expect(mockAuditLogRepository.registrar).toHaveBeenCalled();
        });

        it('deve simular remoção em modo dry-run', async () => {
            // Arrange
            const orgId = 'org-123';
            const actorId = 'user-123';
            const orphaned = [
                {
                    type: 'user' as const,
                    permissionId: 'perm-1',
                    entityId: 'deleted-user',
                    reason: 'Usuário deletado',
                    createdAt: new Date(),
                },
            ];

            // Act
            const result = await useCase.execute({
                orgId,
                actorId,
                options: {
                    removeOrphaned: true,
                    dryRun: true,
                },
                anomalies: {
                    orphaned,
                    conflicts: [],
                    excessive: [],
                    gaps: [],
                },
            });

            // Assert
            expect(result.success).toBe(true);
            expect(result.itemsFixed).toBe(1);
            expect(result.warnings).toContain(
                'Modo dry-run ativado - nenhuma mudança foi aplicada',
            );
            expect(mockPrisma.userPermission!.deleteMany).not.toHaveBeenCalled();
            expect(mockAuditLogRepository.registrar).not.toHaveBeenCalled();
        });
    });

    describe('resolvePermissionConflicts', () => {
        it('deve resolver conflitos removendo permissão customizada do usuário', async () => {
            // Arrange
            const orgId = 'org-123';
            const actorId = 'user-123';
            const conflicts = [
                {
                    userId: 'user-1',
                    permissionId: 'perm-1',
                    sources: [
                        { type: 'user' as const, entityId: 'user-1', granted: true },
                        { type: 'position' as const, entityId: 'pos-1', granted: false },
                    ],
                    severity: 'high' as const,
                    description: 'Conflito',
                },
            ];

            vi.mocked(mockPrisma.userPermission!.deleteMany).mockResolvedValue({ count: 1 });
            vi.mocked(mockAuditLogRepository.registrar!).mockResolvedValue();

            // Act
            const result = await useCase.execute({
                orgId,
                actorId,
                options: {
                    resolveConflicts: true,
                    dryRun: false,
                },
                anomalies: {
                    orphaned: [],
                    conflicts,
                    excessive: [],
                    gaps: [],
                },
            });

            // Assert
            expect(result.success).toBe(true);
            expect(result.itemsFixed).toBe(1);
            expect(mockPrisma.userPermission!.deleteMany).toHaveBeenCalledWith({
                where: {
                    orgId,
                    userId: 'user-1',
                    permissionId: 'perm-1',
                },
            });
        });
    });

    describe('removeExcessivePermissions', () => {
        it('deve remover permissões excessivas', async () => {
            // Arrange
            const orgId = 'org-123';
            const actorId = 'user-123';
            const excessive = [
                {
                    entityType: 'user' as const,
                    entityId: 'user-1',
                    permissionId: 'perm-1',
                    reason: 'Redundante',
                    severity: 'low' as const,
                },
            ];

            vi.mocked(mockPrisma.userPermission!.deleteMany).mockResolvedValue({ count: 1 });
            vi.mocked(mockAuditLogRepository.registrar!).mockResolvedValue();

            // Act
            const result = await useCase.execute({
                orgId,
                actorId,
                options: {
                    removeExcessive: true,
                    dryRun: false,
                },
                anomalies: {
                    orphaned: [],
                    conflicts: [],
                    excessive,
                    gaps: [],
                },
            });

            // Assert
            expect(result.success).toBe(true);
            expect(result.itemsFixed).toBe(1);
        });
    });

    describe('backfillAuditLogs', () => {
        it('deve preencher gaps de auditoria', async () => {
            // Arrange
            const orgId = 'org-123';
            const actorId = 'user-123';
            const gaps = [
                {
                    entityType: 'user' as const,
                    entityId: 'user-1',
                    permissionId: 'perm-1',
                    action: 'granted' as const,
                    missingFields: ['auditLog'],
                    createdAt: new Date(),
                },
            ];

            vi.mocked(mockAuditLogRepository.registrar!).mockResolvedValue();

            // Act
            const result = await useCase.execute({
                orgId,
                actorId,
                options: {
                    backfillAudit: true,
                    dryRun: false,
                },
                anomalies: {
                    orphaned: [],
                    conflicts: [],
                    excessive: [],
                    gaps,
                },
            });

            // Assert
            expect(result.success).toBe(true);
            expect(result.itemsFixed).toBe(1);
            expect(mockAuditLogRepository.registrar).toHaveBeenCalled();
        });
    });

    describe('error handling', () => {
        it('deve capturar erros e retornar success=false', async () => {
            // Arrange
            const orgId = 'org-123';
            const actorId = 'user-123';
            const orphaned = [
                {
                    type: 'user' as const,
                    permissionId: 'perm-1',
                    entityId: 'deleted-user',
                    reason: 'Teste',
                    createdAt: new Date(),
                },
            ];

            vi.mocked(mockPrisma.userPermission!.deleteMany).mockRejectedValue(
                new Error('Database error'),
            );

            // Act
            const result = await useCase.execute({
                orgId,
                actorId,
                options: {
                    removeOrphaned: true,
                    dryRun: false,
                },
                anomalies: {
                    orphaned,
                    conflicts: [],
                    excessive: [],
                    gaps: [],
                },
            });

            // Assert
            expect(result.success).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });
    });
});
