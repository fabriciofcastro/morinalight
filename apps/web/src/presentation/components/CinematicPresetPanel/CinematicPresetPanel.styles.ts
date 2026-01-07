import { cva } from "class-variance-authority";

export const panelStyles = cva(
  "bg-[color-mix(in oklab,var(--surface-color) 94%,transparent)]/70",
  {
    variants: {
      glow: {
        true: "relative",
        false: "",
      },
    },
    defaultVariants: {
      glow: true,
    },
  }
);

export const headerStyles = cva("flex flex-col gap-(--space-2)");

export const labelStyles = cva(
  "text-(--fs-xs) uppercase tracking-(--tracking-wide) text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]"
);

export const titleStyles = cva("text-(--fs-xl) font-semibold leading-(--lh-tight)");

export const descriptionStyles = cva(
  "text-(--fs-sm) leading-(--lh-base) text-[color-mix(in oklab,var(--muted-soft) 72%,var(--fg) 28%)]"
);

export const fieldGroupStyles = cva("mt-(--space-5) grid gap-(--space-3)");

export const selectStyles = cva(
  "rounded-(--r-md) border border-[color-mix(in oklab,var(--border-color) 82%,transparent)] bg-[color-mix(in oklab,var(--surface-color) 92%,transparent)] p-(--space-3) text-(--fs-sm) outline-none transition focus:border-[color-mix(in oklab,var(--primary-color) 50%,transparent)] focus:shadow-[0_0_0_2px_rgba(40,85,255,0.25)]"
);

export const helpTextStyles = cva(
  "text-(--fs-xs) text-[color-mix(in oklab,var(--muted-soft) 75%,var(--fg) 25%)]"
);
