"use client";

import { Icon as IconifyIcon } from "@iconify/react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../lib/cn";

export type IconSource = string | LucideIcon;

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, "ref"> {
  /**
   * The icon to display.
   * Can be an Iconify string (e.g., "mdi:home") or a Lucide icon component.
   */
  icon: IconSource;

  /**
   * Size of the icon.
   * Can be a number (pixels) or string (css unit).
   * Default depends on usage context (usually inherits or 1em).
   */
  size?: number | string;

  /**
   * Class name for custom styling.
   */
  className?: string;
}

/**
 * Universal Icon Component
 *
 * Unifies Iconify and Lucide icons under a single component.
 * - Pass a string for Iconify icons (e.g. "mdi:account")
 * - Pass a Lucide component for standard icons
 */
export function Icon({ icon, size, className, ...props }: IconProps) {
  // Handle Lucide Icon (Component)
  if (typeof icon !== "string") {
    const LucideComponent = icon;
    return (
      <LucideComponent
        size={typeof size === "number" ? size : undefined}
        className={cn("shrink-0", className)}
        // If size is a string (e.g. "2rem"), Lucide doesn't support it directly via size prop easily without style,
        // but className usually handles w/h if needed.
        // However, Lucide 'size' prop expects number | string, but strictly it translates to width/height attributes.
        // Let's pass it if it exists.
        {...props}
        style={{
          width: size,
          height: size,
          ...props.style,
        }}
      />
    );
  }

  // Handle Iconify Icon (String)
  return (
    <IconifyIcon
      icon={icon}
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      {...(props as any)}
    />
  );
}

Icon.displayName = "Icon";
