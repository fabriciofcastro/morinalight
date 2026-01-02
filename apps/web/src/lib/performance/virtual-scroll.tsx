/**
 * Virtual Scrolling Hook
 * 
 * Hook para implementar virtual scrolling em listas grandes
 */

import { useState, useEffect, useRef, useMemo } from "react";

export interface VirtualScrollOptions {
    /**
     * Altura de cada item em pixels
     */
    itemHeight: number;

    /**
     * Número de itens extras para renderizar (buffer)
     */
    overscan?: number;

    /**
     * Altura do container (opcional, usa altura da janela se não fornecido)
     */
    containerHeight?: number;
}

export interface VirtualScrollResult<T> {
    /**
     * Itens visíveis para renderizar
     */
    virtualItems: Array<{
        index: number;
        data: T;
        style: React.CSSProperties;
    }>;

    /**
     * Altura total da lista
     */
    totalHeight: number;

    /**
     * Ref para o container
     */
    containerRef: React.RefObject<HTMLDivElement>;

    /**
     * Scroll para um índice específico
     */
    scrollToIndex: (index: number) => void;
}

/**
 * Hook para virtual scrolling
 */
export function useVirtualScroll<T>(
    items: T[],
    options: VirtualScrollOptions,
): VirtualScrollResult<T> {
    const { itemHeight, overscan = 3, containerHeight } = options;

    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollTop, setScrollTop] = useState(0);

    // Calcular altura do container
    const viewportHeight = useMemo(() => {
        if (containerHeight) return containerHeight;
        if (typeof window !== "undefined") return window.innerHeight;
        return 600; // Fallback
    }, [containerHeight]);

    // Calcular índices visíveis
    const { startIndex, endIndex } = useMemo(() => {
        const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
        const end = Math.min(
            items.length - 1,
            Math.ceil((scrollTop + viewportHeight) / itemHeight) + overscan,
        );

        return { startIndex: start, endIndex: end };
    }, [scrollTop, itemHeight, viewportHeight, overscan, items.length]);

    // Itens virtuais para renderizar
    const virtualItems = useMemo(() => {
        return items.slice(startIndex, endIndex + 1).map((data, i) => ({
            index: startIndex + i,
            data,
            style: {
                position: "absolute" as const,
                top: 0,
                left: 0,
                width: "100%",
                height: `${itemHeight}px`,
                transform: `translateY(${(startIndex + i) * itemHeight}px)`,
            },
        }));
    }, [items, startIndex, endIndex, itemHeight]);

    // Altura total
    const totalHeight = items.length * itemHeight;

    // Scroll handler
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            setScrollTop(container.scrollTop);
        };

        container.addEventListener("scroll", handleScroll, { passive: true });
        return () => container.removeEventListener("scroll", handleScroll);
    }, []);

    // Scroll para índice
    const scrollToIndex = (index: number) => {
        if (containerRef.current) {
            containerRef.current.scrollTop = index * itemHeight;
        }
    };

    return {
        virtualItems,
        totalHeight,
        containerRef,
        scrollToIndex,
    };
}

/**
 * Componente de Virtual List
 */
interface VirtualListProps<T> {
    items: T[];
    itemHeight: number;
    renderItem: (item: T, index: number) => React.ReactNode;
    overscan?: number;
    className?: string;
}

export function VirtualList<T>({
    items,
    itemHeight,
    renderItem,
    overscan = 3,
    className = "",
}: VirtualListProps<T>) {
    const { virtualItems, totalHeight, containerRef } = useVirtualScroll(items, {
        itemHeight,
        overscan,
    });

    return (
        <div
            ref={containerRef}
            className={`relative overflow-auto ${className}`}
            style={{ height: "100%" }}
        >
            <div style={{ height: `${totalHeight}px`, position: "relative" }}>
                {virtualItems.map(({ index, data, style }) => (
                    <div key={index} style={style}>
                        {renderItem(data, index)}
                    </div>
                ))}
            </div>
        </div>
    );
}
