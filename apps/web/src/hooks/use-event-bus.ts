import { eventBus, type EventHandler } from "@/lib/events";
import { useCallback, useEffect } from "react";

/**
 * Hook to consume the Event Bus in React components.
 * Automatically handles subscription cleanup.
 *
 * @example
 * // Emit event
 * const { emit } = useEventBus();
 * emit(USER_EVENTS.CREATED, { id: 1 });
 *
 * // Subscribe (in a component)
 * useEventBus(USER_EVENTS.CREATED, (event) => {
 *   console.log('User created:', event.payload);
 * });
 */
export function useEventBus<T = any>(
    eventType?: string,
    handler?: EventHandler<T>
) {
    // Subscribe if eventType and handler are provided
    useEffect(() => {
        if (eventType && handler) {
            const unsubscribe = eventBus.on(eventType, handler);
            return () => {
                unsubscribe();
            };
        }
        return undefined;
    }, [eventType, handler]);

    // Stable emit function
    const emit = useCallback(
        async (type: string, payload: T, metadata?: Record<string, any>) => {
            await eventBus.emit(type, payload, metadata);
        },
        []
    );

    return { emit, eventBus };
}
