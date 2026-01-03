/**
 * Events Index - Centralized Exports
 */

// Event Bus
export {
    EventBus,
    eventBus,
    USER_EVENTS,
    PRODUCT_EVENTS,
    ORDER_EVENTS,
    type DomainEvent,
    type EventHandler,
} from "./event-bus";

// Event Store
export {
    EventStore,
    eventStore,
    type StoredEvent,
} from "./event-store";

// Event Handlers (auto-register on import)
import "./event-handlers";
