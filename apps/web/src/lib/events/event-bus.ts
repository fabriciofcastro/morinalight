/**
 * Event-Driven Architecture - Event Bus
 * 
 * Sistema de eventos para comunicação desacoplada entre módulos
 */

export interface DomainEvent<T = any> {
    eventId: string;
    eventType: string;
    timestamp: Date;
    payload: T;
    metadata?: Record<string, any>;
    userId?: string;
}

export type EventHandler<T = any> = (event: DomainEvent<T>) => Promise<void> | void;

export class EventBus {
    private listeners = new Map<string, Set<EventHandler>>();
    private eventHistory: DomainEvent[] = [];
    private maxHistorySize = 1000;

    /**
     * Registra um listener para um tipo de evento
     */
    on<T = any>(eventType: string, handler: EventHandler<T>): () => void {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, new Set());
        }

        this.listeners.get(eventType)!.add(handler as EventHandler);

        // Retorna função para remover listener
        return () => {
            this.listeners.get(eventType)?.delete(handler as EventHandler);
        };
    }

    /**
     * Registra um listener que executa apenas uma vez
     */
    once<T = any>(eventType: string, handler: EventHandler<T>): void {
        const wrappedHandler: EventHandler<T> = async (event) => {
            await handler(event);
            this.listeners.get(eventType)?.delete(wrappedHandler as EventHandler);
        };

        this.on(eventType, wrappedHandler);
    }

    /**
     * Emite um evento
     */
    async emit<T = any>(eventType: string, payload: T, metadata?: Record<string, any>): Promise<void> {
        const event: DomainEvent<T> = {
            eventId: this.generateEventId(),
            eventType,
            timestamp: new Date(),
            payload,
            metadata,
        };

        // Adicionar ao histórico
        this.addToHistory(event);

        // Notificar listeners
        const handlers = this.listeners.get(eventType);
        if (!handlers || handlers.size === 0) {
            console.warn(`[EventBus] No listeners for event: ${eventType}`);
            return;
        }

        // Executar handlers em paralelo
        const promises = Array.from(handlers).map(async (handler) => {
            try {
                await handler(event);
            } catch (error) {
                console.error(`[EventBus] Error in handler for ${eventType}:`, error);
                // Não propagar erro para não afetar outros handlers
            }
        });

        await Promise.all(promises);
    }

    /**
     * Remove todos os listeners de um tipo de evento
     */
    off(eventType: string): void {
        this.listeners.delete(eventType);
    }

    /**
     * Remove todos os listeners
     */
    clear(): void {
        this.listeners.clear();
    }

    /**
     * Obtém histórico de eventos
     */
    getHistory(eventType?: string): DomainEvent[] {
        if (eventType) {
            return this.eventHistory.filter((e) => e.eventType === eventType);
        }
        return [...this.eventHistory];
    }

    /**
     * Helpers privados
     */
    private generateEventId(): string {
        return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private addToHistory(event: DomainEvent): void {
        this.eventHistory.push(event);

        // Limitar tamanho do histórico
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory.shift();
        }
    }
}

/**
 * Instância global do Event Bus
 */
export const eventBus = new EventBus();

/**
 * Eventos do domínio
 */

// User Events
export const USER_EVENTS = {
    CREATED: "user.created",
    UPDATED: "user.updated",
    DELETED: "user.deleted",
    LOGIN: "user.login",
    LOGOUT: "user.logout",
    PASSWORD_CHANGED: "user.password_changed",
} as const;

// Product Events
export const PRODUCT_EVENTS = {
    CREATED: "product.created",
    UPDATED: "product.updated",
    DELETED: "product.deleted",
    STOCK_CHANGED: "product.stock_changed",
    PRICE_CHANGED: "product.price_changed",
} as const;

// Order Events
export const ORDER_EVENTS = {
    CREATED: "order.created",
    UPDATED: "order.updated",
    CANCELLED: "order.cancelled",
    COMPLETED: "order.completed",
    PAYMENT_RECEIVED: "order.payment_received",
} as const;

/**
 * EXEMPLO DE USO:
 * 
 * // Registrar listeners
 * eventBus.on(USER_EVENTS.CREATED, async (event) => {
 *   await sendWelcomeEmail(event.payload);
 * });
 * 
 * eventBus.on(USER_EVENTS.CREATED, async (event) => {
 *   await auditService.log('user_created', event.payload);
 * });
 * 
 * eventBus.on(USER_EVENTS.CREATED, async (event) => {
 *   await notificationService.notify('New user registered');
 * });
 * 
 * // Emitir evento
 * await eventBus.emit(USER_EVENTS.CREATED, {
 *   userId: '123',
 *   email: 'user@example.com',
 * });
 */
