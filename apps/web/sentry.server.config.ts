import * as Sentry from "@sentry/nextjs";
import { getSentryConfig, beforeSend } from "@/lib/observability/sentry-config";

const config = getSentryConfig();

if (config.enabled) {
    Sentry.init({
        dsn: config.dsn,
        environment: config.environment,
        release: config.release,

        // Performance Monitoring
        tracesSampleRate: config.tracesSampleRate,

        // Filtering
        beforeSend,

        // Ignore common network errors that are not app bugs
        ignoreErrors: [
            "ECONNREFUSED",
            "ENOTFOUND",
            "ETIMEDOUT",
            "Network request failed"
        ],
    });
}
