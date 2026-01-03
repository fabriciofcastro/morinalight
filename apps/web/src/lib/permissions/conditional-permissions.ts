/**
 * Conditional Permissions System
 * 
 * Sistema avançado de permissões que suporta:
 * - Permissões temporárias (válidas por período)
 * - Permissões condicionais (baseadas em regras)
 * - Delegação de permissões
 * - Validação em tempo real
 */

import { Permission } from '@/config/permissions';

// ============================================================================
// TIPOS
// ============================================================================

export interface TemporalCondition {
    startDate?: Date;
    endDate?: Date;
    daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
    timeRange?: {
        start: string; // HH:mm
        end: string; // HH:mm
    };
}

export interface LocationCondition {
    branches?: string[];
    departments?: string[];
    sectors?: string[];
}

export interface RoleCondition {
    positions?: string[];
    minLevel?: number;
    maxLevel?: number;
}

export interface CustomCondition {
    field: string;
    operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
    value: any;
}

export interface PermissionConditions {
    temporal?: TemporalCondition;
    location?: LocationCondition;
    role?: RoleCondition;
    custom?: CustomCondition[];
    logic?: 'AND' | 'OR'; // Como combinar condições
}

export interface ConditionalPermission {
    permission: Permission;
    conditions: PermissionConditions;
    delegatedBy?: string; // User ID que delegou
    delegatedAt?: Date;
    reason?: string;
    isActive: boolean;
}

export interface PermissionContext {
    userId: string;
    currentDate: Date;
    currentTime: string; // HH:mm
    branchId?: string;
    departmentId?: string;
    sectorId?: string;
    positionId?: string;
    positionLevel?: number;
    customFields?: Record<string, any>;
}

// ============================================================================
// ENGINE DE VALIDAÇÃO
// ============================================================================

/**
 * Valida se uma condição temporal é satisfeita
 */
function validateTemporalCondition(
    condition: TemporalCondition,
    context: PermissionContext
): boolean {
    const { currentDate, currentTime } = context;

    // Validar range de datas
    if (condition.startDate && currentDate < condition.startDate) {
        return false;
    }
    if (condition.endDate && currentDate > condition.endDate) {
        return false;
    }

    // Validar dia da semana
    if (condition.daysOfWeek && condition.daysOfWeek.length > 0) {
        const dayOfWeek = currentDate.getDay();
        if (!condition.daysOfWeek.includes(dayOfWeek)) {
            return false;
        }
    }

    // Validar horário
    if (condition.timeRange) {
        const { start, end } = condition.timeRange;
        if (currentTime < start || currentTime > end) {
            return false;
        }
    }

    return true;
}

/**
 * Valida se uma condição de localização é satisfeita
 */
function validateLocationCondition(
    condition: LocationCondition,
    context: PermissionContext
): boolean {
    // Se especificou branches, validar
    if (condition.branches && condition.branches.length > 0) {
        if (!context.branchId || !condition.branches.includes(context.branchId)) {
            return false;
        }
    }

    // Se especificou departments, validar
    if (condition.departments && condition.departments.length > 0) {
        if (!context.departmentId || !condition.departments.includes(context.departmentId)) {
            return false;
        }
    }

    // Se especificou sectors, validar
    if (condition.sectors && condition.sectors.length > 0) {
        if (!context.sectorId || !condition.sectors.includes(context.sectorId)) {
            return false;
        }
    }

    return true;
}

/**
 * Valida se uma condição de cargo é satisfeita
 */
function validateRoleCondition(
    condition: RoleCondition,
    context: PermissionContext
): boolean {
    // Validar posições específicas
    if (condition.positions && condition.positions.length > 0) {
        if (!context.positionId || !condition.positions.includes(context.positionId)) {
            return false;
        }
    }

    // Validar nível mínimo
    if (condition.minLevel !== undefined && context.positionLevel !== undefined) {
        if (context.positionLevel < condition.minLevel) {
            return false;
        }
    }

    // Validar nível máximo
    if (condition.maxLevel !== undefined && context.positionLevel !== undefined) {
        if (context.positionLevel > condition.maxLevel) {
            return false;
        }
    }

    return true;
}

/**
 * Valida uma condição customizada
 */
function validateCustomCondition(
    condition: CustomCondition,
    context: PermissionContext
): boolean {
    const value = context.customFields?.[condition.field];

    if (value === undefined) {
        return false;
    }

    switch (condition.operator) {
        case 'equals':
            return value === condition.value;
        case 'notEquals':
            return value !== condition.value;
        case 'contains':
            return String(value).includes(String(condition.value));
        case 'greaterThan':
            return Number(value) > Number(condition.value);
        case 'lessThan':
            return Number(value) < Number(condition.value);
        default:
            return false;
    }
}

/**
 * Valida se todas as condições de uma permissão são satisfeitas
 */
