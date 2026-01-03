/**
 * Analytics Event Tracking
 * Tracks user interactions and conversions
 */

interface AnalyticsEvent {
    event: string;
    category: string;
    action: string;
    label?: string;
    value?: number;
    userId?: string;
    timestamp: string;
}

class Analytics {
    private queue: AnalyticsEvent[] = [];
    private flushInterval: NodeJS.Timeout | null = null;

    constructor() {
        if (typeof window !== 'undefined') {
            this.startFlushInterval();

            // Flush on page unload
            window.addEventListener('beforeunload', () => this.flush());
        }
    }

    /**
     * Track a custom event
     */
    track(event: string, properties?: Record<string, any>) {
        const analyticsEvent: AnalyticsEvent = {
            event,
            category: properties?.category || 'general',
            action: properties?.action || event,
            label: properties?.label,
            value: properties?.value,
            userId: properties?.userId,
            timestamp: new Date().toISOString(),
        };

        this.queue.push(analyticsEvent);

        // Log in development
        if (process.env.NODE_ENV === 'development') {
            console.log('[Analytics]', analyticsEvent);
        }
    }

    /**
     * Track page view
     */
    pageView(pageName: string, properties?: Record<string, any>) {
        this.track('page_view', {
            category: 'navigation',
            action: 'view',
            label: pageName,
            ...properties,
        });
    }

    /**
     * Track CTA click
     */
    ctaClick(ctaName: string, location: string) {
        this.track('cta_click', {
            category: 'engagement',
            action: 'click',
            label: `${ctaName} - ${location}`,
        });
    }

    /**
     * Track form submission
     */
    formSubmit(formName: string, success: boolean) {
        this.track('form_submit', {
            category: 'conversion',
            action: success ? 'success' : 'error',
            label: formName,
            value: success ? 1 : 0,
        });
    }

    /**
     * Track scroll depth
     */
    scrollDepth(percentage: number, pageName: string) {
        this.track('scroll_depth', {
            category: 'engagement',
            action: 'scroll',
            label: pageName,
            value: percentage,
        });
    }

    /**
     * Track video play
     */
    videoPlay(videoName: string, duration?: number) {
        this.track('video_play', {
            category: 'media',
            action: 'play',
            label: videoName,
            value: duration,
        });
    }

    /**
     * Flush events to server
     */
    private async flush() {
        if (this.queue.length === 0) return;

        const events = [...this.queue];
        this.queue = [];

        if (typeof window === 'undefined' || process.env.NODE_ENV !== 'production') {
            return;
        }

        try {
            await fetch('/api/analytics/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ events }),
                keepalive: true,
            });
        } catch (error) {
            console.error('[Analytics] Failed to send events:', error);
            // Re-queue events on failure
            this.queue.unshift(...events);
        }
    }

    /**
     * Start automatic flush interval
     */
    private startFlushInterval() {
        this.flushInterval = setInterval(() => {
            this.flush();
        }, 10000); // Flush every 10 seconds
    }
}

// Singleton instance
export const analytics = new Analytics();

// React hook for analytics
export function useAnalytics() {
    return {
        track: analytics.track.bind(analytics),
        pageView: analytics.pageView.bind(analytics),
        ctaClick: analytics.ctaClick.bind(analytics),
        formSubmit: analytics.formSubmit.bind(analytics),
        scrollDepth: analytics.scrollDepth.bind(analytics),
        videoPlay: analytics.videoPlay.bind(analytics),
    };
}

// Scroll depth tracker
export function initScrollDepthTracking(pageName: string) {
    if (typeof window === 'undefined') return;

    let maxScrollDepth = 0;
    const milestones = [25, 50, 75, 100];
    const tracked = new Set<number>();

    const handleScroll = () => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = window.scrollY;
        const percentage = Math.round((scrolled / scrollHeight) * 100);

        if (percentage > maxScrollDepth) {
            maxScrollDepth = percentage;

            // Track milestones
            milestones.forEach(milestone => {
                if (percentage >= milestone && !tracked.has(milestone)) {
                    tracked.add(milestone);
                    analytics.scrollDepth(milestone, pageName);
                }
            });
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
        window.removeEventListener('scroll', handleScroll);
    };
}
