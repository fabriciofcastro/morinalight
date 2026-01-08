import type { FastifyReply, FastifyRequest } from "fastify";
import type { AdvancedAuditService } from "../domain/services/advanced-audit.service";

/**
 * AuditInterceptor - Interceptor de Auditoria
 * Registra todas as decisões de acesso automaticamente
 */
export class AuditInterceptor {
  constructor(private readonly auditService: AdvancedAuditService) {}

  /**
   * Extrai IP do request
   */
  private getClientIp(request: FastifyRequest): string {
    const forwarded = request.headers["x-forwarded-for"];
    if (forwarded) {
      return (forwarded as string).split(",")[0].trim();
    }
    return (request.headers["x-real-ip"] as string) || request.ip;
  }

  /**
   * Determina o efeito (ALLOW/DENY) baseado no status code
   */
  private getEffect(statusCode: number): "ALLOW" | "DENY" {
    return statusCode >= 200 && statusCode < 400 ? "ALLOW" : "DENY";
  }

  /**
   * Extrai ação e subject da URL
   */
  private parseUrl(method: string, url: string): { action: string; subject: string } {
    // Mapeia método HTTP para ação CASL
    const actionMap: Record<string, string> = {
      GET: "read",
      POST: "create",
      PUT: "update",
      PATCH: "update",
      DELETE: "delete",
    };

    const action = actionMap[method] || method.toLowerCase();

    // Extrai subject da URL (primeiro segmento após /api/)
    const match = url.match(/\/api\/([^/]+)/);
    const subject = match ? match[1] : "unknown";

    return { action, subject };
  }

  /**
   * Interceptor para registrar acessos
   */
  async intercept(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    // Registra após a resposta ser enviada
    reply.addHook("onSend", async (request, reply, payload) => {
      try {
        const userId = request.user?.id;
        const orgId = request.user?.orgId;

        if (!orgId) {
          return payload; // Não audita se não há organização
        }

        const { action, subject } = this.parseUrl(request.method, request.url);
        const effect = this.getEffect(reply.statusCode);
        const ip = this.getClientIp(request);

        // Obtém análise comportamental se disponível
        const behavioralAnalysis = (request as any).behavioralAnalysis;

        // Registra decisão de acesso
        await this.auditService.logAccessDecision({
          orgId,
          userId,
          action,
          subject,
          effect,
          reason: effect === "DENY" ? `Status ${reply.statusCode}` : undefined,
          context: {
            method: request.method,
            url: request.url,
            statusCode: reply.statusCode,
            userAgent: request.headers["user-agent"],
          },
          ipAddress: ip,
          userAgent: request.headers["user-agent"] as string,
          riskScore: behavioralAnalysis?.riskScore || 0,
          anomalies: behavioralAnalysis?.anomalies?.map((a: any) => a.type) || [],
        });
      } catch (error) {
        console.error("Erro ao registrar auditoria:", error);
        // Não bloqueia request em caso de erro de auditoria
      }

      return payload;
    });
  }

  /**
   * Factory para criar interceptor Fastify
   */
  static create(auditService: AdvancedAuditService) {
    const interceptor = new AuditInterceptor(auditService);
    return async (request: FastifyRequest, reply: FastifyReply) => {
      await interceptor.intercept(request, reply);
    };
  }
}
