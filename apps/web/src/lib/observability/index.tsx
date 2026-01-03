/**
 * Observability Index
 * 
 * Exportações centralizadas de observability utilities
 */

// Web Vitals
export {
    initWebVitals,
    useWebVitals,
    WebVitalsDisplay,
    type WebVitalsMetric,
} from "./web-vitals";

// Logging
export { logger, useLogger, withLogging, LogLevel, type LogContext, type LogEntry } from "./logger";

// Sentry
export {
    getSentryConfig,
    getClientIntegrations,
    beforeSend,
    beforeSendTransaction,
    getCustomTags,
    type SentryConfig,
} from "./sentry-config";
