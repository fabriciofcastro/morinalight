import type { IEventBus } from '@/application/ports';
import type { BaseDomainEvent } from '@/domain/events';

/**
 * In-Memory Event Bus
 * 
 * Implementação em memória do Event Bus.
 * Adequado para desenvolvimento e testes.
 * 
 * Para produção, considerar implementação com Redis/RabbitMQ.
 */

type EventHandler<T extends BaseDomainEvent> = (event: T) => Promise<void>;

export class InMemoryEventBus implements IEventBus {
  private handlers = new Map<string, Array<EventHandler<any>>>();
  private eventHistory: BaseDomainEvent[] = [];
  private readonly maxHistorySize = 1000;

  async publish<T extends BaseDomainEvent>(event: T): Promise<void> {
    const eventName = event.getEventName();
    
    // Adicionar ao histórico
    this.addToHistory(event);

    // Buscar handlers
    const handlers = this.handlers.get(eventName) || [];

    if (handlers.length === 0) {
      console.warn(`[EventBus] No handlers registered for event: ${eventName}`);
      return;
    }

    // Executar handlers em paralelo
    await Promise.all(
      handlers.map(async (handler) => {
        try {
          await handler(event);
        } catch (error) {
          console.error(`[EventBus] Error in handler for ${eventName}:`, error);
          // Não propagar erro para não afetar outros handlers
        }
      })
    );
  }

  subscribe<T extends BaseDomainEvent>(
    eventName: string,
    handler: EventHandler<T>
  ): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }

    this.handlers.get(eventName)!.push(handler);
  }

  unsubscribe(eventName: string): void {
    this.handlers.delete(eventName);
  }

  clear(): void {
    this.handlers.clear();
    this.eventHistory = [];
  }

  /**
   * Métodos auxiliares
   */

  getHistory(eventName?: string): BaseDomainEvent[] {
    if (eventName) {
      return this.eventHistory.filter((e) => e.getEventName() === eventName);
    }
    return [...this.eventHistory];
  }

  private addToHistory(event: BaseDomainEvent): void {
    this.eventHistory.push(event);

    // Limitar tamanho do histórico
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }
}
