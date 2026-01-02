/**
 * Performance Monitoring Hooks
 * 
 * Hooks para monitorar performance de componentes
 */

import { useEffect, useRef, useCallback } from "react";

/**
 * Hook para medir tempo de render
 */
export function useRenderTime(componentName: string) {
    const renderStartTime = useRef(performance.now());

    useEffect(() => {
        const renderTime = performance.now() - renderStartTime.current;

        if (process.env.NODE_ENV === "development") {
            console.log(`[Render Time] ${componentName}: ${renderTime.toFixed(2)}ms`);

            // Avisar se render demorou muito
            if (renderTime > 16) {
                // 16ms = 60fps
                console.warn(
                    `[Performance Warning] ${componentName} took ${renderTime.toFixed(2)}ms to render (> 16ms)`,
                );
            }
        }

        renderStartTime.current = performance.now();
    });
}

/**
 * Hook para medir performance de funções
 */
export function usePerformanceMark() {
    const mark = useCallback((name: string) => {
        if (typeof performance !== "undefined") {
            performance.mark(name);
        }
    }, []);

    const measure = useCallback((name: string, startMark: string, endMark: string) => {
        if (typeof performance !== "undefined") {
            try {
                performance.measure(name, startMark, endMark);
                const measure = performance.getEntriesByName(name)[0];

                if (process.env.NODE_ENV === "development") {
                    console.log(`[Performance] ${name}: ${measure.duration.toFixed(2)}ms`);
                }

                return measure.duration;
            } catch (error) {
                console.error("Performance measure failed:", error);
            }
        }
        return 0;
    }, []);

    return { mark, measure };
}

/**
 * Hook para debounce
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Hook para throttle
 */
export function useThrottle<T>(value: T, limit: number): T {
    const [throttledValue, setThrottledValue] = React.useState<T>(value);
    const lastRan = React.useRef(Date.now());

    React.useEffect(() => {
        const handler = setTimeout(() => {
            if (Date.now() - lastRan.current >= limit) {
                setThrottledValue(value);
                lastRan.current = Date.now();
            }
        }, limit - (Date.now() - lastRan.current));

        return () => {
            clearTimeout(handler);
        };
    }, [value, limit]);

    return throttledValue;
}

/**
 * Hook para medir FPS
 */
export function useFPS() {
    const [fps, setFps] = React.useState(60);
    const frameCount = React.useRef(0);
    const lastTime = React.useRef(performance.now());

    React.useEffect(() => {
        let animationFrameId: number;

        const measureFPS = () => {
            frameCount.current++;
            const currentTime = performance.now();
            const delta = currentTime - lastTime.current;

            if (delta >= 1000) {
                // Atualizar a cada segundo
                const currentFPS = Math.round((frameCount.current * 1000) / delta);
                setFps(currentFPS);

                frameCount.current = 0;
                lastTime.current = currentTime;

                if (process.env.NODE_ENV === "development" && currentFPS < 30) {
                    console.warn(`[Performance Warning] Low FPS: ${currentFPS}`);
                }
            }

            animationFrameId = requestAnimationFrame(measureFPS);
        };

        animationFrameId = requestAnimationFrame(measureFPS);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return fps;
}

/**
 * Hook para lazy state (state que só atualiza quando necessário)
 */
export function useLazyState<T>(
    initialValue: T,
    shouldUpdate: (prev: T, next: T) => boolean = (prev, next) => prev !== next,
): [T, (value: T) => void] {
    const [state, setState] = React.useState<T>(initialValue);

    const setLazyState = React.useCallback(
        (value: T) => {
            setState((prev) => {
                if (shouldUpdate(prev, value)) {
                    return value;
                }
                return prev;
            });
        },
        [shouldUpdate],
    );

    return [state, setLazyState];
}

/**
 * Hook para memoizar valores pesados
 */
export function useHeavyMemo<T>(
    factory: () => T,
    deps: React.DependencyList,
    computationName?: string,
): T {
    return React.useMemo(() => {
        const start = performance.now();
        const result = factory();
        const duration = performance.now() - start;

        if (process.env.NODE_ENV === "development" && duration > 16) {
            console.warn(
                `[Heavy Computation] ${computationName || "useMemo"} took ${duration.toFixed(2)}ms`,
            );
        }

        return result;
    }, deps);
}

import React from "react";
