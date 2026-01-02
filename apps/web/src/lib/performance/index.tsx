/**
 * Performance Index
 * 
 * Exportações centralizadas de performance utilities
 */

// Lazy Loading
export {
    DefaultLoadingFallback,
    SectionLoadingFallback,
    SkeletonLoader,
    lazyWithRetry,
    lazyWithPrefetch,
    prefetchComponent,
    lazyIf,
    preloadComponents,
    useLazyLoadOnHover,
    useLazyLoadOnViewport,
} from "./lazy-loading";

// Memoization
export {
    deepCompare,
    shallowCompare,
    memoWith,
    memoOnly,
    memoExcept,
    memoListItem,
    memoWithChildren,
    memoDebug,
    useRenderCount,
    useWhyDidYouUpdate,
} from "./memoization";

// Virtual Scrolling
export { useVirtualScroll, VirtualList, type VirtualScrollOptions } from "./virtual-scroll";

// Performance Hooks
export {
    useRenderTime,
    usePerformanceMark,
    useDebounce,
    useThrottle,
    useFPS,
    useLazyState,
    useHeavyMemo,
} from "./hooks";
