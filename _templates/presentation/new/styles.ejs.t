---
to: apps/web/src/presentation/components/<%= name %>/<%= name %>.styles.ts
---
import { cva } from "class-variance-authority";

export const containerStyles = cva(
  "relative flex flex-col gap-4 p-4",
  {
    variants: {
      variant: {
        default: "bg-surface border border-border",
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
