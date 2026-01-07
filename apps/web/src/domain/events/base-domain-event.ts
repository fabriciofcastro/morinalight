/**
 * Base Domain Event
 * 
 * Classe abstrata base para todos os eventos de domínio.
 * Eventos representam fatos que aconteceram no sistema.
 * 
 * Princípios:
 * - Imutável
 * - Sempre no passado (UserCreated, não CreateUser)
 * - Contém dados necessários para reagir ao evento
 */

export abstract class BaseDomainEvent {
  public readonly eventId: string;
  public readonly occurredAt: Date;
  public readonly correlationId?: string;
  public readonly causationId?: string;

  constructor(correlationId?: string, causationId?: string) {
    this.eventId = this.generateEventId();
    this.occurredAt = new Date();
    this.correlationId = correlationId;
    this.causationId = causationId;
  }

  /**
   * Nome do evento (ex: "user.created")
   */
  abstract getEventName(): string;

  /**
   * Dados do evento
   */
  abstract getPayload(): Record<string, unknown>;

  /**
   * Gera ID único para o evento
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Serialização JSON
   */
  toJSON(): Record<string, unknown> {
    return {
      eventId: this.eventId,
      eventName: this.getEventName(),
      occurredAt: this.occurredAt.toISOString(),
      payload: this.getPayload(),
      correlationId: this.correlationId,
      causationId: this.causationId,
    };
  }
}
