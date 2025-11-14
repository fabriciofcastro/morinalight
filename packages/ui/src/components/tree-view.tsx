"use client";

import type { ReactNode } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "../lib/cn";
import { Button } from "./button";

export type TreeNode<T = Record<string, unknown>> = {
  id: string;
  label: string;
  data?: T;
  children?: TreeNode<T>[];
  icon?: ReactNode;
  badge?: string | number;
  actions?: ReactNode;
};

type TreeViewProps<T = Record<string, unknown>> = {
  nodes: TreeNode<T>[];
  expanded?: Set<string>;
  onToggleExpand?: (id: string) => void;
  onSelect?: (node: TreeNode<T>) => void;
  selectedId?: string;
  level?: number;
  className?: string;
  showConnectors?: boolean;
};

export function TreeView<T = Record<string, unknown>>({
  nodes,
  expanded = new Set(),
  onToggleExpand,
  onSelect,
  selectedId,
  level = 0,
  className,
  showConnectors = true,
}: TreeViewProps<T>) {
  if (nodes.length === 0) {
    return (
      <div className={cn("py-[var(--space-4)] text-center text-[var(--fs-sm)] text-[color-mix(in_oklab,var(--muted-soft)_70%,var(--fg)_30%)]", className)}>
        Nenhum item encontrado
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {nodes.map((node, index) => {
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = expanded.has(node.id);
        const isSelected = selectedId === node.id;
        const isLast = index === nodes.length - 1;

        return (
          <div key={node.id} className="relative">
            {/* Conector vertical */}
            {showConnectors && level > 0 && (
              <div
                className={cn(
                  "absolute left-0 top-0 w-px",
                  isLast ? "h-[calc(50%+var(--space-3))]" : "h-full",
                  "bg-[color-mix(in_oklab,var(--border)_50%,transparent)]",
                )}
                style={{ left: `${(level - 1) * 24 + 12}px` }}
              />
            )}

            {/* Linha do nó */}
            <div className={cn("relative flex items-center gap-[var(--space-2)] py-[var(--space-2)]", level > 0 && "pl-[var(--space-6)]")}>
              {/* Conector horizontal */}
              {showConnectors && level > 0 && (
                <div
                  className={cn(
                    "absolute left-0 top-1/2 h-px w-[var(--space-3)] -translate-y-1/2",
                    "bg-[color-mix(in_oklab,var(--border)_50%,transparent)]",
                  )}
                  style={{ left: `${(level - 1) * 24}px` }}
                />
              )}

              {/* Botão de expansão */}
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => onToggleExpand?.(node.id)}
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--r-sm)] transition-colors",
                    "hover:bg-[color-mix(in_oklab,var(--surface-muted)_90%,var(--primary)_10%)]",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1",
                  )}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-[var(--muted-soft)]" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-[var(--muted-soft)]" />
                  )}
                </button>
              ) : (
                <div className="w-5" />
              )}

              {/* Conteúdo do nó */}
              <button
                type="button"
                onClick={() => onSelect?.(node)}
                className={cn(
                  "group relative flex flex-1 items-center gap-[var(--space-3)] rounded-[var(--r-md)] px-[var(--space-3)] py-[var(--space-2)]",
                  "transition-all duration-[var(--motion-duration-base)]",
                  "hover:bg-[color-mix(in_oklab,var(--surface-muted)_85%,var(--primary)_15%)]",
                  "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1",
                  isSelected &&
                    "bg-[color-mix(in_oklab,var(--primary)_15%,transparent)] shadow-[inset_0_0_0_1px_rgba(91,138,255,0.3)]",
                )}
              >
                {/* Ícone */}
                {node.icon && <div className="shrink-0 text-[var(--muted-soft)] group-hover:text-[var(--fg)]">{node.icon}</div>}

                {/* Label */}
                <span
                  className={cn(
                    "flex-1 text-left text-[var(--fs-sm)] font-medium leading-[var(--lh-base)]",
                    isSelected ? "text-[var(--fg)]" : "text-[color-mix(in_oklab,var(--muted-soft)_30%,var(--fg)_70%)]",
                  )}
                >
                  {node.label}
                </span>

                {/* Badge */}
                {node.badge && (
                  <span
                    className={cn(
                      "rounded-[var(--r-sm)] px-[var(--space-2)] py-0.5 text-[var(--fs-xs)] font-medium",
                      "bg-[color-mix(in_oklab,var(--primary)_20%,transparent)] text-[var(--primary)]",
                    )}
                  >
                    {node.badge}
                  </span>
                )}

                {/* Actions */}
                {node.actions && (
                  <div className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100">{node.actions}</div>
                )}
              </button>
            </div>

            {/* Filhos */}
            {hasChildren && isExpanded && (
              <div className="relative">
                {showConnectors && (
                  <div
                    className={cn(
                      "absolute left-0 top-0 w-px",
                      isLast ? "h-[var(--space-6)]" : "h-full",
                      "bg-[color-mix(in_oklab,var(--border)_50%,transparent)]",
                    )}
                    style={{ left: `${level * 24 + 12}px` }}
                  />
                )}
                <TreeView
                  nodes={node.children!}
                  expanded={expanded}
                  onToggleExpand={onToggleExpand}
                  onSelect={onSelect}
                  selectedId={selectedId}
                  level={level + 1}
                  showConnectors={showConnectors}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

type TreeViewContainerProps<T = Record<string, unknown>> = {
  nodes: TreeNode<T>[];
  expanded?: Set<string>;
  onToggleExpand?: (id: string) => void;
  onSelect?: (node: TreeNode<T>) => void;
  selectedId?: string;
  className?: string;
  showConnectors?: boolean;
  emptyMessage?: string;
};

export function TreeViewContainer<T = Record<string, unknown>>({
  nodes,
  expanded = new Set(),
  onToggleExpand,
  onSelect,
  selectedId,
  className,
  showConnectors = true,
  emptyMessage = "Nenhum item encontrado",
}: TreeViewContainerProps<T>) {
  const handleToggleExpand = (id: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    onToggleExpand?.(id);
  };

  return (
    <div className={cn("overflow-hidden rounded-[var(--r-lg)] border border-[var(--border)] bg-[color-mix(in_oklab,var(--surface)_95%,transparent)]", className)}>
      <div className="overflow-auto p-[var(--space-2)]">
        {nodes.length === 0 ? (
          <div className="py-[var(--space-8)] text-center text-[var(--fs-sm)] text-[color-mix(in_oklab,var(--muted-soft)_70%,var(--fg)_30%)]">
            {emptyMessage}
          </div>
        ) : (
          <TreeView
            nodes={nodes}
            expanded={expanded}
            onToggleExpand={handleToggleExpand}
            onSelect={onSelect}
            selectedId={selectedId}
            showConnectors={showConnectors}
          />
        )}
      </div>
    </div>
  );
}

