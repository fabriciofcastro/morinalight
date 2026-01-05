import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { GeoRestriction, GeoAction, GeoRestrictionType } from '@prisma/client';

/**
 * GeoLocation interface
 */
export interface GeoLocation {
    country: string;
    city: string;
    latitude: number;
    longitude: number;
    isVpn: boolean;
    isProxy: boolean;
    isTor: boolean;
}

/**
 * GeoControlService - Geographic Access Control Service
 * Gerencia restrições geográficas e valida acesso por localização
 */
@Injectable()
export class GeoControlService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Verifica se o IP é permitido para o usuário
     */
    async isIpAllowed(userId: string, ip: string): Promise<boolean> {
        const restrictions = await this.getUserGeoRestrictions(userId);

        if (restrictions.length === 0) {
            // Se não há restrições, permite acesso
            return true;
        }

        // Verifica restrições de IP
        const ipRestrictions = restrictions.filter(r => r.type === 'IP_RANGE');

        for (const restriction of ipRestrictions) {
            const isInRange = this.isIpInRanges(ip, restriction.ipRanges);

            if (restriction.action === 'ALLOW' && isInRange) {
                return true;
            }

            if (restriction.action === 'DENY' && isInRange) {
                return false;
            }
        }

        // Se chegou aqui e há restrições ALLOW, nega (whitelist)
        const hasAllowRestrictions = ipRestrictions.some(r => r.action === 'ALLOW');
        if (hasAllowRestrictions) {
            return false;
        }

        return true;
    }

    /**
     * Verifica se o país é permitido para o usuário
     */
    async isCountryAllowed(userId: string, countryCode: string): Promise<boolean> {
        const restrictions = await this.getUserGeoRestrictions(userId);

        if (restrictions.length === 0) {
            return true;
        }

        // Verifica restrições de país
        const countryRestrictions = restrictions.filter(r => r.type === 'COUNTRY');

        for (const restriction of countryRestrictions) {
            const isInList = restriction.countries.includes(countryCode);

            if (restriction.action === 'ALLOW' && isInList) {
                return true;
            }

            if (restriction.action === 'DENY' && isInList) {
                return false;
            }
        }

        // Se chegou aqui e há restrições ALLOW, nega (whitelist)
        const hasAllowRestrictions = countryRestrictions.some(r => r.action === 'ALLOW');
        if (hasAllowRestrictions) {
            return false;
        }

        return true;
    }

    /**
     * Detecta se o IP é VPN (placeholder - integração futura com IPQualityScore)
     */
    async detectVpn(ip: string): Promise<boolean> {
        // TODO: Integrar com IPQualityScore API
        // Por enquanto, retorna false
        return false;
    }

    /**
     * Detecta se o IP é Proxy (placeholder - integração futura)
     */
    async detectProxy(ip: string): Promise<boolean> {
        // TODO: Integrar com IPQualityScore API
        return false;
    }

    /**
     * Detecta se o IP é Tor (placeholder - integração futura)
     */
    async detectTor(ip: string): Promise<boolean> {
        // TODO: Integrar com IPQualityScore API
        return false;
    }

    /**
     * Obtém geolocalização por IP (placeholder - integração futura com MaxMind)
     */
    async getGeolocation(ip: string): Promise<GeoLocation> {
        // TODO: Integrar com MaxMind GeoIP2
        // Por enquanto, retorna dados mockados
        return {
            country: 'BR',
            city: 'São Paulo',
            latitude: -23.5505,
            longitude: -46.6333,
            isVpn: false,
            isProxy: false,
            isTor: false,
        };
    }

    /**
     * Valida acesso completo (IP, país, VPN/Proxy/Tor)
     */
    async validateAccess(userId: string, ip: string): Promise<{
        allowed: boolean;
        reason?: string;
    }> {
        const restrictions = await this.getUserGeoRestrictions(userId);

        if (restrictions.length === 0) {
            return { allowed: true };
        }

        // Obtém geolocalização
        const geo = await this.getGeolocation(ip);

        // Verifica bloqueio de VPN/Proxy/Tor
        for (const restriction of restrictions) {
            if (restriction.blockVpn && geo.isVpn) {
                return { allowed: false, reason: 'VPN detectada' };
            }
            if (restriction.blockProxy && geo.isProxy) {
                return { allowed: false, reason: 'Proxy detectado' };
            }
            if (restriction.blockTor && geo.isTor) {
                return { allowed: false, reason: 'Tor detectado' };
            }
        }

        // Verifica país
        const countryAllowed = await this.isCountryAllowed(userId, geo.country);
        if (!countryAllowed) {
            return { allowed: false, reason: `País bloqueado: ${geo.country}` };
        }

        // Verifica IP
        const ipAllowed = await this.isIpAllowed(userId, ip);
        if (!ipAllowed) {
            return { allowed: false, reason: `IP bloqueado: ${ip}` };
        }

        return { allowed: true };
    }

    /**
     * Cria restrição geográfica
     */
    async createGeoRestriction(data: {
        orgId: string;
        name: string;
        description?: string;
        type: GeoRestrictionType;
        action: GeoAction;
        countries?: string[];
        ipRanges?: string[];
        cities?: string[];
        states?: string[];
        blockVpn?: boolean;
        blockProxy?: boolean;
        blockTor?: boolean;
    }): Promise<GeoRestriction> {
        return this.prisma.geoRestriction.create({
            data: {
                ...data,
                countries: data.countries || [],
                ipRanges: data.ipRanges || [],
                cities: data.cities || [],
                states: data.states || [],
            },
        });
    }

    /**
     * Atribui restrição a um usuário
     */
    async assignToUser(geoRestrictionId: string, userId: string): Promise<void> {
        await this.prisma.userGeoRestriction.create({
            data: {
                geoRestrictionId,
                userId,
            },
        });
    }

    /**
     * Atribui restrição a uma role
     */
    async assignToRole(geoRestrictionId: string, roleId: string): Promise<void> {
        await this.prisma.roleGeoRestriction.create({
            data: {
                geoRestrictionId,
                roleId,
            },
        });
    }

    /**
     * Lista restrições de uma organização
     */
    async listByOrganization(orgId: string): Promise<GeoRestriction[]> {
        return this.prisma.geoRestriction.findMany({
            where: { orgId },
            orderBy: { priority: 'desc' },
        });
    }

    /**
     * Atualiza restrição geográfica
     */
    async updateGeoRestriction(
        id: string,
        data: Partial<{
            name: string;
            description: string;
            countries: string[];
            ipRanges: string[];
            cities: string[];
            states: string[];
            blockVpn: boolean;
            blockProxy: boolean;
            blockTor: boolean;
            isActive: boolean;
            priority: number;
        }>
    ): Promise<GeoRestriction> {
        return this.prisma.geoRestriction.update({
            where: { id },
            data,
        });
    }

    /**
     * Deleta restrição geográfica
     */
    async deleteGeoRestriction(id: string): Promise<void> {
        await this.prisma.geoRestriction.delete({
            where: { id },
        });
    }

    /**
     * Obtém restrições geográficas do usuário (diretas + via roles)
     */
    private async getUserGeoRestrictions(userId: string): Promise<GeoRestriction[]> {
        // Restrições diretas
        const userRestrictions = await this.prisma.geoRestriction.findMany({
            where: {
                isActive: true,
                userAssignments: {
                    some: { userId },
                },
            },
        });

        // Restrições via roles
        const roleRestrictions = await this.prisma.geoRestriction.findMany({
            where: {
                isActive: true,
                roleAssignments: {
                    some: {
                        role: {
                            users: {
                                some: { userId },
                            },
                        },
                    },
                },
            },
        });

        // Combina e remove duplicatas
        const allRestrictions = [...userRestrictions, ...roleRestrictions];
        const uniqueRestrictions = Array.from(
            new Map(allRestrictions.map(r => [r.id, r])).values()
        );

        // Ordena por prioridade
        return uniqueRestrictions.sort((a, b) => b.priority - a.priority);
    }

    /**
     * Verifica se IP está em algum range CIDR
     */
    private isIpInRanges(ip: string, ranges: string[]): boolean {
        // TODO: Implementar validação CIDR real
        // Por enquanto, faz comparação simples
        return ranges.some(range => {
            if (range.includes('/')) {
                // É um CIDR, precisa de lógica mais complexa
                const [network] = range.split('/');
                return ip.startsWith(network.split('.').slice(0, 3).join('.'));
            }
            return ip === range;
        });
    }
}
