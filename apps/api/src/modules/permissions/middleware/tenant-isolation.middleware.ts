import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export interface TenantContext {
    tenantId: string;
    tenantName: string;
    features: string[];
    config: Record<string, any>;
}

/**
 * Middleware de isolamento de tenant
 * Garante que cada organização tenha acesso apenas aos seus dados
 */
@Injectable()
export class TenantIsolationMiddleware implements NestMiddleware {
    async use(req: Request, res: Response, next: NextFunction) {
        try {
            // Extrair tenant ID do token JWT ou header
            const tenantId = this.extractTenantId(req);

            if (!tenantId) {
                return res.status(400).json({
                    error: 'Tenant ID required',
                    message: 'Request must include valid tenant identification',
                });
            }

            // Validar tenant
            const tenant = await this.validateTenant(tenantId);

            if (!tenant) {
                return res.status(403).json({
                    error: 'Invalid tenant',
                    message: 'Tenant not found or inactive',
                });
            }

            // Adicionar contexto do tenant à requisição
            (req as any).tenant = tenant;

            // Configurar filtro de tenant para queries
            (req as any).tenantFilter = { orgId: tenantId };

            next();
        } catch (error: any) {
            return res.status(500).json({
                error: 'Tenant isolation error',
                message: error.message,
            });
        }
    }

    private extractTenantId(req: Request): string | null {
        // 1. Tentar extrair do header
        const headerTenant = req.headers['x-tenant-id'] as string;
        if (headerTenant) return headerTenant;

        // 2. Tentar extrair do JWT
        const user = (req as any).user;
        if (user?.orgId) return user.orgId;

        // 3. Tentar extrair do subdomain
        const host = req.headers.host || '';
        const subdomain = host.split('.')[0];
        if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
            return this.getTenantIdFromSubdomain(subdomain);
        }

        return null;
    }

    private async validateTenant(tenantId: string): Promise<TenantContext | null> {
        // Implementar validação no banco
        // Por enquanto, retornar mock
        return {
            tenantId,
            tenantName: 'Organization Name',
            features: ['audit', 'sod', 'ml', 'siem'],
            config: {
                maxUsers: 1000,
                retentionDays: 365,
            },
        };
    }

    private getTenantIdFromSubdomain(subdomain: string): string {
        // Implementar mapeamento subdomain -> tenantId
        return subdomain;
    }
}

/**
 * Serviço de configuração por tenant
 */
@Injectable()
export class TenantConfigService {
    /**
     * Obtém configuração do tenant
     */
    async getTenantConfig(tenantId: string): Promise<TenantContext> {
        // Implementar busca no banco
        return {
            tenantId,
            tenantName: 'Organization',
            features: [],
            config: {},
        };
    }

    /**
     * Atualiza configuração do tenant
     */
    async updateTenantConfig(
        tenantId: string,
        config: Partial<TenantContext['config']>,
    ): Promise<void> {
        // Implementar atualização
    }

    /**
     * Verifica se tenant tem feature habilitada
     */
    async hasFeature(tenantId: string, feature: string): Promise<boolean> {
        const config = await this.getTenantConfig(tenantId);
        return config.features.includes(feature);
    }

    /**
     * Obtém políticas SoD específicas do tenant
     */
    async getTenantSoDPolicies(tenantId: string): Promise<any[]> {
        // Implementar busca
        return [];
    }

    /**
     * Gera relatório consolidado de múltiplos tenants
     */
    async generateConsolidatedReport(tenantIds: string[]): Promise<{
        totalTenants: number;
        totalUsers: number;
        averageConformity: number;
        tenantSummaries: Array<{
            tenantId: string;
            tenantName: string;
            users: number;
            conformity: number;
            anomalies: number;
        }>;
    }> {
        const summaries = [];

        for (const tenantId of tenantIds) {
            const summary = await this.getTenantSummary(tenantId);
            summaries.push(summary);
        }

        const totalUsers = summaries.reduce((sum, s) => sum + s.users, 0);
        const averageConformity = summaries.reduce((sum, s) => sum + s.conformity, 0) / summaries.length;

        return {
            totalTenants: tenantIds.length,
            totalUsers,
            averageConformity,
            tenantSummaries: summaries,
        };
    }

    private async getTenantSummary(tenantId: string): Promise<any> {
        // Implementar busca
        return {
            tenantId,
            tenantName: 'Org',
            users: 0,
            conformity: 0,
            anomalies: 0,
        };
    }
}
