/**
 * MFA Login Verification Route
 * 
 * POST /api/auth/login/verify-mfa
 * Verifica código MFA após login bem-sucedido
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyMFAToken, verifyBackupCode } from "@/lib/auth/mfa";
import { getPrismaClient } from "@/lib/prisma";
import { logger } from "@/lib/observability";
import { Role } from "@/lib/auth/rbac";
import { z } from "zod";
import { intrusionDetector } from "@/lib/security/intrusion-detection";

const schema = z.object({
    email: z.string().email(),
    token: z.string().min(6).max(8), // 6 dígitos TOTP ou 8 caracteres backup code
    isBackupCode: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
    // 1. Aplicar Rate Limit Estrito (5 tentativas por minuto para evitar força bruta)
    const { rateLimitMiddleware } = await import("@/lib/middleware/security-middleware");
    const limiter = rateLimitMiddleware({
        maxRequests: 5,
        windowMs: 60 * 1000,
        keyGenerator: (req) => {
            // Rate limit por IP e Email (se disponível no body, mas body é stream...)
            // Melhor usar IP por enquanto para proteger o endpoint
            return req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
        }
    });

    const limitResult = await limiter(request, {});
    if (limitResult) return limitResult;

    try {
        const body = await request.json();
        const parsed = schema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid request data" },
                { status: 400 }
            );
        }

        const { email, token, isBackupCode } = parsed.data;

        // Buscar usuário
        const prisma = await getPrismaClient();

        if (!prisma) {
            return NextResponse.json(
                { error: "Database unavailable" },
                { status: 503 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                twoFactorEnabled: true,
                twoFactorSecret: true,
                twoFactorBackupCodes: true,
                blockedUntil: true,
                memberships: {
                    select: {
                        role: true,
                        organizationId: true,
                    },
                    take: 1,
                },
            },
        });

        if (!user) {
            // Log discreto para não enumerar usuários
            logger.warn("MFA attempt for non-existent user", { email });
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        // Verificar se usuário está bloqueado
        if (user.blockedUntil && new Date(user.blockedUntil) > new Date()) {
            return NextResponse.json(
                {
                    error: "Account temporarily blocked",
                    blockedUntil: user.blockedUntil,
                },
                { status: 403 }
            );
        }

        // Verificar se MFA está habilitado
        if (!user.twoFactorEnabled || !user.twoFactorSecret) {
            return NextResponse.json(
                { error: "MFA not enabled for this account" },
                { status: 400 }
            );
        }

        let isValid = false;

        // Verificar backup code
        if (isBackupCode) {
            if (!user.twoFactorBackupCodes) {
                return NextResponse.json(
                    { error: "No backup codes available" },
                    { status: 400 }
                );
            }

            try {
                // Parsing robusto para corrigir problema detectado
                let backupCodes: string[] = [];
                try {
                    backupCodes = JSON.parse(user.twoFactorBackupCodes);
                } catch {
                    // Fallback se não for JSON válido
                    backupCodes = [];
                }

                if (!Array.isArray(backupCodes)) {
                    backupCodes = [];
                }

                // Verificar cada backup code hasheado
                for (let i = 0; i < backupCodes.length; i++) {
                    const matches = await verifyBackupCode(token, backupCodes[i]);

                    if (matches) {
                        isValid = true;

                        // Remover código usado
                        backupCodes.splice(i, 1);

                        await prisma.user.update({
                            where: { id: user.id },
                            data: {
                                twoFactorBackupCodes: JSON.stringify(backupCodes),
                            },
                        });

                        logger.info("Backup code used for MFA", {
                            userId: user.id,
                            remainingCodes: backupCodes.length,
                        });

                        break;
                    }
                }
            } catch (error) {
                logger.error("Failed to verify backup code", error as Error);
            }
        }
        // Verificar TOTP
        else {
            isValid = verifyMFAToken(token, user.twoFactorSecret);
        }

        if (!isValid) {
            logger.warn("Invalid MFA token", {
                userId: user.id,
                isBackupCode,
            });

            // Criar Alerta de Segurança via IDS para geolocalização automática
            const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
            try {
                await intrusionDetector.createAlert({
                    userId: user.id,
                    alertType: "MFA_FAILED",
                    severity: "medium",
                    description: `Failed MFA attempt (${isBackupCode ? "Backup Code" : "TOTP"})`,
                    ipAddress: ip,
                    metadata: {
                        userAgent: request.headers.get("user-agent"),
                    },
                    timestamp: new Date(),
                });
            } catch (alertError) {
                logger.error("Failed to create security alert", alertError as Error);
            }

            return NextResponse.json(
                { error: "Invalid verification code" },
                { status: 401 }
            );
        }

        // MFA verificado com sucesso
        // Atualizar último IP de login
        const ip =
            request.headers.get("x-forwarded-for")?.split(",")[0] ||
            request.headers.get("x-real-ip") ||
            "unknown";

        // Buscar usuário completo para gerar o token com role
        const fullUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                id: true,
                email: true,
                displayName: true,
                memberships: {
                    select: {
                        role: true
                    },
                    take: 1
                }
            }
        });

        if (!fullUser) {
            return NextResponse.json({ error: "User data lost" }, { status: 500 });
        }

        // Definir papel (role) - assumindo o primeiro membership ou 'user' como fallback
        const userRole = (fullUser.memberships[0]?.role as Role) || 'user';

        await prisma.user.update({
            where: { id: user.id },
            data: {
                lastLoginAt: new Date(),
                lastLoginIp: ip,
            },
        });

        // Analisar segurança e detectar viagem impossível
        try {
            await intrusionDetector.detectImpossibleTravel(user.id, ip);
            await intrusionDetector.analyzeUserSecurity(user.id);
        } catch (idsError) {
            logger.error("IDS Analysis failed", idsError as Error);
        }

        // Registrar/Atualizar Dispositivo Confiável
        try {
            const userAgent = request.headers.get("user-agent") || "unknown";
            const deviceIdBase = `${ip}-${userAgent}`;
            const crypto = await import("crypto");
            const deviceId = crypto.createHash("sha256").update(deviceIdBase).digest("hex");

            await prisma.trustedDevice.upsert({
                where: {
                    userId_deviceId: {
                        userId: user.id,
                        deviceId: deviceId,
                    }
                },
                update: {
                    lastUsed: new Date(),
                    ip: ip,
                },
                create: {
                    userId: user.id,
                    deviceId: deviceId,
                    name: userAgent.substring(0, 50), // Nome simplificado
                    browser: userAgent.split(" ")[0]?.substring(0, 50),
                    os: "Detected from UA",
                    ip: ip,
                }
            });
        } catch (deviceError) {
            logger.error("Failed to register trusted device", deviceError as Error);
            // Não bloqueia o login se falhar ao registrar dispositivo
        }

        // Gerar JWT tokens reais
        const { generateAccessToken, generateRefreshToken } = await import("@/lib/auth/jwt");

        const userForToken = {
            id: fullUser.id,
            email: fullUser.email,
            role: userRole,
        };

        const accessToken = generateAccessToken(userForToken);
        const refreshToken = generateRefreshToken(userForToken);

        // Definir cookies de sessão autenticada
        const cookieStore = await cookies();

        // Access Token
        cookieStore.set("auth_token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60, // 15 minutos (alinhado com lib/auth/jwt.ts)
            path: "/",
        });

        // Refresh Token
        cookieStore.set("refresh_token", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60, // 7 dias
            path: "/",
        });

        // Marcar MFA como verificado via cookie (opcional, mas mantido para compatibilidade se necessário)
        cookieStore.set("mfa_verified", "true", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 1 * 60 * 60, // 1 hora
            path: "/",
        });

        return NextResponse.json({
            success: true,
            user: {
                id: fullUser.id,
                email: fullUser.email,
                displayName: fullUser.displayName,
                role: userRole
            },
            message: "MFA verification successful",
        });
    } catch (error) {
        logger.error("MFA verification failed", error as Error);

        return NextResponse.json(
            { error: "Verification failed" },
            { status: 500 }
        );
    }
}
