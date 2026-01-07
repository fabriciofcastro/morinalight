import type { BaseDomainEvent } from '@/domain/events';

/**
 * Event Bus Port
 * 
 * Interface para publicação e subscrição de eventos.
 * Implementação concreta ficará em infrastructure/events.
 */

export interface IEventBus {
  /**
   * Publica um evento
   */
  publish<T extends BaseDomainEvent>(event: T): Promise<void>;

  /**
   * Subscreve a um tipo de evento
   */
  subscribe<T extends BaseDomainEvent>(
    eventName: string,
    handler: (event: T) => Promise<void>
  ): void;

  /**
   * Remove subscrição
   */
  unsubscribe(eventName: string): void;

  /**
   * Limpa todas as subscrições
   */
  clear(): void;
}
