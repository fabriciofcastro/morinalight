import type { DomainEventBus } from "@morina/shared-kernel";
import { randomUUID } from "node:crypto";

/**
 * Serviço de notificações para prefichas
 * Notifica aprovadores quando uma preficha é encaminhada para aprovação
 */
export class PrefichaNotificationService {
  constructor(private readonly eventBus?: DomainEventBus) {}

  /**
   * Notifica aprovadores quando uma preficha é encaminhada para aprovação
   */
  async notificarAprovadores(
    orgId: string,
    prefichaId: string,
    produtoId: string,
    aprovadoresIds: string[],
    actorId: string,
  ) {
    if (!this.eventBus) {
      return;
    }

    // Publicar evento de notificação para cada aprovador
    await Promise.all(
      aprovadoresIds.map((aprovadorId) =>
        this.eventBus.publish({
          name: "Preficha.NotificacaoAprovador",
          version: "v1",
          metadata: {
            eventId: randomUUID(),
            orgId,
            actorId,
            timestamp: new Date(),
          },
          payload: {
            prefichaId,
            produtoId,
            aprovadorId,
            tipo: "preficha_pendente_aprovacao",
            mensagem: "Uma preficha está aguardando sua aprovação",
          },
        }),
      ),
    );
  }

  /**
   * Notifica quando uma preficha é aprovada
   */
  async notificarAprovacao(
    orgId: string,
    prefichaId: string,
    produtoId: string,
    aprovadorId: string,
    actorId: string,
  ) {
    if (!this.eventBus) {
      return;
    }

    await this.eventBus.publish({
      name: "Preficha.NotificacaoAprovacao",
      version: "v1",
      metadata: {
        eventId: randomUUID(),
        orgId,
        actorId,
        timestamp: new Date(),
      },
      payload: {
        prefichaId,
        produtoId,
        aprovadorId,
        tipo: "preficha_aprovada",
        mensagem: "Preficha foi aprovada",
      },
    });
  }

  /**
   * Notifica quando uma preficha é rejeitada
   */
  async notificarRejeicao(
    orgId: string,
    prefichaId: string,
    produtoId: string,
    motivo: string,
    aprovadorId: string,
    actorId: string,
  ) {
    if (!this.eventBus) {
      return;
    }

    await this.eventBus.publish({
      name: "Preficha.NotificacaoRejeicao",
      version: "v1",
      metadata: {
        eventId: randomUUID(),
        orgId,
        actorId,
        timestamp: new Date(),
      },
      payload: {
        prefichaId,
        produtoId,
        aprovadorId,
        motivo,
        tipo: "preficha_rejeitada",
        mensagem: `Preficha foi rejeitada: ${motivo}`,
      },
    });
  }

  /**
   * Notifica quando um comentário é adicionado
   */
  async notificarComentario(
    orgId: string,
    prefichaId: string,
    produtoId: string,
    comentario: string,
    autorId: string,
    destinatarioId?: string,
  ) {
    if (!this.eventBus) {
      return;
    }

    const destinatarios = destinatarioId ? [destinatarioId] : [];

    await Promise.all(
      destinatarios.map((destinatario) =>
        this.eventBus.publish({
          name: "Preficha.NotificacaoComentario",
          version: "v1",
          metadata: {
            eventId: randomUUID(),
            orgId,
            actorId: autorId,
            timestamp: new Date(),
          },
          payload: {
            prefichaId,
            produtoId,
            destinatarioId: destinatario,
            comentario,
            tipo: "comentario_adicionado",
            mensagem: "Novo comentário adicionado à preficha",
          },
        }),
      ),
    );
  }
}

