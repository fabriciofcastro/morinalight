/**
 * Blocked IP Service
 * Gerencia o bloqueio de IPs suspeitos com cache em Redis para performance
 */

import { getPrisma } from "../../../../infra/database/prisma.service";
import { getRedisClient } from "../../../../infra/cache/redis.service";

const prisma = getPrisma();
const REDIS_BLOCK_PREFIX = "sec:block:ip:";

export class BlockedIpService {
    /**
     * Bloqueia um IP
     */
    async blockIp(ip: string, reason?: string, expiresAt?: Date, createdBy?: string): Promise<void> {
        // 1. Salvar no Banco
        await prisma.blockedIP.upsert({
            where: { ip },
            create: {
                ip,
                reason,
                expiresAt,
                createdBy
            },
            update: {
                reason,
                blockedAt: new Date(),
                expiresAt,
                createdBy
            }
        });

        // 2. Sincronizar com Redis
        const redis = getRedisClient();
        if (expiresAt) {
            const ttl = Math.max(1, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
            await redis.set(`${REDIS_BLOCK_PREFIX}${ip}`, "1", "EX", ttl);
        } else {
            await redis.set(`${REDIS_BLOCK_PREFIX}${ip}`, "1");
        }
    }

    /**
     * Desbloqueia um IP
     */
    async unblockIp(ip: string): Promise<void> {
        // 1. Remover do Banco (use deleteMany to avoid error if not exists)
        await prisma.blockedIP.deleteMany({ where: { ip } });

        // 2. Remover do Redis
        const redis = getRedisClient();
        await redis.del(`${REDIS_BLOCK_PREFIX}${ip}`);
    }

    /**
     * Verifica se um IP está bloqueado (Fast Path usando Redis)
     */
    async isIpBlocked(ip: string): Promise<boolean> {
        const redis = getRedisClient();
        const cached = await redis.get(`${REDIS_BLOCK_PREFIX}${ip}`);

        if (cached) return true;

        // Fallback para o Banco (caso o Redis tenha caído ou o cache expirado mas o registro ainda exista no DB)
        const dbRecord = await prisma.blockedIP.findUnique({
            where: { ip }
        });

        if (dbRecord) {
            // Se expirado no DB, removemos
            if (dbRecord.expiresAt && dbRecord.expiresAt < new Date()) {
                await this.unblockIp(ip);
                return false;
            }

            // Re-popula o cache
            await this.syncToRedis(ip, dbRecord.expiresAt);
            return true;
        }

        return false;
    }

    /**
     * Lista todos os IPs bloqueados
     */
    async listBlockedIps() {
        return prisma.blockedIP.findMany({
            orderBy: { blockedAt: "desc" }
        });
    }

    /**
     * Sincroniza um IP específico para o Redis
     */
    private async syncToRedis(ip: string, expiresAt: Date | null): Promise<void> {
        const redis = getRedisClient();
        if (expiresAt) {
            const ttl = Math.max(1, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
            await redis.set(`${REDIS_BLOCK_PREFIX}${ip}`, "1", "EX", ttl);
        } else {
            await redis.set(`${REDIS_BLOCK_PREFIX}${ip}`, "1");
        }
    }

    /**
     * Warmup: Sincroniza todos os IPs ativos no DB para o Redis (chamar no startup)
     */
    async warmupCache(): Promise<void> {
        const activeBlocks = await prisma.blockedIP.findMany({
            where: {
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } }
                ]
            }
        });

        for (const block of activeBlocks) {
            await this.syncToRedis(block.ip, block.expiresAt);
        }
    }
}

export const blockedIpService = new BlockedIpService();
