/**
 * Patterns Index - Centralized Exports
 */

// Auth Strategy
export {
    EmailPasswordStrategy,
    OAuth2Strategy,
    SSOStrategy,
    AuthContext,
    AuthStrategyFactory,
    type AuthStrategy,
    type AuthCredentials,
    type AuthResult,
} from "./auth-strategy";

// Notification Strategy
export {
    EmailNotificationStrategy,
    SMSNotificationStrategy,
    PushNotificationStrategy,
    InAppNotificationStrategy,
    WebhookNotificationStrategy,
    NotificationService,
    notificationService,
    type NotificationStrategy,
    type NotificationPayload,
    type NotificationResult,
} from "./notification-strategy";
