"use client";

import type * as React from "react";
import { cn } from "../lib/cn";
import { Spinner } from "./spinner";

/**
 * LoadingOverlay Component - Enterprise Grade
 *
 * Features:
 * - Overlay with backdrop
 * - Custom spinner
 * - Loading text
 * - Theme-aware
 * - Blur background
 */

export interface LoadingOverlayProps {
  /** Show overlay */
  visible: boolean;
  /** Loading text */
  text?: string;
  /** Custom spinner */
  spinner?: React.ReactNode;
  /** Blur background */
  blur?: boolean;
  /** Children to overlay */
  children: React.ReactNode;
  /** Custom className */
  className?: string;
}

export function LoadingOverlay({
  visible,
  text = "Loading...",
  spinner,
  blur = true,
  children,
  className,
}: LoadingOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {children}

      {visible && (
        <div
          className={cn(
            "absolute inset-0 z-50",
            "flex flex-col items-center justify-center",
            "bg-background/80",
            blur && "backdrop-blur-sm",
            "animate-in fade-in-0",
          )}
        >
          <div className="flex flex-col items-center gap-4">
            {spinner || <Spinner size="lg" />}
            {text && <p className="text-sm font-semibold text-text-primary">{text}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

LoadingOverlay.displayName = "LoadingOverlay";
