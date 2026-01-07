"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Search, X } from "lucide-react";
import * as React from "react";
import { cn } from "../lib/cn";

/**
 * Command Palette Component - Enterprise Grade
 * Quick actions à la Notion, Linear, GitHub
 *
 * Features:
 * - Keyboard shortcut (⌘K / Ctrl+K)
 * - Fuzzy search
 * - Grouped actions
 * - Recent actions
 * - Theme-aware
 * - ARIA compliant
 */

export interface CommandAction {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  keywords?: string[];
  onSelect: () => void;
}

export interface CommandGroup {
  heading: string;
  actions: CommandAction[];
}

export interface CommandPaletteProps {
  /** Groups of actions */
  groups: CommandGroup[];
  /** Open state */
  open?: boolean;
  /** Open state change handler */
  onOpenChange?: (open: boolean) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Empty state text */
  emptyText?: string;
  /** Custom className */
  className?: string;
}

export function CommandPalette({
  groups,
  open,
  onOpenChange,
  placeholder = "Type a command or search...",
  emptyText = "No results found.",
  className,
}: CommandPaletteProps) {
  const [search, setSearch] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  // Filter actions based on search
  const filteredGroups = React.useMemo(() => {
    if (!search) return groups;

    return groups
      .map((group) => ({
        ...group,
        actions: group.actions.filter((action) => {
          const searchLower = search.toLowerCase();
          return (
            action.label.toLowerCase().includes(searchLower) ||
            action.description?.toLowerCase().includes(searchLower) ||
            action.keywords?.some((keyword) => keyword.toLowerCase().includes(searchLower))
          );
        }),
      }))
      .filter((group) => group.actions.length > 0);
  }, [groups, search]);

  // Flatten actions for keyboard navigation
  const allActions = React.useMemo(
    () => filteredGroups.flatMap((group) => group.actions),
    [filteredGroups],
  );

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) {
        // Open with Cmd+K or Ctrl+K
        if ((e.metaKey || e.ctrlKey) && e.key === "k") {
          e.preventDefault();
          onOpenChange?.(true);
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) => (i + 1) % allActions.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) => (i - 1 + allActions.length) % allActions.length);
          break;
        case "Enter":
          e.preventDefault();
          allActions[selectedIndex]?.onSelect();
          onOpenChange?.(false);
          setSearch("");
          break;
        case "Escape":
          onOpenChange?.(false);
          setSearch("");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, allActions, selectedIndex, onOpenChange]);

  // Reset selected index when search changes
  React.useEffect(() => {
    setSelectedIndex(0);
  }, []);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[20%] z-50 translate-x-[-50%]",
            "w-full max-w-2xl",
            "bg-background border border-border rounded-none shadow-2xl",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            className,
          )}
        >
          {/* Search Input */}
          <div className="flex items-center border-b border-border px-4">
            <Search className="h-5 w-5 text-text-tertiary mr-3" />
            <input
              type="text"
              placeholder={placeholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                "flex-1 h-14 bg-transparent",
                "text-text-primary placeholder:text-text-tertiary",
                "focus:outline-none",
              )}
            />
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-surface px-1.5 font-mono text-[10px] font-medium text-text-tertiary">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-auto p-2">
            {filteredGroups.length === 0 ? (
              <div className="py-12 text-center text-sm text-text-tertiary">{emptyText}</div>
            ) : (
              filteredGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="mb-4 last:mb-0">
                  <div className="px-2 py-1.5 text-xs font-semibold text-text-tertiary uppercase">
                    {group.heading}
                  </div>
                  {group.actions.map((action, actionIndex) => {
                    const globalIndex =
                      filteredGroups
                        .slice(0, groupIndex)
                        .reduce((acc, g) => acc + g.actions.length, 0) + actionIndex;
                    const isSelected = globalIndex === selectedIndex;

                    return (
                      <button
                        key={action.id}
                        onClick={() => {
                          action.onSelect();
                          onOpenChange?.(false);
                          setSearch("");
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-none",
                          "text-left transition-colors",
                          isSelected
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-surface-elevated text-text-primary",
                        )}
                      >
                        {action.icon && <div className="shrink-0">{action.icon}</div>}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold">{action.label}</div>
                          {action.description && (
                            <div className="text-xs text-text-secondary truncate">
                              {action.description}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-text-tertiary">
            <div className="flex items-center gap-4">
              <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-surface px-1.5 font-mono">
                ↑↓
              </kbd>
              <span>Navigate</span>
            </div>
            <div className="flex items-center gap-4">
              <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-surface px-1.5 font-mono">
                ↵
              </kbd>
              <span>Select</span>
            </div>
          </div>

          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

CommandPalette.displayName = "CommandPalette";
