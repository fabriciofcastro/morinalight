import * as React from "react";
import { Button } from "@/shared/ui/base/button";

export interface AccessibleButtonProps extends React.ComponentProps<typeof Button> {
    /**
     * Descriptive label for screen readers.
     * Required if the button only contains an icon.
     */
    "aria-label"?: string;
    /**
     * ID of the element that describes the button.
     */
    "aria-describedby"?: string;
    /**
     * Whether the button invokes a popup (menu, listbox, etc).
     */
    "aria-haspopup"?: boolean | "false" | "true" | "menu" | "listbox" | "tree" | "grid" | "dialog";
    /**
     * Whether the button is currently expanded.
     */
    "aria-expanded"?: boolean;
}

export const AccessibleButton = React.forwardRef<HTMLButtonElement, AccessibleButtonProps>(
    ({ "aria-label": ariaLabel, children, ...props }, ref) => {

        // Validation: If no children (text), aria-label MUST be present
        const hasText = React.Children.count(children) > 0;
        const finalAriaLabel = ariaLabel || (hasText ? undefined : "Button");

        if (!hasText && !ariaLabel) {
            console.warn("[AccessibleButton] Button has no text content and no aria-label. Accessibility will be impacted.");
        }

        return (
            <Button
                ref={ref}
                aria-label={finalAriaLabel}
                {...props}
            >
                {children}
            </Button>
        );
    }
);

AccessibleButton.displayName = "AccessibleButton";
