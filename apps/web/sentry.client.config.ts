import * as Sentry from "@sentry/nextjs";
import { getSentryConfig, getClientIntegrations, beforeSend } from "@/lib/observability/sentry-config";

const config = getSentryConfig();

if (config.enabled) {
    Sentry.init({
        dsn: config.dsn,
        environment: config.environment,
        release: config.release,

        // Performance Monitoring
        tracesSampleRate: config.tracesSampleRate,

        // Session Replay - Enterprise Grade
        replaysSessionSampleRate: config.replaysSessionSampleRate,
        replaysOnErrorSampleRate: config.replaysOnErrorSampleRate,

        integrations: [
            // Replay Configuration
            Sentry.replayIntegration({
                maskAllText: true,
                blockAllMedia: true,
                networkDetailAllowUrls: [window.location.origin], // Only capture details for own API
            }),
            // Browser Tracing
            Sentry.browserTracingIntegration(),
            // User Feedback Widget Integration
            Sentry.feedbackIntegration({
                colorScheme: "system",
            }),
        ],

        // Hooks
        beforeSend,

        // Filtering
        ignoreErrors: [
            "top.GLOBALS",
            "originalCreateNotification",
            "canvas.contentDocument",
            "MyApp_RemoveAllHighlights",
            "fb_xd_fragment",
            "bmi_SafeAddOnload",
            "EBCallBackMessageReceived",
            "conduitPage",
            // ResizeObserver loop limit exceeded is harmless
            "ResizeObserver loop limit exceeded",
            "ResizeObserver loop completed with undelivered notifications"
        ],
        denyUrls: [
            /extensions\//i,
            /^chrome:\/\//i,
            /^chrome-extension:\/\//i,
        ],
    });
}
