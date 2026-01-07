import { cn } from "../lib/cn";

export interface StackProps {
  children: React.ReactNode;
  direction?: "vertical" | "horizontal";
  spacing?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around";
  className?: string;
}

const spacingMap = {
  none: "gap-0",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
  "2xl": "gap-12",
};

const alignMap = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

const justifyMap = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
};

/**
 * Layout primitive for consistent spacing and alignment
 * @example
 * <Stack spacing="lg">
 *   <SearchBar />
 *   <DataTable />
 * </Stack>
 */
export function Stack({
  children,
  direction = "vertical",
  spacing = "md",
  align = "stretch",
  justify = "start",
  className,
}: StackProps) {
  return (
    <div
      className={cn(
        "flex",
        direction === "vertical" ? "flex-col" : "flex-row",
        spacingMap[spacing],
        alignMap[align],
        justifyMap[justify],
        className,
      )}
    >
      {children}
    </div>
  );
}
