import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { normalizeError, scrubSensitiveData } from "@morina/observability";

export function initSentry() {
    const dsn = process.env.SENTRY_DSN;
    const isProduction = process.env.NODE_ENV === "production";

    if (!dsn && isProduction) {
        console.warn("Sentry DSN not found. Sentry is disabled.");
        return;
    }

    if (process.env.SENTRY_ENABLED !== "true" && !isProduction) {
        return;
    }

    Sentry.init({
        dsn,
        environment: process.env.NODE_ENV || "development",
        release: process.env.APP_VERSION || "unknown",
        integrations: [
            nodeProfilingIntegration(),
        ],

        // Tracing
        tracesSampleRate: isProduction ? 0.1 : 1.0,

        // Profiling
        profilesSampleRate: isProduction ? 0.1 : 1.0,

        beforeSend(event) {
            return scrubSensitiveData(event);
        },
    });

    console.log("Sentry initialized for Realtime Service");
}

export function captureException(error: unknown, context?: Record<string, any>) {
    Sentry.captureException(normalizeError(error), {
        extra: context,
    });
}
