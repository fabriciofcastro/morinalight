/**
 * Memoization Utilities
 * 
 * Utilitários para otimizar re-renders com React.memo
 */

import { memo, ComponentType } from "react";

/**
 * Comparador profundo para React.memo
 */
export function deepCompare<P extends object>(
    prevProps: Readonly<P>,
    nextProps: Readonly<P>,
): boolean {
    return JSON.stringify(prevProps) === JSON.stringify(nextProps);
}

/**
 * Comparador shallow para React.memo
 */
export function shallowCompare<P extends object>(
    prevProps: Readonly<P>,
    nextProps: Readonly<P>,
): boolean {
    const prevKeys = Object.keys(prevProps);
    const nextKeys = Object.keys(nextProps);

    if (prevKeys.length !== nextKeys.length) {
        return false;
    }

    for (const key of prevKeys) {
        if (prevProps[key as keyof P] !== nextProps[key as keyof P]) {
            return false;
        }
    }

    return true;
}

/**
 * Memo com comparador customizado
 */
export function memoWith<P extends object>(
    Component: ComponentType<P>,
    compare?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean,
) {
    return memo(Component, compare);
}

/**
 * Memo apenas para props específicas
 */
export function memoOnly<P extends object>(
    Component: ComponentType<P>,
    propsToCompare: Array<keyof P>,
) {
    return memo(Component, (prevProps, nextProps) => {
        for (const prop of propsToCompare) {
            if (prevProps[prop] !== nextProps[prop]) {
                return false;
            }
        }
        return true;
    });
}

/**
 * Memo excluindo props específicas
 */
export function memoExcept<P extends object>(
    Component: ComponentType<P>,
    propsToExclude: Array<keyof P>,
) {
    return memo(Component, (prevProps, nextProps) => {
        const prevKeys = Object.keys(prevProps) as Array<keyof P>;

        for (const key of prevKeys) {
            if (propsToExclude.includes(key)) continue;

            if (prevProps[key] !== nextProps[key]) {
                return false;
            }
        }

        return true;
    });
}

/**
 * Memo para componentes de lista
 */
export function memoListItem<P extends { id: string | number }>(
    Component: ComponentType<P>,
) {
    return memo(Component, (prevProps, nextProps) => {
        // Comparar apenas o ID (assumindo que dados não mudam se ID é o mesmo)
        return prevProps.id === nextProps.id;
    });
}

/**
 * Memo para componentes com children
 */
export function memoWithChildren<P extends { children?: React.ReactNode }>(
    Component: ComponentType<P>,
) {
    return memo(Component, (prevProps, nextProps) => {
        const { children: prevChildren, ...prevRest } = prevProps;
        const { children: nextChildren, ...nextRest } = nextProps;

        // Comparar props exceto children
        return shallowCompare(prevRest as any, nextRest as any);
    });
}

/**
 * Debug memo - mostra quando componente re-renderiza
 */
export function memoDebug<P extends object>(
    Component: ComponentType<P>,
    componentName: string,
) {
    return memo(Component, (prevProps, nextProps) => {
        const shouldUpdate = !shallowCompare(prevProps, nextProps);

        if (shouldUpdate && process.env.NODE_ENV === "development") {
            console.log(`[Memo Debug] ${componentName} will re-render`);

            // Mostrar quais props mudaram
            const prevKeys = Object.keys(prevProps) as Array<keyof P>;
            const changedProps = prevKeys.filter(
                (key) => prevProps[key] !== nextProps[key],
            );

            if (changedProps.length > 0) {
                console.log(`  Changed props:`, changedProps);
            }
        }

        return !shouldUpdate;
    });
}

/**
 * Hook para detectar re-renders
 */
export function useRenderCount(componentName: string) {
    const renderCount = React.useRef(0);

    React.useEffect(() => {
        renderCount.current += 1;
        if (process.env.NODE_ENV === "development") {
            console.log(`[Render Count] ${componentName}: ${renderCount.current}`);
        }
    });

    return renderCount.current;
}

/**
 * Hook para detectar mudanças em props
 */
export function useWhyDidYouUpdate<P extends object>(
    componentName: string,
    props: P,
) {
    const previousProps = React.useRef<P | undefined>(undefined);

    React.useEffect(() => {
        if (previousProps.current && process.env.NODE_ENV === "development") {
            const allKeys = Object.keys({ ...previousProps.current, ...props });
            const changedProps: Record<string, { from: any; to: any }> = {};

            allKeys.forEach((key) => {
                const typedKey = key as keyof P;
                if (previousProps.current![typedKey] !== props[typedKey]) {
                    changedProps[key] = {
                        from: previousProps.current![typedKey],
                        to: props[typedKey],
                    };
                }
            });

            if (Object.keys(changedProps).length > 0) {
                console.log(`[Why Did You Update] ${componentName}:`, changedProps);
            }
        }

        previousProps.current = props;
    });
}

import React from "react";
