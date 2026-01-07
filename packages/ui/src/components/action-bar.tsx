"use client";

import { cn } from "../lib/cn";
import { Stack } from "./stack";

export interface ActionBarProps {
  children: React.ReactNode;
  align?: "start" | "end" | "between";
  className?: string;
}

/**
 * Compound component for action buttons grouped together
 * @example
 * <ActionBar align="end">
 *   <Button variant="outline">Cancelar</Button>
 *   <Button variant="default">Salvar</Button>
 * </ActionBar>
 */
export function ActionBar({ children, align = "end", className }: ActionBarProps) {
  const justifyMap = {
    start: "start",
    end: "end",
    between: "between",
  } as const;

  return (
    <Stack
      direction="horizontal"
      spacing="sm"
      justify={justifyMap[align]}
      className={cn("flex-wrap", className)}
    >
      {children}
    </Stack>
  );
}
