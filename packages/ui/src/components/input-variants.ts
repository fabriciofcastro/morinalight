import { cva } from "class-variance-authority";

export const inputVariants = cva(
  [
    // Base styles
    "flex w-full",
    "bg-[color-mix(in_oklab,hsl(var(--surface))_35%,black_65%)]",
    "border border-[color-mix(in_oklab,hsl(var(--border))_55%,transparent_45%)]",
    "rounded-none", // Strict square design
    "text-[hsl(var(--text-1))]",
    "font-mono tracking-[0.08em]", // Tech aesthetic
    "transition-[border-color,box-shadow,background-color] duration-200",
    "placeholder:text-[color-mix(in_oklab,hsl(var(--text-3))_78%,transparent_22%)]",
    "placeholder:uppercase placeholder:tracking-[0.22em]",
    "hover:border-[color-mix(in_oklab,hsl(var(--border))_65%,white_18%)]",
    "focus:outline-none",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "file:border-0 file:bg-transparent file:text-sm file:font-medium",
  ],
  {
    variants: {
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-11 px-4 text-base",
        xl: "h-12 px-4 text-base", // Kept for backwards compatibility if needed, but md is default
      },
      // Validation variants could be moved here, but currently handled via separate prop logic for complexity
    },
    defaultVariants: {
      size: "md",
    },
  },
);
