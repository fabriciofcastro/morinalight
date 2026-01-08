/**
 * JWT Service com RS256 (Assimétrico)
 * Usa chaves RSA para assinatura e verificação
 */

import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type JwtPayload = {
  sub: string; // userId
  email: string;
  defaultOrgId: string | null;
  iat?: number;
  exp?: number;
  jti?: string; // JWT ID para blacklist
};

let privateKey: string | null = null;
let publicKey: string | null = null;

/**
 * Carrega chaves RSA
 */
function loadKeys(): { privateKey: string; publicKey: string } {
  if (privateKey && publicKey) {
    return { privateKey, publicKey };
  }

  // Tentar carregar de variáveis de ambiente primeiro
  const envPrivateKey = process.env.JWT_PRIVATE_KEY;
  const envPublicKey = process.env.JWT_PUBLIC_KEY;

  if (envPrivateKey && envPublicKey) {
    privateKey = envPrivateKey;
    publicKey = envPublicKey;
    return { privateKey, publicKey };
  }

  // Tentar carregar de arquivos
  try {
    const keysPath = process.env.JWT_KEYS_PATH || join(process.cwd(), "keys");
    privateKey = readFileSync(join(keysPath, "jwt-private.pem"), "utf8");
    publicKey = readFileSync(join(keysPath, "jwt-public.pem"), "utf8");
    return { privateKey, publicKey };
  } catch (error) {
    // Se não encontrar chaves, usar secret como fallback (compatibilidade)
    console.warn(
      "⚠️ [JWT] Chaves RSA não encontradas. Usando JWT_SECRET como fallback (HS256). Configure JWT_PRIVATE_KEY e JWT_PUBLIC_KEY para usar RS256.",
    );
    throw new Error(
      "Chaves RSA não configuradas. Configure JWT_PRIVATE_KEY e JWT_PUBLIC_KEY ou coloque os arquivos jwt-private.pem e jwt-public.pem em ./keys/",
    );
  }
}

/**
 * Gera token JWT usando RS256
 */
export function signToken(
  payload: Omit<JwtPayload, "iat" | "exp" | "jti">,
  expiresIn: string = "15m",
): string {
  try {
    const { privateKey: key } = loadKeys();
    const jti = randomUUID(); // JWT ID para blacklist

    return jwt.sign(
      {
        ...payload,
        jti,
      },
      key,
      {
        algorithm: "RS256",
        expiresIn,
        issuer: "morina-api",
        audience: "morina-web",
      },
    );
  } catch (error) {
    // Fallback para HS256 se RS256 não estiver disponível
    if (error instanceof Error && error.message.includes("Chaves RSA")) {
      console.warn("⚠️ [JWT] Usando HS256 como fallback");
      return jwt.sign(payload, env.JWT_SECRET, {
        algorithm: "HS256",
        expiresIn,
      });
    }
    throw error;
  }
}

/**
 * Verifica e decodifica token JWT usando RS256
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const { publicKey: key } = loadKeys();

    const payload = jwt.verify(token, key, {
      algorithms: ["RS256"],
      issuer: "morina-api",
      audience: "morina-web",
    }) as JwtPayload;

    return payload;
  } catch (error) {
    // Fallback para HS256 se RS256 não estiver disponível
    if (
      error instanceof Error &&
      (error.message.includes("Chaves RSA") || error.message.includes("invalid algorithm"))
    ) {
      try {
        // Bloquear segredo padrão em produção
        if (env.NODE_ENV === "production" && env.JWT_SECRET.includes("change-me")) {
          console.error(
            "🔴 [JWT] ERRO CRÍTICO: Usando JWT_SECRET padrão em PRODUÇÃO. O sistema irá recusar tokens até que um secret forte seja configurado.",
          );
          return null;
        }

        const payload = jwt.verify(token, env.JWT_SECRET, {
          algorithms: ["HS256"],
          issuer: "morina-api", // ✅ Adicionado para validar origem
          audience: "morina-web", // ✅ Adicionado para validar destino
        }) as JwtPayload;
        return payload;
      } catch (err) {
        console.debug("HS256 fallback verification failed:", err);
        return null;
      }
    }
    return null;
  }
}

/**
 * Decodifica token sem verificar (apenas para debug)
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch {
    return null;
  }
}
