"use client";

import { Store, useStore } from "@tanstack/react-store";
import { cn } from "../lib/cn";

/**
 * TanStack Store Integration
 *
 * Lightweight state management with Design System integration
 *
 * Features:
 * - Type-safe state
 * - Reactive updates
 * - Devtools support
 * - Persistence helpers
 */

/**
 * Create a typed store
 *
 * @example
 * ```tsx
 * const counterStore = createStore({
 *   count: 0,
 *   increment: () => counterStore.setState(s => ({ count: s.count + 1 })),
 *   decrement: () => counterStore.setState(s => ({ count: s.count - 1 })),
 * });
 * ```
 */
export function createStore<TState extends Record<string, any>>(initialState: TState) {
  return new Store(initialState);
}

/**
 * Create a persisted store (localStorage)
 *
 * @example
 * ```tsx
 * const themeStore = createPersistedStore('theme', {
 *   mode: 'dark',
 *   setMode: (mode) => themeStore.setState({ mode }),
 * });
 * ```
 */
export function createPersistedStore<TState extends Record<string, any>>(
  key: string,
  initialState: TState,
) {
  // Load from localStorage
  const stored = typeof window !== "undefined" ? localStorage.getItem(key) : null;
  const state = stored ? { ...initialState, ...JSON.parse(stored) } : initialState;

  const store = new Store(state);

  // Subscribe to changes and persist
  if (typeof window !== "undefined") {
    store.subscribe(() => {
      localStorage.setItem(key, JSON.stringify(store.state));
    });
  }

  return store;
}

/**
 * StoreProvider Component
 * Provides store context to children
 */

export interface StoreProviderProps<TState> {
  store: Store<TState>;
  children: React.ReactNode;
}

export function StoreProvider<TState>({ store, children }: StoreProviderProps<TState>) {
  return <>{children}</>;
}

/**
 * StoreDevtools Component
 * Visual devtools for debugging store state
 */

export interface StoreDevtoolsProps<TState> {
  store: Store<TState>;
  name?: string;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export function StoreDevtools<TState>({
  store,
  name = "Store",
  position = "bottom-right",
}: StoreDevtoolsProps<TState>) {
  const state = useStore(store);
  const [isOpen, setIsOpen] = React.useState(false);

  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const positionClasses = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
  };

  return (
    <div className={cn("fixed z-[9999]", positionClasses[position])}>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "px-3 py-2 bg-primary text-white rounded-md shadow-lg",
            "hover:bg-primary-hover transition-colors",
            "text-xs font-mono font-semibold",
          )}
        >
          {name} 🔍
        </button>
      ) : (
        <div
          className={cn(
            "bg-surface border border-border rounded-none shadow-2xl",
            "w-96 max-h-96 overflow-auto",
            "p-4",
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-text-primary font-mono">{name} State</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-text-secondary hover:text-text-primary"
            >
              ✕
            </button>
          </div>
          <pre className="text-xs font-mono text-text-secondary overflow-auto">
            {JSON.stringify(state, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

/**
 * Example Usage:
 *
 * ```tsx
 * // Create store
 * const todoStore = createStore({
 *   todos: [] as Todo[],
 *   addTodo: (text: string) => {
 *     todoStore.setState(s => ({
 *       todos: [...s.todos, { id: Date.now(), text, done: false }]
 *     }));
 *   },
 *   toggleTodo: (id: number) => {
 *     todoStore.setState(s => ({
 *       todos: s.todos.map(t => t.id === id ? { ...t, done: !t.done } : t)
 *     }));
 *   },
 * });
 *
 * // Use in component
 * function TodoList() {
 *   const { todos, addTodo, toggleTodo } = useStore(todoStore);
 *
 *   return (
 *     <div>
 *       {todos.map(todo => (
 *         <div key={todo.id} onClick={() => toggleTodo(todo.id)}>
 *           {todo.text}
 *         </div>
 *       ))}
 *       <StoreDevtools store={todoStore} name="Todos" />
 *     </div>
 *   );
 * }
 * ```
 */

import * as React from "react";
