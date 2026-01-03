/**
 * Web Vitals Tracking for Performance Monitoring
 * Tracks Core Web Vitals and sends to analytics
 */

import { onCLS, onFID, onFCP, onLCP, onTTFB, Metric } from 'web-vitals';

interface AnalyticsEvent {
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    delta: number;
    id: string;
}

function sendToAnalytics(metric: Metric) {
    const { name, value, rating, delta, id } = metric;

    const event: AnalyticsEvent = {
        name,
        value,
        rating,
        delta,
        id,
    };

    // Send to your analytics endpoint
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
        fetch('/api/analytics/web-vitals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event),
            keepalive: true,
        }).catch(console.error);
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
        console.log(`[Web Vitals] ${name}:`, {
            value: `${Math.round(value)}ms`,
            rating,
            delta: `${Math.round(delta)}ms`,
        });
    }
}

export function initWebVitals() {
    if (typeof window === 'undefined') return;

    try {
        onCLS(sendToAnalytics);
        onFID(sendToAnalytics);
        onFCP(sendToAnalytics);
        onLCP(sendToAnalytics);
        onTTFB(sendToAnalytics);
    } catch (error) {
        console.error('[Web Vitals] Error initializing:', error);
    }
}

// Track custom performance metrics
export function trackCustomMetric(name: string, value: number) {
    if (typeof window === 'undefined') return;

    const metric: Partial<Metric> = {
        name,
        value,
        delta: value,
        id: `custom-${Date.now()}`,
    };

    sendToAnalytics(metric as Metric);
}

// Track page load performance
export function trackPageLoad(pageName: string) {
    if (typeof window === 'undefined') return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (navigation) {
        trackCustomMetric(`${pageName}-dom-content-loaded`,
            navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);

        trackCustomMetric(`${pageName}-load-complete`,
            navigation.loadEventEnd - navigation.loadEventStart);
    }
}
