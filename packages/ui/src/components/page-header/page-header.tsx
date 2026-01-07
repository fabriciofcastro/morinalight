"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "../../lib/cn";
import { designTokens } from "../../theme/design-tokens";
import { semanticTokens } from "../../theme/semantic-tokens";
import type { PageHeaderProps } from "./page-header.types";

/**
 * PageHeader - Header de página com breadcrumbs, título e ações
 *
 * @example
 * ```tsx
 * <PageHeader
 *   icon={Building2}
 *   title="Fornecedores"
 *   description="Gerencie seus fornecedores cadastrados"
 *   breadcrumbs={[
 *     { label: "Home", href: "/" },
 *     { label: "Fornecedores" }
 *   ]}
 *   actions={
 *     <Button onClick={() => router.push('/fornecedores/new')}>
 *       <Plus className="mr-2 h-4 w-4" />
 *       Novo Fornecedor
 *     </Button>
 *   }
 *   stats={
 *     <StatsGroup layout="horizontal" showSeparators>
 *       <StatCard icon={Building2} label="Total" value={100} variant="primary" />
 *     </StatsGroup>
 *   }
 * />
 * ```
 */
export function PageHeader({
  icon: Icon,
  title,
  description,
  breadcrumbs,
  actions,
  stats,
  className,
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: parseFloat(designTokens.duration.base) / 1000,
      }}
      className={cn("space-y-6", className)}
    >
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;

            return (
              <div key={index} className="flex items-center gap-2">
                {crumb.href && !isLast ? (
                  <Link
                    href={crumb.href}
                    className="hover:opacity-70 transition-opacity"
                    style={{
                      color: semanticTokens.color.text.secondary,
                      fontFamily: semanticTokens.typography.fontFamily.sans,
                      fontSize: semanticTokens.typography.fontSize.sm,
                      transition: semanticTokens.transition.fast,
                    }}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    style={{
                      color: isLast
                        ? semanticTokens.color.text.primary
                        : semanticTokens.color.text.secondary,
                      fontFamily: semanticTokens.typography.fontFamily.sans,
                      fontSize: semanticTokens.typography.fontSize.sm,
                      fontWeight: isLast
                        ? semanticTokens.typography.fontWeight.semibold
                        : semanticTokens.typography.fontWeight.normal,
                    }}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {crumb.label}
                  </span>
                )}

                {!isLast && (
                  <ChevronRight
                    className="h-4 w-4"
                    style={{ color: semanticTokens.color.text.tertiary }}
                  />
                )}
              </div>
            );
          })}
        </nav>
      )}

      {/* Title Section */}
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            {Icon && (
              <div
                className="p-3 rounded-lg border backdrop-blur-sm"
                style={{
                  backgroundColor: `color-mix(in srgb, ${semanticTokens.color.action.primary} 10%, transparent)`,
                  borderColor: `color-mix(in srgb, ${semanticTokens.color.action.primary} 20%, transparent)`,
                }}
              >
                <Icon className="h-6 w-6" style={{ color: semanticTokens.color.action.primary }} />
              </div>
            )}

            <h1
              className="text-4xl font-bold"
              style={{
                color: semanticTokens.color.text.primary,
                fontFamily: semanticTokens.typography.fontFamily.display,
                fontSize: semanticTokens.typography.fontSize["4xl"],
                lineHeight: semanticTokens.typography.lineHeight.tight,
              }}
            >
              {title}
            </h1>
          </div>

          {description && (
            <p
              className="text-lg"
              style={{
                color: semanticTokens.color.text.secondary,
                fontFamily: semanticTokens.typography.fontFamily.sans,
                fontSize: semanticTokens.typography.fontSize.lg,
              }}
            >
              {description}
            </p>
          )}
        </div>

        {/* Actions */}
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>

      {/* Stats */}
      {stats && <div>{stats}</div>}
    </motion.div>
  );
}
