/**
 * Event Store - Event Sourcing
 * 
 * Armazena todos os eventos para event sourcing e audit trail
 */

import { type DomainEvent } from "./event-bus";

export interface StoredEvent extends DomainEvent {
    aggregateId?: string;
    aggregateType?: string;
    version: number;
}

export class EventStore {
    private events: StoredEvent[] = [];

    /**
     * Adiciona evento ao store
     */
    async append(event: DomainEvent, aggregateId?: string, aggregateType?: string): Promise<void> {
        const storedEvent: StoredEvent = {
            ...event,
            aggregateId,
            aggregateType,
            version: await this.getNextVersion(aggregateId),
        };

        this.events.push(storedEvent);

        // TODO: Persistir no banco de dados
        // await prisma.eventStore.create({
        //   data: {
        //     eventId: storedEvent.eventId,
        //     eventType: storedEvent.eventType,
        //     aggregateId: storedEvent.aggregateId,
        //     aggregateType: storedEvent.aggregateType,
        //     version: storedEvent.version,
        //     payload: storedEvent.payload,
        //     metadata: storedEvent.metadata,
        //     timestamp: storedEvent.timestamp,
        //   },
        // });
    }

    /**
     * Obtém eventos de um aggregate
     */
    async getEvents(aggregateId: string): Promise<StoredEvent[]> {
        return this.events
            .filter((e) => e.aggregateId === aggregateId)
            .sort((a, b) => a.version - b.version);
    }

    /**
     * Reconstrói estado de um aggregate a partir dos eventos
     */
    async rehydrate<T>(aggregateId: string, initialState: T, reducer: (state: T, event: StoredEvent) => T): Promise<T> {
        const events = await this.getEvents(aggregateId);
        return events.reduce(reducer, initialState);
    }

    /**
     * Obtém próxima versão do aggregate
     */
    private async getNextVersion(aggregateId?: string): Promise<number> {
        if (!aggregateId) return 1;

        const events = await this.getEvents(aggregateId);
        return events.length + 1;
    }
}

export const eventStore = new EventStore();

/**
 * EXEMPLO DE USO:
 * 
 * // Salvar evento
 * await eventStore.append(
 *   {
 *     eventId: '123',
 *     eventType: 'user.created',
 *     timestamp: new Date(),
 *     payload: { userId: '456', email: 'user@example.com' },
 *   },
 *   '456', // aggregateId (userId)
 *   'user' // aggregateType
 * );
 * 
 * // Reconstruir estado
 * const userState = await eventStore.rehydrate(
 *   '456',
 *   { id: '456', email: '', name: '' },
 *   (state, event) => {
 *     switch (event.eventType) {
 *       case 'user.created':
 *         return { ...state, ...event.payload };
 *       case 'user.updated':
 *         return { ...state, ...event.payload };
 *       default:
 *         return state;
 *     }
 *   }
 * );
 */
