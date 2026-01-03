import type { PropsWithChildren } from "react";

import { cn } from "../lib/cn";

type ThemeProviderProps = PropsWithChildren<{
  className?: string;
}>;

export function ThemeProvider({ children, className }: ThemeProviderProps) {
  return (
    <div className={cn("relative flex min-h-screen flex-col", className)} data-theme="morina-alpha">
      {children}
    </div>
  );
}
