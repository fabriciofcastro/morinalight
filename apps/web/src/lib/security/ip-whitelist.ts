/**
 * IP Whitelisting
 * 
 * Sistema de whitelist de IPs para endpoints sensíveis
 */

import { auditService } from "@/lib/audit/audit-service";
import { logger } from "@/lib/observability";
import { NextRequest, NextResponse } from "next/server";

export interface IPWhitelistRule {
    id: string;
    name: string;
    ipAddress: string; // Pode ser IP único ou CIDR (ex: 192.168.1.0/24)
    description?: string;
    active: boolean;
    createdAt: Date;
}

export class IPWhitelistService {
    private rules: IPWhitelistRule[] = [];

    /**
     * Adiciona regra de whitelist
     */
    async addRule(rule: Omit<IPWhitelistRule, "id" | "createdAt">): Promise<IPWhitelistRule> {
        const newRule: IPWhitelistRule = {
            ...rule,
            id: crypto.randomUUID(),
            createdAt: new Date(),
        };

        this.rules.push(newRule);

        // Salvar no banco
        // await prisma.ipWhitelist.create({ data: newRule });

        return newRule;
    }

    /**
     * Remove regra
     */
    async removeRule(ruleId: string): Promise<void> {
        this.rules = this.rules.filter((r) => r.id !== ruleId);

        // await prisma.ipWhitelist.delete({ where: { id: ruleId } });
    }

    /**
     * Verifica se IP está na whitelist
     */
    isIPAllowed(ip: string): boolean {
        // Permitir localhost em desenvolvimento
        if (process.env.NODE_ENV === "development") {
            if (ip === "127.0.0.1" || ip === "::1" || ip === "localhost") {
                return true;
            }
        }

        // Verificar regras ativas
        const activeRules = this.rules.filter((r) => r.active);

        for (const rule of activeRules) {
            // Wildcard
            if (rule.ipAddress === "*") {
                return true;
            }

            // IP exato
            if (rule.ipAddress === ip) {
                return true;
            }

            // CIDR range
            if (rule.ipAddress.includes("/")) {
                if (this.isIPInCIDR(ip, rule.ipAddress)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Verifica se IP está em range CIDR
     */
    private isIPInCIDR(ip: string, cidr: string): boolean {
        const [range, bits] = cidr.split("/");
        const mask = ~(2 ** (32 - parseInt(bits ?? "32")) - 1);

        const ipInt = this.ipToInt(ip);
        const rangeInt = this.ipToInt(range ?? "0.0.0.0");

        return (ipInt & mask) === (rangeInt & mask);
    }

    /**
     * Converte IP para inteiro
     */
    private ipToInt(ip: string): number {
        return ip.split(".").reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);
    }

    /**
     * Lista todas as regras
     */
    async getRules(): Promise<IPWhitelistRule[]> {
        return this.rules;
    }
}

export const ipWhitelistService = new IPWhitelistService();

/**
 * Middleware para verificar IP whitelist
 */
export function requireIPWhitelist() {
    return async function middleware(request: NextRequest): Promise<NextResponse | null> {
        const ip =
            (request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "") ||
            request.headers.get("x-real-ip") ||
            "unknown";

        if (!ipWhitelistService.isIPAllowed(ip)) {
            logger.warn("IP blocked by whitelist", {
                ip,
                path: request.nextUrl.pathname,
            });

            await auditService.log({
                action: "ip_blocked",
                userId: "system",
                userRole: "system",
                resource: "api",
                ipAddress: ip,
                metadata: {
                    path: request.nextUrl.pathname,
                    method: request.method,
                },
                status: "FAILURE",
            });

            return NextResponse.json(
                { error: "Access denied - IP not whitelisted" },
                { status: 403 },
            );
        }

        return null;
    };
}

/**
 * EXEMPLO DE USO:
 * 
 * // Adicionar IPs permitidos
 * await ipWhitelistService.addRule({
 *   name: 'Office Network',
 *   ipAddress: '192.168.1.0/24', // Range CIDR
 *   description: 'Company office network',
 *   active: true,
 * });
 * 
 * await ipWhitelistService.addRule({
 *   name: 'VPN Server',
 *   ipAddress: '203.0.113.10', // IP único
 *   active: true,
 * });
 * 
 * // Usar em API route sensível
 * import { requireIPWhitelist } from '@/lib/security/ip-whitelist';
 * import { compose } from '@/lib/auth/middleware';
 * 
 * export async function POST(req: NextRequest) {
 *   const authResult = await compose(
 *     requireIPWhitelist(),
 *     requirePermission(ACTIONS.DELETE, RESOURCES.USERS),
 *   )(req, {});
 *   
 *   if (authResult) return authResult;
 *   
 *   // Lógica sensível
 * }
 * 
 * // Verificar IP manualmente
 * const allowed = ipWhitelistService.isIPAllowed('192.168.1.50');
 */