export function validateConditionalPermission(
    conditionalPermission: ConditionalPermission,
    context: PermissionContext
): boolean {
    const { conditions } = conditionalPermission;

    // Se não está ativa, retornar false
    if (!conditionalPermission.isActive) {
        return false;
    }

    const results: boolean[] = [];

    // Validar condição temporal
    if (conditions.temporal) {
        results.push(validateTemporalCondition(conditions.temporal, context));
    }

    // Validar condição de localização
    if (conditions.location) {
        results.push(validateLocationCondition(conditions.location, context));
    }

    // Validar condição de cargo
    if (conditions.role) {
        results.push(validateRoleCondition(conditions.role, context));
    }

    // Validar condições customizadas
    if (conditions.custom && conditions.custom.length > 0) {
        const customResults = conditions.custom.map(c => validateCustomCondition(c, context));
        results.push(customResults.every(r => r)); // Todas devem ser true
    }

    // Se não há condições, permissão é válida
    if (results.length === 0) {
        return true;
    }

    // Aplicar lógica (AND ou OR)
    const logic = conditions.logic || 'AND';
    return logic === 'AND'
        ? results.every(r => r)
        : results.some(r => r);
}

/**
 * Verifica se um usuário tem uma permissão condicional
 */
export function hasConditionalPermission(
    userPermissions: ConditionalPermission[],
    permission: Permission,
    context: PermissionContext
): boolean {
    const relevantPermissions = userPermissions.filter(
        p => p.permission === permission
    );

    if (relevantPermissions.length === 0) {
        return false;
    }

    // Pelo menos uma permissão condicional deve ser válida
    return relevantPermissions.some(p => validateConditionalPermission(p, context));
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Cria uma permissão temporária
 */
export function createTemporaryPermission(
    permission: Permission,
    startDate: Date,
    endDate: Date,
    delegatedBy?: string,
    reason?: string
): ConditionalPermission {
    return {
        permission,
        conditions: {
            temporal: { startDate, endDate },
        },
        delegatedBy,
        delegatedAt: new Date(),
        reason,
        isActive: true,
    };
}

/**
 * Cria uma permissão limitada por horário comercial
 */
export function createBusinessHoursPermission(
    permission: Permission,
    startTime: string = '08:00',
    endTime: string = '18:00',
    daysOfWeek: number[] = [1, 2, 3, 4, 5] // Segunda a Sexta
): ConditionalPermission {
    return {
        permission,
        conditions: {
            temporal: {
                daysOfWeek,
                timeRange: { start: startTime, end: endTime },
            },
        },
        isActive: true,
    };
}

/**
 * Cria uma permissão limitada por localização
 */
export function createLocationBasedPermission(
    permission: Permission,
    branches?: string[],
    departments?: string[]
): ConditionalPermission {
    return {
        permission,
        conditions: {
            location: { branches, departments },
        },
        isActive: true,
    };
}

/**
 * Formata uma condição para exibição
 */
export function formatConditionDescription(conditions: PermissionConditions): string[] {
    const descriptions: string[] = [];

    if (conditions.temporal) {
        const { startDate, endDate, daysOfWeek, timeRange } = conditions.temporal;

        if (startDate || endDate) {
            const start = startDate ? startDate.toLocaleDateString() : 'início';
            const end = endDate ? endDate.toLocaleDateString() : 'fim';
            descriptions.push(`Válido de ${start} até ${end}`);
        }

        if (daysOfWeek && daysOfWeek.length > 0) {
            const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
            const dayNames = daysOfWeek.map(d => days[d]).join(', ');
            descriptions.push(`Apenas em: ${dayNames}`);
        }

        if (timeRange) {
            descriptions.push(`Horário: ${timeRange.start} - ${timeRange.end}`);
        }
    }

    if (conditions.location) {
        const { branches, departments, sectors } = conditions.location;

        if (branches && branches.length > 0) {
            descriptions.push(`Filiais: ${branches.length} selecionadas`);
        }
        if (departments && departments.length > 0) {
            descriptions.push(`Departamentos: ${departments.length} selecionados`);
        }
        if (sectors && sectors.length > 0) {
            descriptions.push(`Setores: ${sectors.length} selecionados`);
        }
    }

    if (conditions.role) {
        const { positions, minLevel, maxLevel } = conditions.role;

        if (positions && positions.length > 0) {
            descriptions.push(`Cargos: ${positions.length} selecionados`);
        }
        if (minLevel !== undefined) {
            descriptions.push(`Nível mínimo: ${minLevel}`);
        }
        if (maxLevel !== undefined) {
            descriptions.push(`Nível máximo: ${maxLevel}`);
        }
    }

    if (conditions.custom && conditions.custom.length > 0) {
        descriptions.push(`${conditions.custom.length} condição(ões) customizada(s)`);
    }

    return descriptions;
}
