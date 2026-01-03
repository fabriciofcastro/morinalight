import { normalizeError, scrubSensitiveData, SentryConfig } from "@morina/observability";
import * as Sentry from "@sentry/nextjs";

/**
 * Sentry Configuration
 * Centralized configuration using shared observability package
 */
export function getSentryConfig(): SentryConfig {
    const isProduction = process.env.NODE_ENV === "production";

    return {
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "",
        environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || "development",

        // Performance Monitoring - Dynamic sampling
        // Capture 100% of transactions in dev, 10% in prod
        tracesSampleRate: isProduction ? 0.1 : 1.0,

        // Session Replay
        // Capture 0% of regular sessions in dev/prod (to save quota)
        // But capture 100% of sessions with errors
        replaysSessionSampleRate: process.env.SENTRY_REPLAY_SAMPLE_RATE ? parseFloat(process.env.SENTRY_REPLAY_SAMPLE_RATE) : 0,
        replaysOnErrorSampleRate: 1.0,

        enabled: isProduction || process.env.SENTRY_ENABLED === "true",
        release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_APP_VERSION,
    };
}

/**
 * Client Integrations
 */
export function getClientIntegrations() {
    // Only load integrations in browser
    if (typeof window === "undefined") return [];

    return [
        // Replay integration is now configured in sentry.client.config.ts directly
        // but can be extended here if needed
    ];
}

/**
 * Data Scrubbing & Filtering
 */
export function beforeSend(event: Sentry.ErrorEvent, hint: Sentry.EventHint): Sentry.ErrorEvent | null {
    // 1. Scrub sensitive data (LGPD compliance)
    const scrubbedEvent = scrubSensitiveData(event) as Sentry.ErrorEvent;

    // 2. Filter known/noise errors
    const error = hint.originalException;

    // Ignore common network interruptions or extension errors
    const ignoredMessages = [
        "Network request failed",
        "Failed to fetch",
        "Load failed",
        "chrome-extension://",
        "Extension context invalidated"
    ];

    const errorMessage = error instanceof Error ? error.message : typeof error === "string" ? error : "";

    if (ignoredMessages.some(msg => errorMessage.includes(msg))) {
        return null;
    }

    // 3. Add custom context
    if (typeof window !== 'undefined') {
        scrubbedEvent.contexts = {
            ...scrubbedEvent.contexts,
            browser: {
                userAgent: navigator.userAgent,
                language: navigator.language,
            },
        };
    }

    return scrubbedEvent;
}
