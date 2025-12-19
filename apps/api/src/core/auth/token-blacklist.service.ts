/**
 * Token Blacklist Service
 * Gerencia blacklist de tokens revogados usando Redis
 */

import { getRedisClient, isRedisAvailable } from "../../infra/cache/redis.service";

/**
 * Adiciona token à blacklist
 */
export async function addToBlacklist(tokenId: string, expiresIn: number): Promise<void> {
  try {
    const available = await isRedisAvailable();
    if (available) {
      const redis = getRedisClient();
      const key = `blacklist:${tokenId}`;
      await redis.setex(key, expiresIn, "1");
    }
    // Se Redis não estiver disponível, tokens revogados ainda funcionarão até expirar
    // Isso é aceitável como fallback, mas deve ser monitorado
  } catch (error) {
    console.error("Erro ao adicionar token à blacklist:", error);
    // Não falhar a requisição se blacklist falhar
  }
}

/**
 * Verifica se token está na blacklist
 */
export async function isTokenBlacklisted(tokenId: string): Promise<boolean> {
  try {
    const available = await isRedisAvailable();
    if (available) {
      const redis = getRedisClient();
      const key = `blacklist:${tokenId}`;
      const result = await redis.get(key);
      return result === "1";
    }
    return false; // Se Redis não estiver disponível, assumir que não está blacklisted
  } catch (error) {
    console.error("Erro ao verificar blacklist:", error);
    return false; // Em caso de erro, permitir token (fail-open)
  }
}

/**
 * Remove token da blacklist (útil para testes ou revogação de revogação)
 */
export async function removeFromBlacklist(tokenId: string): Promise<void> {
  try {
    const available = await isRedisAvailable();
    if (available) {
      const redis = getRedisClient();
      const key = `blacklist:${tokenId}`;
      await redis.del(key);
    }
  } catch (error) {
    console.error("Erro ao remover token da blacklist:", error);
  }
}

