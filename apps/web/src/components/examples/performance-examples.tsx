/**
 * Performance Examples
 * 
 * Exemplos de uso das utilities de performance
 */

"use client";

import { Suspense } from "react";
import {
    lazyWithRetry,
    DefaultLoadingFallback,
    memoListItem,
    useVirtualScroll,
    VirtualList,
    useDebounce,
    useRenderTime,
    useWhyDidYouUpdate,
} from "@/lib/performance";

// ===== LAZY LOADING =====

// Lazy load com retry automático
const HeavyDashboard = lazyWithRetry(
    () => import("@/components/admin/dashboard"),
    3, // 3 tentativas
);

export function LazyDashboardExample() {
    return (
        <Suspense fallback={<DefaultLoadingFallback />}>
            <HeavyDashboard />
        </Suspense>
    );
}

// ===== MEMOIZATION =====

interface UserCardProps {
    id: string;
    name: string;
    email: string;
    onDelete: (id: string) => void;
}

// Memo para item de lista (compara apenas ID)
const UserCard = memoListItem<UserCardProps>(({ id, name, email, onDelete }) => {
    return (
        <div className="rounded border p-4">
            <h3>{name}</h3>
            <p>{email}</p>
            <button onClick={() => onDelete(id)}>Delete</button>
        </div>
    );
});

export function MemoizedListExample() {
    const [users, setUsers] = React.useState([
        { id: "1", name: "John", email: "john@example.com" },
        { id: "2", name: "Jane", email: "jane@example.com" },
    ]);

    const handleDelete = React.useCallback((id: string) => {
        setUsers((prev) => prev.filter((u) => u.id !== id));
    }, []);

    return (
        <div className="space-y-4">
            {users.map((user) => (
                <UserCard key={user.id} {...user} onDelete={handleDelete} />
            ))}
        </div>
    );
}

// ===== VIRTUAL SCROLLING =====

export function VirtualScrollExample() {
    // Gerar 10000 itens
    const items = React.useMemo(
        () => Array.from({ length: 10000 }, (_, i) => ({ id: i, name: `Item ${i}` })),
        [],
    );

    return (
        <div className="h-screen">
            <VirtualList
                items={items}
                itemHeight={50}
                renderItem={(item) => (
                    <div className="flex items-center border-b px-4">
                        <span>{item.name}</span>
                    </div>
                )}
            />
        </div>
    );
}

// ===== DEBOUNCE =====

export function DebouncedSearchExample() {
    const [search, setSearch] = React.useState("");
    const debouncedSearch = useDebounce(search, 300);

    React.useEffect(() => {
        if (debouncedSearch) {
            // Fazer busca apenas após 300ms sem digitar
            console.log("Searching for:", debouncedSearch);
        }
    }, [debouncedSearch]);

    return (
        <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
        />
    );
}

// ===== PERFORMANCE MONITORING =====

export function PerformanceMonitoredComponent() {
    useRenderTime("PerformanceMonitoredComponent");

    const [count, setCount] = React.useState(0);

    useWhyDidYouUpdate("PerformanceMonitoredComponent", { count });

    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount((c) => c + 1)}>Increment</button>
        </div>
    );
}

// ===== VIRTUAL SCROLL CUSTOMIZADO =====

export function CustomVirtualScrollExample() {
    const items = React.useMemo(
        () => Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `User ${i}` })),
        [],
    );

    const { virtualItems, totalHeight, containerRef, scrollToIndex } = useVirtualScroll(
        items,
        {
            itemHeight: 60,
            overscan: 5,
        },
    );

    return (
        <div>
            <button onClick={() => scrollToIndex(500)}>Scroll to middle</button>

            <div
                ref={containerRef}
                className="h-[600px] overflow-auto border"
                style={{ position: "relative" }}
            >
                <div style={{ height: `${totalHeight}px`, position: "relative" }}>
                    {virtualItems.map(({ index, data, style }) => (
                        <div key={index} style={style} className="border-b px-4 py-2">
                            <p className="font-semibold">{data.name}</p>
                            <p className="text-sm text-muted-foreground">ID: {data.id}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

import React from "react";
