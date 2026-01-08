import type { FastifyReply, FastifyRequest } from "fastify";
import { TbacService } from "../domain/services/tbac.service";

/**
 * TbacMiddleware - Middleware de Controle Temporal
 * Valida se o usuário pode acessar no horário atual
 */
export class TbacMiddleware {
  constructor(private readonly tbacService: TbacService) {}

  /**
   * Middleware para validar acesso temporal
   */
  async validate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const userId = request.user?.id;

      if (!userId) {
        // Se não há usuário autenticado, deixa passar (será bloqueado por auth middleware)
        return;
      }

      // Verifica se o usuário pode acessar agora
      const allowed = await this.tbacService.isAccessAllowedNow(userId);

      if (!allowed) {
        const activeWindows = await this.tbacService.getActiveTimeWindows(userId);

        let message = "Acesso negado: fora do horário permitido";

        if (activeWindows.length > 0) {
          const nextWindow = activeWindows[0];
          message += `. Próximo horário permitido: ${nextWindow.startTime} - ${nextWindow.endTime}`;
        }

        return reply.status(403).send({
          error: "TBAC_DENIED",
          message,
          code: "OUTSIDE_TIME_WINDOW",
        });
      }

      // Acesso permitido, continua
    } catch (error) {
      console.error("Erro no TbacMiddleware:", error);
      // Em caso de erro, permite acesso (fail-open) para não bloquear sistema
      // TODO: Considerar fail-closed em produção
    }
  }

  /**
   * Factory para criar middleware Fastify
   */
  static create(tbacService: TbacService) {
    const middleware = new TbacMiddleware(tbacService);
    return async (request: FastifyRequest, reply: FastifyReply) => {
      await middleware.validate(request, reply);
    };
  }
}

/**
 * Decorator para rotas que requerem validação TBAC
 */
export function RequireTimeWindow() {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const [request, reply] = args;

      // Valida TBAC
      const tbacService = new TbacService(request.server.prisma);
      const middleware = new TbacMiddleware(tbacService);

      await middleware.validate(request, reply);

      // Se não houve reply (acesso permitido), executa método original
      if (!reply.sent) {
        return originalMethod.apply(this, args);
      }
    };

    return descriptor;
  };
}
