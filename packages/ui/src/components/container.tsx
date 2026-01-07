import { cn } from "../lib/cn";

export interface ContainerProps {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
}

const sizeMap = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-7xl",
  xl: "max-w-[1600px]",
  full: "max-w-full",
};

/**
 * Container primitive for consistent max-width and centering
 * @example
 * <Container size="lg">
 *   <PageContent />
 * </Container>
 */
export function Container({ children, size = "xl", className }: ContainerProps) {
  return <div className={cn("mx-auto w-full px-6", sizeMap[size], className)}>{children}</div>;
}
