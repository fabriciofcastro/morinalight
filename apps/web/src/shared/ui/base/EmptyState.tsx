"use client";

import { Button, GlassCard, cn } from "@morina/ui";
import { type LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <GlassCard className={cn("p-12 text-center", className)}>
      {Icon && (
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded border border-white/10 bg-white/5" data-testid="empty-state-icon">
            <Icon className="h-8 w-8 text-white/40" />
          </div>
        </div>
      )}
      <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
      {description && <p className="mb-6 text-sm text-white/60">{description}</p>}
      {action && (
        <Button type="button" onClick={action.onClick} variant="outline">
          {action.label}
        </Button>
      )}
    </GlassCard>
  );
}


