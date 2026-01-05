import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { randomBytes } from "crypto";

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = "csrf-token";
const CSRF_HEADER_NAME = "x-csrf-token";

export class CSRFProtection {
    private tokens = new Map<string, number>(); // token -> timestamp
    private readonly tokenTTL = 60 * 60 * 1000; // 1 hora

    generateToken(): string {
        const token = randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
        this.tokens.set(token, Date.now());

        // Limpar tokens expirados
        this.cleanExpiredTokens();

        return token;
    }

    validateToken(token: string): boolean {
        const timestamp = this.tokens.get(token);

        if (!timestamp) {
            return false;
        }

        const isExpired = Date.now() - timestamp > this.tokenTTL;

        if (isExpired) {
            this.tokens.delete(token);
            return false;
        }

        return true;
    }

    consumeToken(token: string): boolean {
        const isValid = this.validateToken(token);

        if (isValid) {
            this.tokens.delete(token);
        }

        return isValid;
    }

    private cleanExpiredTokens(): void {
        const now = Date.now();

        for (const [token, timestamp] of this.tokens.entries()) {
            if (now - timestamp > this.tokenTTL) {
                this.tokens.delete(token);
            }
        }
    }
}

const csrfProtection = new CSRFProtection();

export async function registerCSRFProtection(app: FastifyInstance) {
    // Rota para obter token CSRF
    app.get("/api/auth/csrf-token", async (_request: FastifyRequest, reply: FastifyReply) => {
        const token = csrfProtection.generateToken();

        reply.setCookie(CSRF_COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60, // 1 hora
        });

        return reply.send({ token });
    });

    // Hook para validar CSRF em rotas protegidas
    app.addHook("preHandler", async (request: FastifyRequest, reply: FastifyReply) => {
        // Apenas validar em métodos que modificam estado
        if (!["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
            return;
        }

        // Rotas que requerem CSRF
        const protectedRoutes = [
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/reset-password",
        ];

        const requiresCSRF = protectedRoutes.some(route => request.url.startsWith(route));

        if (!requiresCSRF) {
            return;
        }

        // Obter token do header ou cookie
        const tokenFromHeader = request.headers[CSRF_HEADER_NAME] as string;
        const tokenFromCookie = request.cookies[CSRF_COOKIE_NAME];

        if (!tokenFromHeader || !tokenFromCookie) {
            return reply.status(403).send({
                error: "CSRF_TOKEN_MISSING",
                message: "Token CSRF ausente. Recarregue a página.",
                code: "CSRF_MISSING",
            });
        }

        if (tokenFromHeader !== tokenFromCookie) {
            return reply.status(403).send({
                error: "CSRF_TOKEN_MISMATCH",
                message: "Token CSRF inválido. Recarregue a página.",
                code: "CSRF_MISMATCH",
            });
        }

        const isValid = csrfProtection.consumeToken(tokenFromHeader);

        if (!isValid) {
            return reply.status(403).send({
                error: "CSRF_TOKEN_INVALID",
                message: "Token CSRF expirado ou inválido. Recarregue a página.",
                code: "CSRF_INVALID",
            });
        }
    });
}
