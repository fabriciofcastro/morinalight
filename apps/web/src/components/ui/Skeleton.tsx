"use client";

import { cn } from "@morina/ui";

type SkeletonProps = {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
};

export function Skeleton({
  className,
  variant = "rectangular",
  width,
  height,
  animation = "pulse",
}: SkeletonProps) {
  const baseClasses = "bg-white/10 rounded";
  
  const variantClasses = {
    text: "rounded-sm h-4",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  const animationClasses = {
    pulse: "animate-pulse",
    wave: "animate-pulse bg-gradient-to-r from-white/10 via-white/20 to-white/10",
    none: "",
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height) style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={style as any}
    />
  );
}

// Componente de skeleton para cards de ficha
export function FichaCardSkeleton() {
  return (
    <div className="p-6 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Skeleton variant="text" width={60} height={24} />
            <Skeleton variant="rectangular" width={120} height={24} className="rounded-full" />
          </div>
          <Skeleton variant="text" width="80%" height={20} className="mb-1" />
          <Skeleton variant="text" width="60%" height={16} />
        </div>
        <Skeleton variant="rectangular" width={64} height={64} className="rounded" />
      </div>
      <div className="space-y-2 mb-4">
        <Skeleton variant="text" width="100%" height={16} />
        <Skeleton variant="text" width="80%" height={16} />
        <Skeleton variant="text" width="90%" height={16} />
      </div>
      <div className="flex gap-2 pt-4 border-t border-white/10">
        <Skeleton variant="rectangular" width="100%" height={40} className="flex-1" />
        <Skeleton variant="rectangular" width="100%" height={40} className="flex-1" />
      </div>
    </div>
  );
}

// Componente de skeleton para lista de fichas
export function FichaListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="p-4 rounded-lg border border-white/10 bg-white/[0.05] backdrop-blur-sm flex items-center gap-4">
          <Skeleton variant="rectangular" width={80} height={80} className="rounded flex-shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-3">
              <Skeleton variant="text" width={60} height={20} />
              <Skeleton variant="rectangular" width={100} height={20} className="rounded-full" />
            </div>
            <Skeleton variant="text" width="70%" height={18} />
            <Skeleton variant="text" width="50%" height={16} />
          </div>
          <div className="flex gap-2">
            <Skeleton variant="rectangular" width={80} height={36} />
            <Skeleton variant="rectangular" width={80} height={36} />
          </div>
        </div>
      ))}
    </div>
  );
}

// Componente de skeleton para grid de fichas
export function FichaGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <FichaCardSkeleton key={index} />
      ))}
    </div>
  );
}

