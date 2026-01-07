"use client";

import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../lib/cn";
import { designTokens } from "../../theme/design-tokens";
import { SearchBar } from "../search-bar";
import type { SearchBarProps } from "../search-bar/search-bar.types";
import type { ListControlsProps } from "./list-controls.types";

/**
 * ListControls - Barra de controles para listas (Busca, Filtros, Ações)
 *
 * @example
 * ```tsx
 * <ListControls
 *   searchValue={search}
 *   onSearchChange={setSearch}
 *   filterButton={<Button variant="ghost">Filtros</Button>}
 *   viewToggle={<ViewToggle value={view} onChange={setView} />}
 *   actions={<Button>Novo Item</Button>}
 *   hasSelection={selected.size > 0}
 *   bulkActions={<BulkActionsBar ... />}
 * />
 * ```
 */
export function ListControls({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  loading,
  filterButton,
  viewToggle,
  actions,
  bulkActions,
  hasSelection = false,
  className,
}: ListControlsProps) {
  return (
    <div className={cn("relative h-14", className)}>
      <AnimatePresence mode="wait">
        {hasSelection && bulkActions ? (
          <motion.div
            key="bulk-actions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: parseFloat(designTokens.duration.fast) / 1000 }}
            className="absolute inset-0 z-10"
          >
            {bulkActions}
          </motion.div>
        ) : (
          <motion.div
            key="controls"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: parseFloat(designTokens.duration.fast) / 1000 }}
            className="absolute inset-0 flex items-center gap-4"
          >
            <div className="flex-1 max-w-md">
              <SearchBar
                {...({
                  value: searchValue,
                  onChange: onSearchChange,
                  placeholder: searchPlaceholder,
                  loading: loading,
                } as SearchBarProps)}
              />
            </div>

            {filterButton && <div className="flex-shrink-0">{filterButton}</div>}

            {(viewToggle || actions) && (
              <div className="flex items-center gap-4 ml-auto">
                {viewToggle}
                {actions}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
