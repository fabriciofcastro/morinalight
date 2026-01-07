/**
 * Skip Link - Permite usuários de teclado pular para o conteúdo principal
 * WCAG 2.1 AA: Deve estar disponível para navegação por teclado
 */

"use client";

import { cn } from "../lib/cn";

export interface SkipLinkProps {
  /** ID do elemento de destino */
  targetId?: string;
  /** Texto do link */
  children?: React.ReactNode;
  className?: string;
}

export function SkipLink({
  targetId = "main-content",
  children = "Pular para conteúdo principal",
  className,
}: SkipLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className={cn(
        // Visível apenas quando focado
        "sr-only focus:not-sr-only",
        "absolute top-4 left-4 z-50",
        "px-4 py-2",
        "bg-[hsl(var(--primary))] text-white",
        "rounded-md",
        "font-medium",
        "shadow-lg",
        "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-2",
        className,
      )}
    >
      {children}
    </a>
  );
}
