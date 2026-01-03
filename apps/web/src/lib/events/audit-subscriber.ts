import { eventBus, USER_EVENTS, type DomainEvent } from "./event-bus";
import { auditService } from "@/lib/audit/audit-service";

/**
 * Validates and transforms DomainEvent into Audit Log
 */
export function setupAuditSubscribers() {
    console.log("[AuditSubscriber] Initializing subscriptions...");

    // Subscriber: User Created
    eventBus.on(USER_EVENTS.CREATED, async (event: DomainEvent) => {
        await auditService.log({
            action: "USER_CREATED",
            userId: event.userId || "SYSTEM",
            userRole: "SYSTEM", // Usually created by system or admin
            resource: "User",
            resourceId: event.payload.id || "unknown",
            status: "SUCCESS",
            metadata: {
                eventId: event.eventId,
                timestamp: event.timestamp,
            }
        });
    });

    // Subscriber: User Updated
    eventBus.on(USER_EVENTS.UPDATED, async (event: DomainEvent) => {
        await auditService.log({
            action: "USER_UPDATED",
            userId: event.userId || "SYSTEM",
            userRole: "SYSTEM",
            resource: "User",
            resourceId: event.payload.id,
            changes: event.payload.changes,
            status: "SUCCESS",
        });
    });

    // Subscriber: User Deleted
    eventBus.on(USER_EVENTS.DELETED, async (event: DomainEvent) => {
        await auditService.log({
            action: "USER_DELETED",
            userId: event.userId || "SYSTEM",
            userRole: "SYSTEM",
            resource: "User",
            resourceId: event.payload.id,
            status: "SUCCESS",
        });
    });

    // Subscriber: Login
    eventBus.on(USER_EVENTS.LOGIN, async (event: DomainEvent) => {
        await auditService.log({
            action: "USER_LOGIN_SUCCESS",
            userId: event.payload.userId,
            userRole: "USER",
            resource: "Auth",
            status: "SUCCESS"
        });
    });

    console.log("[AuditSubscriber] Subscriptions setup complete.");
}
