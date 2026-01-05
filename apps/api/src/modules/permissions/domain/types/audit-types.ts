/**
 * Tipos para Auditoria de Permissões
 * 
 * Define as estruturas de dados para identificar e reportar anomalias
 * no sistema de permissões.
 */

/**
 * Permissão órfã - atribuída a entidade que não existe mais
 */
export interface OrphanedPermission {
    type: 'user' | 'position' | 'sector' | 'department' | 'subdepartment';
    permissionId: string;
    entityId: string;
    entityName?: string;
    reason: string;
    createdAt: Date;
    createdBy?: string;
}

/**
 * Fonte de conflito de permissão
 */
export interface ConflictSource {
    type: 'user' | 'position' | 'sector' | 'department' | 'subdepartment' | 'role';
    entityId: string;
    entityName?: string;
    granted: boolean;
}

/**
 * Conflito de permissão - mesma permissão com valores contraditórios
 */
export interface PermissionConflict {
    userId: string;
    userName?: string;
    permissionId: string;
    permissionCode?: string;
    sources: ConflictSource[];
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
}

/**
 * Permissão excessiva - não necessária ou redundante
 */
export interface ExcessivePermission {
    entityType: 'user' | 'position' | 'sector' | 'department' | 'subdepartment';
    entityId: string;
    entityName?: string;
    permissionId: string;
    permissionCode?: string;
    reason: string;
    severity: 'low' | 'medium' | 'high';
}

/**
 * Inconsistência hierárquica - filho tem permissão que pai não tem
 */
export interface HierarchyInconsistency {
    childType: 'subdepartment' | 'sector' | 'position';
    childId: string;
    childName?: string;
    parentType: 'department' | 'subdepartment' | 'sector';
    parentId: string;
    parentName?: string;
    permissionId: string;
    permissionCode?: string;
    issue: string;
}

/**
 * Gap na auditoria - mudança sem registro adequado
 */
export interface AuditGap {
    entityType: 'user' | 'position' | 'sector' | 'department' | 'subdepartment';
    entityId: string;
    permissionId: string;
    action: 'granted' | 'denied' | 'removed';
    missingFields: string[];
    createdAt: Date;
}

/**
 * Permissão obsoleta - não utilizada há muito tempo
 */
export interface ObsoletePermission {
    permissionId: string;
    permissionCode: string;
    permissionName?: string;
    lastUsed: Date | null;
    usageCount: number;
    reason: string;
}

/**
 * Violação de Segregação de Funções (SoD)
 */
export interface SoDViolation {
    userId: string;
    userName?: string;
    conflictingPermissions: {
        permissionId: string;
        permissionCode: string;
        permissionName?: string;
    }[];
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    riskLevel: string;
}

/**
 * Resumo da auditoria
 */
export interface AuditSummary {
    totalPermissions: number;
    totalUsers: number;
    totalPositions: number;
    totalSectors: number;
    totalDepartments: number;
    anomaliesFound: number;
    conformityScore: number; // 0-100
    criticalIssues: number;
    highSeverityIssues: number;
    mediumSeverityIssues: number;
    lowSeverityIssues: number;
}

/**
 * Relatório completo de auditoria
 */
export interface AuditReport {
    id: string;
    orgId: string;
    timestamp: Date;
    executedBy: string;
    summary: AuditSummary;
    orphanedPermissions: OrphanedPermission[];
    conflicts: PermissionConflict[];
    excessivePermissions: ExcessivePermission[];
    hierarchyIssues: HierarchyInconsistency[];
    auditGaps: AuditGap[];
    obsoletePermissions: ObsoletePermission[];
    sodViolations: SoDViolation[];
    recommendations: string[];
}

/**
 * Filtros para auditoria
 */
export interface AuditFilters {
    includeOrphaned?: boolean;
    includeConflicts?: boolean;
    includeExcessive?: boolean;
    includeHierarchy?: boolean;
    includeAuditGaps?: boolean;
    includeObsolete?: boolean;
    includeSoD?: boolean;
    minSeverity?: 'low' | 'medium' | 'high' | 'critical';
    entityType?: 'user' | 'position' | 'sector' | 'department' | 'subdepartment';
    entityId?: string;
}

/**
 * Opções de correção automática
 */
export interface FixOptions {
    removeOrphaned?: boolean;
    resolveConflicts?: boolean;
    removeExcessive?: boolean;
    fixHierarchy?: boolean;
    backfillAudit?: boolean;
    archiveObsolete?: boolean;
    dryRun?: boolean; // Simular sem aplicar mudanças
}

/**
 * Resultado da correção
 */
export interface FixResult {
    success: boolean;
    itemsFixed: number;
    errors: string[];
    warnings: string[];
    changes: {
        type: string;
        entityId: string;
        permissionId: string;
        action: string;
        timestamp: Date;
    }[];
}
