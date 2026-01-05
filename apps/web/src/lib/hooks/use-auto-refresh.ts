import { useEffect, useRef, useCallback } from 'react';

export interface UseAutoRefreshOptions {
    /**
     * Refresh interval in milliseconds
     * @default 60000 (1 minute)
     */
    interval?: number;

    /**
     * Whether auto-refresh is enabled
     * @default true
     */
    enabled?: boolean;

    /**
     * Callback function to execute on each refresh
     */
    onRefresh: () => void | Promise<void>;
}

/**
 * Hook for auto-refreshing data at regular intervals
 * 
 * @example
 * ```tsx
 * useAutoRefresh({
 *   interval: 30000, // 30 seconds
 *   enabled: true,
 *   onRefresh: async () => {
 *     await loadAnalyticsData();
 *   }
 * });
 * ```
 */
export function useAutoRefresh({
    interval = 60000,
    enabled = true,
    onRefresh
}: UseAutoRefreshOptions) {
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const onRefreshRef = useRef(onRefresh);

    // Keep onRefresh reference up to date
    useEffect(() => {
        onRefreshRef.current = onRefresh;
    }, [onRefresh]);

    const startRefresh = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(() => {
            onRefreshRef.current();
        }, interval);
    }, [interval]);

    const stopRefresh = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (enabled) {
            startRefresh();
        } else {
            stopRefresh();
        }

        return () => {
            stopRefresh();
        };
    }, [enabled, startRefresh, stopRefresh]);

    return {
        startRefresh,
        stopRefresh,
        isActive: enabled && intervalRef.current !== null
    };
}

/**
 * Hook for manual refresh with loading state
 */
export function useManualRefresh(onRefresh: () => Promise<void>) {
    const [isRefreshing, setIsRefreshing] = React.useState(false);

    const refresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await onRefresh();
        } finally {
            setIsRefreshing(false);
        }
    }, [onRefresh]);

    return {
        refresh,
        isRefreshing
    };
}

// Import React for useState
import React from 'react';
