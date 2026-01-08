/**
 * Token Blacklist Service
 * Gerencia blacklist de tokens revogados usando Redis e Prisma (fallback)
 */

import { getRedisClient, isRedisAvailable } from "../../infra/cache/redis.service";
import { getPrisma } from "../../infra/database/prisma.service";

/**
 * Adiciona token à blacklist
 */
export async function addToBlacklist(tokenId: string, expiresIn: number): Promise<void> {
  const expiresAt = new Date(Date.now() + expiresIn * 1000);

  try {
    // 1. Tentar Redis para performance
    const available = await isRedisAvailable();
    if (available) {
      const redis = getRedisClient();
      const key = `blacklist:${tokenId}`;
      await redis.setex(key, expiresIn, "1");
    }
  } catch (error) {
    console.error("⚠️ [BLACKLIST] Erro ao adicionar no Redis:", error);
  }

  try {
    // 2. Sempre persistir no Banco para consistência e fallback
    const prisma = getPrisma();
    await prisma.tokenBlacklist.upsert({
      where: { tokenId },
      update: { expiresAt },
      create: { tokenId, expiresAt },
    });
  } catch (error) {
    console.error("🔴 [BLACKLIST] ERRO CRÍTICO ao persistir no DB:", error);
    // Se o banco falhar também, temos um problema maior, mas o log registrará
  }
}

/**
 * Verifica se token está na blacklist
 * ESTRATÉGIA: FAIL-SAFE (Se houver erro ou dúvida, assumir que PODE estar blacklisted ou bloquear)
 */
export async function isTokenBlacklisted(tokenId: string): Promise<boolean> {
  try {
    // 1. Checar Redis primeiro
    const available = await isRedisAvailable();
    if (available) {
      const redis = getRedisClient();
      const key = `blacklist:${tokenId}`;
      const result = await redis.get(key);
      if (result === "1") return true;
    }

    // 2. Fallback para Banco se não estiver no Redis ou Redis fora
    const prisma = getPrisma();
    const blacklisted = await prisma.tokenBlacklist.findUnique({
      where: { tokenId },
    });

    if (blacklisted) {
      // Se estava no banco mas não no Redis (ex: restart do Redis), repovoar Redis
      if (available) {
        const remainingSeconds = Math.max(
          0,
          Math.floor((blacklisted.expiresAt.getTime() - Date.now()) / 1000),
        );
        if (remainingSeconds > 0) {
          const redis = getRedisClient();
          await redis.setex(`blacklist:${tokenId}`, remainingSeconds, "1");
        }
      }
      return true;
    }

    return false;
  } catch (error) {
    console.error("🔴 [BLACKLIST] Erro ao verificar blacklist. Aplicando FAIL-SAFE:", error);
    // ⚠️ FAIL-SAFE: Em caso de erro total (Redis + DB), bloqueamos o token por segurança
    // Melhor um falso positivo (deslogar usuário) do que aceitar token revogado
    return true;
  }
}

/**
 * Remove token da blacklist
 */
export async function removeFromBlacklist(tokenId: string): Promise<void> {
  try {
    const available = await isRedisAvailable();
    if (available) {
      const redis = getRedisClient();
      const key = `blacklist:${tokenId}`;
      await redis.del(key);
    }

    const prisma = getPrisma();
    await prisma.tokenBlacklist
      .delete({
        where: { tokenId },
      })
      .catch(() => {}); // Ignorar se não existir
  } catch (error) {
    console.error("Erro ao remover token da blacklist:", error);
  }
}

/**
 * Cleanup de tokens expirados no banco
 * Deve ser chamado periodicamente (ex: via cron)
 */
export async function cleanupExpiredTokens(): Promise<number> {
  try {
    const prisma = getPrisma();
    const result = await prisma.tokenBlacklist.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
    return result.count;
  } catch (error) {
    console.error("Erro no cleanup da blacklist:", error);
    return 0;
  }
}
