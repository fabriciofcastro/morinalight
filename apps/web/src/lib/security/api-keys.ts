/**
 * API Key Management
 * 
 * Sistema de gerenciamento de API keys para integrações externas
 */

import crypto from "crypto";
import { auditService } from "@/lib/audit/audit-service";

export interface APIKey {
    id: string;
    name: string;
    key: string; // Apenas retornado na criação
    hashedKey: string;
    userId: string;
    permissions: string[];
    rateLimit: number; // requests per minute
    expiresAt?: Date;
    lastUsedAt?: Date;
    active: boolean;
    createdAt: Date;
}

export class APIKeyService {
    /**
     * Gera nova API key
     */
    async generateAPIKey(
        userId: string,
        name: string,
        permissions: string[],
        rateLimit: number = 100,
        expiresInDays?: number,
    ): Promise<{ key: string; apiKey: APIKey }> {
        // Gerar key aleatória
        const key = `mk_${crypto.randomBytes(32).toString("hex")}`;

        // Hash da key para armazenamento
        const bcrypt = await import("bcryptjs");
        const hashedKey = await bcrypt.hash(key, 10);

        // Calcular expiração
        const expiresAt = expiresInDays
            ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
            : undefined;

        const apiKey: APIKey = {
            id: crypto.randomUUID(),
            name,
            key, // Apenas retornado aqui
            hashedKey,
            userId,
            permissions,
            rateLimit,
            expiresAt,
            active: true,
            createdAt: new Date(),
        };

        // Salvar no banco
        // await prisma.apiKey.create({
        //   data: {
        //     id: apiKey.id,
        //     name: apiKey.name,
        //     hashedKey: apiKey.hashedKey,
        //     userId: apiKey.userId,
        //     permissions: apiKey.permissions,
        //     rateLimit: apiKey.rateLimit,
        //     expiresAt: apiKey.expiresAt,
        //     active: apiKey.active,
        //   },
        // });

        // Audit log
        await auditService.log({
            action: "api_key_created",
            userId,
            resource: "api_key",
            resourceId: apiKey.id,
            metadata: { name, permissions, rateLimit },
            success: true,
        });

        return { key, apiKey };
    }

    /**
     * Valida API key
     */
    async validateAPIKey(providedKey: string): Promise<APIKey | null> {
        if (!providedKey || !providedKey.startsWith("mk_")) {
            return null;
        }

        // Buscar todas as keys ativas
        // const keys = await prisma.apiKey.findMany({
        //   where: { active: true },
        // });

        const mockKeys: APIKey[] = []; // TODO: usar keys reais

        const bcrypt = await import("bcryptjs");

        for (const key of mockKeys) {
            // Verificar se expirou
            if (key.expiresAt && key.expiresAt < new Date()) {
                continue;
            }

            // Comparar hash
            const isValid = await bcrypt.compare(providedKey, key.hashedKey);

            if (isValid) {
                // Atualizar lastUsedAt
                // await prisma.apiKey.update({
                //   where: { id: key.id },
                //   data: { lastUsedAt: new Date() },
                // });

                // Audit log
                await auditService.log({
                    action: "api_key_used",
                    userId: key.userId,
                    resource: "api",
                    resourceId: key.id,
                    success: true,
                });

                return key;
            }
        }

        // Key inválida - audit log
        await auditService.log({
            action: "api_key_invalid",
            userId: "system",
            resource: "api",
            metadata: { providedKey: providedKey.substring(0, 10) + "..." },
            success: false,
        });

        return null;
    }

    /**
     * Revoga API key
     */
    async revokeAPIKey(keyId: string, userId: string): Promise<void> {
        // await prisma.apiKey.update({
        //   where: { id: keyId },
        //   data: { active: false },
        // });

        await auditService.log({
            action: "api_key_revoked",
            userId,
            resource: "api_key",
            resourceId: keyId,
            success: true,
        });
    }

    /**
     * Lista API keys do usuário
     */
    async listUserAPIKeys(userId: string): Promise<Omit<APIKey, "key" | "hashedKey">[]> {
        // const keys = await prisma.apiKey.findMany({
        //   where: { userId },
        //   select: {
        //     id: true,
        //     name: true,
        //     permissions: true,
        //     rateLimit: true,
        //     expiresAt: true,
        //     lastUsedAt: true,
        //     active: true,
        //     createdAt: true,
        //   },
        // });

        return [];
    }

    /**
     * Verifica permissão da API key
     */
    hasPermission(apiKey: APIKey, permission: string): boolean {
        return apiKey.permissions.includes(permission) || apiKey.permissions.includes("*");
    }

    /**
     * Verifica rate limit
     */
    async checkRateLimit(apiKey: APIKey): Promise<boolean> {
        // Buscar uso nos últimos 60 segundos
        const oneMinuteAgo = new Date(Date.now() - 60000);

        // const recentUsage = await prisma.apiKeyUsage.count({
        //   where: {
        //     apiKeyId: apiKey.id,
        //     timestamp: { gte: oneMinuteAgo },
        //   },
        // });

        const recentUsage = 0; // TODO: implementar

        return recentUsage < apiKey.rateLimit;
    }
}

export const apiKeyService = new APIKeyService();

/**
 * Middleware para validar API key
 */
export async function requireAPIKey(requiredPermission?: string) {
    return async (req: any) => {
        const apiKey = req.headers.get("x-api-key");

        if (!apiKey) {
            return { error: "API key required", status: 401 };
        }

        const validKey = await apiKeyService.validateAPIKey(apiKey);

        if (!validKey) {
            return { error: "Invalid API key", status: 401 };
        }

        // Verificar permissão
        if (requiredPermission && !apiKeyService.hasPermission(validKey, requiredPermission)) {
            return { error: "Insufficient permissions", status: 403 };
        }

        // Verificar rate limit
        const withinLimit = await apiKeyService.checkRateLimit(validKey);

        if (!withinLimit) {
            return { error: "Rate limit exceeded", status: 429 };
        }

        // Adicionar info da key ao request
        (req as any).apiKey = validKey;

        return null; // OK
    };
}

/**
 * EXEMPLO DE USO:
 * 
 * // Gerar API key
 * const { key, apiKey } = await apiKeyService.generateAPIKey(
 *   userId,
 *   'Integration with ERP',
 *   ['products:read', 'products:write', 'orders:read'],
 *   1000, // 1000 req/min
 *   365 // expira em 1 ano
 * );
 * 
 * // Mostrar key UMA VEZ para o usuário
 * console.log('API Key:', key);
 * console.log('SAVE THIS KEY! It will not be shown again.');
 * 
 * // Usar em API route
 * export async function GET(req: NextRequest) {
 *   const authResult = await requireAPIKey('products:read')(req);
 *   if (authResult) {
 *     return NextResponse.json(authResult, { status: authResult.status });
 *   }
 *   
 *   // Lógica da API
 *   const products = await getProducts();
 *   return NextResponse.json(products);
 * }
 * 
 * // Cliente externo
 * fetch('https://api.morinalight.com/products', {
 *   headers: {
 *     'X-API-Key': 'mk_abc123...',
 *   },
 * });
 */
