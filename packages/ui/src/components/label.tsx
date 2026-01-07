import { forwardRef, type ReactNode } from "react";

import { cn } from "../lib/cn";

export interface LabelProps extends Omit<React.LabelHTMLAttributes<HTMLLabelElement>, "htmlFor"> {
  children: ReactNode;
  htmlFor: string;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, htmlFor, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        // LAB / SECURE TERMINAL LABEL (coeso com o login)
        "text-[10px] font-bold uppercase tracking-[0.22em] font-mono",
        "text-[hsl(var(--primary))]",
        className,
      )}
      htmlFor={htmlFor}
      {...props}
    >
      {children}
    </label>
  ),
);

Label.displayName = "Label";
