/**
 * Testes Unitários - Conditional Permissions
 */

import { describe, it, expect } from 'vitest';
import {
    validateConditionalPermission,
    hasConditionalPermission,
    createTemporaryPermission,
    createBusinessHoursPermission,
    createLocationBasedPermission,
    formatConditionDescription,
    type ConditionalPermission,
    type PermissionContext,
} from '../conditional-permissions';
import { PERMISSIONS } from '@/config/permissions';

describe('Conditional Permissions', () => {
    const mockContext: PermissionContext = {
        userId: 'user-123',
        currentDate: new Date('2024-06-15T14:30:00'), // Sábado, 14:30
        currentTime: '14:30',
        branchId: 'branch-1',
        departmentId: 'dept-1',
        sectorId: 'sector-1',
        positionId: 'pos-1',
        positionLevel: 5,
    };

    describe('validateConditionalPermission', () => {
        it('deve validar permissão sem condições', () => {
            const permission: ConditionalPermission = {
                permission: PERMISSIONS.PRODUCTS_VIEW,
                conditions: {},
                isActive: true,
            };

            const result = validateConditionalPermission(permission, mockContext);
            expect(result).toBe(true);
        });

        it('deve rejeitar permissão inativa', () => {
            const permission: ConditionalPermission = {
                permission: PERMISSIONS.PRODUCTS_VIEW,
                conditions: {},
                isActive: false,
            };

            const result = validateConditionalPermission(permission, mockContext);
            expect(result).toBe(false);
        });

        it('deve validar condição temporal - data válida', () => {
            const permission: ConditionalPermission = {
                permission: PERMISSIONS.PRODUCTS_VIEW,
                conditions: {
                    temporal: {
                        startDate: new Date('2024-01-01'),
                        endDate: new Date('2024-12-31'),
                    },
                },
                isActive: true,
            };

            const result = validateConditionalPermission(permission, mockContext);
            expect(result).toBe(true);
        });

        it('deve rejeitar condição temporal - data expirada', () => {
            const permission: ConditionalPermission = {
                permission: PERMISSIONS.PRODUCTS_VIEW,
                conditions: {
                    temporal: {
                        startDate: new Date('2023-01-01'),
                        endDate: new Date('2023-12-31'),
                    },
                },
                isActive: true,
            };

            const result = validateConditionalPermission(permission, mockContext);
            expect(result).toBe(false);
        });

        it('deve validar dia da semana - sábado permitido', () => {
            const permission: ConditionalPermission = {
                permission: PERMISSIONS.PRODUCTS_VIEW,
                conditions: {
                    temporal: {
                        daysOfWeek: [6], // Sábado
                    },
                },
                isActive: true,
            };

            const result = validateConditionalPermission(permission, mockContext);
            expect(result).toBe(true);
        });

        it('deve rejeitar dia da semana - apenas dias úteis', () => {
            const permission: ConditionalPermission = {
                permission: PERMISSIONS.PRODUCTS_VIEW,
                conditions: {
                    temporal: {
                        daysOfWeek: [1, 2, 3, 4, 5], // Segunda a Sexta
                    },
                },
                isActive: true,
            };

            const result = validateConditionalPermission(permission, mockContext);
            expect(result).toBe(false); // Contexto é sábado
        });

        it('deve validar horário - dentro do range', () => {
            const permission: ConditionalPermission = {
                permission: PERMISSIONS.PRODUCTS_VIEW,
                conditions: {
                    temporal: {
                        timeRange: { start: '08:00', end: '18:00' },
                    },
                },
                isActive: true,
            };

            const result = validateConditionalPermission(permission, mockContext);
            expect(result).toBe(true); // 14:30 está entre 08:00 e 18:00
        });

        it('deve rejeitar horário - fora do range', () => {
            const permission: ConditionalPermission = {
                permission: PERMISSIONS.PRODUCTS_VIEW,
                conditions: {
                    temporal: {
                        timeRange: { start: '08:00', end: '12:00' },
                    },
                },
                isActive: true,
            };

            const result = validateConditionalPermission(permission, mockContext);
            expect(result).toBe(false); // 14:30 está fora de 08:00-12:00
        });

        it('deve validar localização - filial correta', () => {
            const permission: ConditionalPermission = {
                permission: PERMISSIONS.PRODUCTS_VIEW,
                conditions: {
                    location: {
                        branches: ['branch-1', 'branch-2'],
                    },
                },
                isActive: true,
            };

            const result = validateConditionalPermission(permission, mockContext);
            expect(result).toBe(true);
        });

        it('deve rejeitar localização - filial incorreta', () => {
            const permission: ConditionalPermission = {
                permission: PERMISSIONS.PRODUCTS_VIEW,
                conditions: {
                    location: {
                        branches: ['branch-2', 'branch-3'],
                    },
                },
                isActive: true,
            };

            const result = validateConditionalPermission(permission, mockContext);
            expect(result).toBe(false);
        });

        it('deve validar cargo - nível mínimo', () => {
            const permission: ConditionalPermission = {
                permission: PERMISSIONS.PRODUCTS_VIEW,
                conditions: {
                    role: {
                        minLevel: 3,
                    },
                },
                isActive: true,
            };

            const result = validateConditionalPermission(permission, mockContext);
            expect(result).toBe(true); // Nível 5 >= 3
        });

        it('deve rejeitar cargo - nível insuficiente', () => {
            const permission: ConditionalPermission = {
                permission: PERMISSIONS.PRODUCTS_VIEW,
                conditions: {
                    role: {
                        minLevel: 7,
                    },
                },
                isActive: true,
            };

            const result = validateConditionalPermission(permission, mockContext);
            expect(result).toBe(false); // Nível 5 < 7
        });

        it('deve validar lógica AND - todas as condições', () => {
            const permission: ConditionalPermission = {
                permission: PERMISSIONS.PRODUCTS_VIEW,
                conditions: {
                    temporal: {
                        timeRange: { start: '08:00', end: '18:00' },
                    },
                    location: {
                        branches: ['branch-1'],
                    },
                    logic: 'AND',
                },
                isActive: true,
            };

            const result = validateConditionalPermission(permission, mockContext);
            expect(result).toBe(true);
        });

        it('deve validar lógica OR - pelo menos uma condição', () => {
            const permission: ConditionalPermission = {
                permission: PERMISSIONS.PRODUCTS_VIEW,
                conditions: {
                    temporal: {
                        daysOfWeek: [1, 2, 3], // Não é sábado
                    },
                    location: {
                        branches: ['branch-1'], // Correto
                    },
                    logic: 'OR',
                },
                isActive: true,
            };

            const result = validateConditionalPermission(permission, mockContext);
            expect(result).toBe(true); // Localização está correta
        });
    });

    describe('hasConditionalPermission', () => {
        it('deve encontrar permissão válida', () => {
            const permissions: ConditionalPermission[] = [
                {
                    permission: PERMISSIONS.PRODUCTS_VIEW,
                    conditions: {},
                    isActive: true,
                },
            ];

            const result = hasConditionalPermission(
                permissions,
                PERMISSIONS.PRODUCTS_VIEW,
                mockContext
            );

            expect(result).toBe(true);
        });

        it('deve retornar false para permissão não encontrada', () => {
            const permissions: ConditionalPermission[] = [
                {
                    permission: PERMISSIONS.PRODUCTS_VIEW,
                    conditions: {},
                    isActive: true,
                },
            ];

            const result = hasConditionalPermission(
                permissions,
                PERMISSIONS.PRODUCTS_EDIT,
                mockContext
            );

            expect(result).toBe(false);
        });
    });

    describe('Helpers', () => {
        it('createTemporaryPermission deve criar permissão temporal', () => {
            const start = new Date('2024-01-01');
            const end = new Date('2024-12-31');

            const permission = createTemporaryPermission(
                PERMISSIONS.PRODUCTS_EDIT,
                start,
                end,
                'admin-user',
                'Acesso temporário para projeto'
            );

            expect(permission.permission).toBe(PERMISSIONS.PRODUCTS_EDIT);
            expect(permission.conditions.temporal?.startDate).toBe(start);
            expect(permission.conditions.temporal?.endDate).toBe(end);
            expect(permission.delegatedBy).toBe('admin-user');
            expect(permission.reason).toBe('Acesso temporário para projeto');
            expect(permission.isActive).toBe(true);
        });

        it('createBusinessHoursPermission deve criar permissão de horário comercial', () => {
            const permission = createBusinessHoursPermission(
                PERMISSIONS.PRODUCTS_EDIT,
                '09:00',
                '17:00',
                [1, 2, 3, 4, 5]
            );

            expect(permission.conditions.temporal?.timeRange?.start).toBe('09:00');
            expect(permission.conditions.temporal?.timeRange?.end).toBe('17:00');
            expect(permission.conditions.temporal?.daysOfWeek).toEqual([1, 2, 3, 4, 5]);
        });

        it('createLocationBasedPermission deve criar permissão por localização', () => {
            const permission = createLocationBasedPermission(
                PERMISSIONS.PRODUCTS_EDIT,
                ['branch-1', 'branch-2'],
                ['dept-1']
            );

            expect(permission.conditions.location?.branches).toEqual(['branch-1', 'branch-2']);
            expect(permission.conditions.location?.departments).toEqual(['dept-1']);
        });

        it('formatConditionDescription deve formatar descrições', () => {
            const conditions = {
                temporal: {
                    startDate: new Date('2024-01-01'),
                    endDate: new Date('2024-12-31'),
                    daysOfWeek: [1, 2, 3, 4, 5],
                    timeRange: { start: '08:00', end: '18:00' },
                },
                location: {
                    branches: ['branch-1', 'branch-2'],
                },
            };

            const descriptions = formatConditionDescription(conditions);

            expect(descriptions.length).toBeGreaterThan(0);
            expect(descriptions.some(d => d.includes('Válido de'))).toBe(true);
            expect(descriptions.some(d => d.includes('Apenas em:'))).toBe(true);
            expect(descriptions.some(d => d.includes('Horário:'))).toBe(true);
            expect(descriptions.some(d => d.includes('Filiais:'))).toBe(true);
        });
    });
});
