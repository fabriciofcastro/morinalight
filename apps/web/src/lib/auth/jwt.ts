/**
 * JWT Token Management
 * 
 * Sistema completo de geração e validação de JWT tokens
 */

import jwt from "jsonwebtoken";
import { type UserWithPermissions } from "@/lib/auth/rbac";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const JWT_EXPIRES_IN = "15m"; // Access token: 15 minutos
const JWT_REFRESH_EXPIRES_IN = "7d"; // Refresh token: 7 dias

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
    throw new Error("JWT secrets not configured");
}

export interface TokenPayload {
    userId: string;
    email: string;
    role: string;
    type: "access" | "refresh";
}

/**
 * Gera access token
 */
export function generateAccessToken(user: UserWithPermissions): string {
    const payload: TokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        type: "access",
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
        issuer: "morinalight",
        audience: "morinalight-api",
    });
}

/**
 * Gera refresh token
 */
export function generateRefreshToken(user: UserWithPermissions): string {
    const payload: TokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        type: "refresh",
    };

    return jwt.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRES_IN,
        issuer: "morinalight",
        audience: "morinalight-api",
    });
}

/**
 * Valida access token
 */
export function verifyAccessToken(token: string): TokenPayload {
    try {
        const decoded = jwt.verify(token, JWT_SECRET, {
            issuer: "morinalight",
            audience: "morinalight-api",
        }) as TokenPayload;

        if (decoded.type !== "access") {
            throw new Error("Invalid token type");
        }

        return decoded;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error("Token expired");
        }
        if (error instanceof jwt.JsonWebTokenError) {
            throw new Error("Invalid token");
        }
        throw error;
    }
}

/**
 * Valida refresh token
 */
export function verifyRefreshToken(token: string): TokenPayload {
    try {
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
            issuer: "morinalight",
            audience: "morinalight-api",
        }) as TokenPayload;

        if (decoded.type !== "refresh") {
            throw new Error("Invalid token type");
        }

        return decoded;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error("Refresh token expired");
        }
        if (error instanceof jwt.JsonWebTokenError) {
            throw new Error("Invalid refresh token");
        }
        throw error;
    }
}

/**
 * Decodifica token sem validar (para debug)
 */
export function decodeToken(token: string): TokenPayload | null {
    try {
        return jwt.decode(token) as TokenPayload;
    } catch {
        return null;
    }
}

/**
 * Verifica se token está expirado
 */
export function isTokenExpired(token: string): boolean {
    const decoded = decodeToken(token);
    if (!decoded) return true;

    const exp = (decoded as any).exp;
    if (!exp) return true;

    return Date.now() >= exp * 1000;
}

/**
 * EXEMPLO DE USO:
 * 
 * // Login - Gerar tokens
 * const accessToken = generateAccessToken(user);
 * const refreshToken = generateRefreshToken(user);
 * 
 * // Armazenar em httpOnly cookies
 * response.cookies.set('auth-token', accessToken, {
 *   httpOnly: true,
 *   secure: true,
 *   sameSite: 'strict',
 *   maxAge: 15 * 60, // 15 minutos
 * });
 * 
 * response.cookies.set('refresh-token', refreshToken, {
 *   httpOnly: true,
 *   secure: true,
 *   sameSite: 'strict',
 *   maxAge: 7 * 24 * 60 * 60, // 7 dias
 * });
 * 
 * // Validar token
 * try {
 *   const payload = verifyAccessToken(token);
 *   const user = await userRepository.findById(payload.userId);
 * } catch (error) {
 *   // Token inválido ou expirado
 *   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 * }
 * 
 * // Refresh token
 * try {
 *   const payload = verifyRefreshToken(refreshToken);
 *   const user = await userRepository.findById(payload.userId);
 *   const newAccessToken = generateAccessToken(user);
 *   // Retornar novo access token
 * } catch (error) {
 *   // Refresh token inválido - fazer login novamente
 * }
 */

/**
 * Configuração de ambiente necessária:
 * 
 * .env:
 * JWT_SECRET=your-very-long-and-random-secret-here
 * JWT_REFRESH_SECRET=your-different-very-long-secret-here
 * 
 * Gerar secrets:
 * node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
 */
