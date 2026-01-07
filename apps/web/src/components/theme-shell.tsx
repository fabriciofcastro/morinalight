"use client";

import { ThemeShell as UIThemeShell } from "@morina/ui";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";

import { useThemeEngine } from "@/hooks/use-theme-engine";

type ThemeShellProps = PropsWithChildren<{
  className?: string;
}>;

export function ThemeShell({ children, className }: ThemeShellProps) {
  const { getCompanyVideo, loading } = useThemeEngine();
  const videoSrc = getCompanyVideo();
  const pathname = usePathname();
  const isAuthRoute =
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/register") ||
    pathname?.startsWith("/forgot-password") ||
    pathname?.startsWith("/select-organization") ||
    pathname?.startsWith("/invite");

  return (
    <UIThemeShell
      className={className}
      videoSrc={videoSrc}
      loading={loading}
      isBootSequence={!!isAuthRoute}
    >
      {children}
    </UIThemeShell>
  );
}
