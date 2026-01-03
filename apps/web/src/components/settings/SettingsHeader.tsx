"use client";

import { Button, cn } from "@morina/ui";
import { ArrowLeft, ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type SettingsHeaderProps = {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  showBackButton?: boolean;
  backHref?: string;
  className?: string;
};

export function SettingsHeader({
  title,
  description,
  breadcrumbs,
  actions,
  showBackButton = false,
  backHref,
  className,
}: SettingsHeaderProps) {
  const pathname = usePathname();

  const defaultBreadcrumbs: BreadcrumbItem[] = breadcrumbs || [
    { label: "Início", href: "/" },
    { label: "Configurações", href: "/settings" },
  ];

  return (
    <div className={cn("border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent", className)}>
      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* Breadcrumbs */}
        {defaultBreadcrumbs.length > 0 && (
          <nav className="mb-4 flex items-center gap-2 text-sm text-white/60">
            {defaultBreadcrumbs.map((crumb, index) => {
              const isLast = index === defaultBreadcrumbs.length - 1;
              return (
                <div key={index} className="flex items-center gap-2">
                  {index === 0 ? (
                    <Link
                      href={crumb.href || "#"}
                      className="hover:text-white transition-colors"
                    >
                      <Home className="h-4 w-4" />
                    </Link>
                  ) : (
                    <>
                      <ChevronRight className="h-4 w-4" />
                      {crumb.href && !isLast ? (
                        <Link
                          href={crumb.href}
                          className="hover:text-white transition-colors"
                        >
                          {crumb.label}
                        </Link>
                      ) : (
                        <span className={isLast ? "text-white" : ""}>{crumb.label}</span>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </nav>
        )}

        {/* Header Content */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-3">
              {showBackButton && (
                <Link href={backHref || "/settings"}>
                  <Button type="button" variant="outline" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                  </Button>
                </Link>
              )}
              <h1 className="text-3xl font-bold text-white">{title}</h1>
            </div>
            {description && <p className="text-white/70">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
}


