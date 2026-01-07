"use client";

import { semanticTokens } from "../../theme/semantic-tokens";

export function DataGridSkeleton() {
  return (
    <div
      className="rounded-lg border p-6 space-y-4 animate-pulse"
      style={{
        backgroundColor: `color-mix(in srgb, ${semanticTokens.color.background.glass} 30%, transparent)`,
        borderColor: semanticTokens.color.border.subtle,
      }}
    >
      {/* Header com Ícone e Título */}
      <div className="flex items-center gap-4">
        <div
          className="h-10 w-10 rounded-lg"
          style={{ backgroundColor: semanticTokens.color.background.secondary }}
        />
        <div className="space-y-2 flex-1">
          <div
            className="h-4 w-24 rounded"
            style={{ backgroundColor: semanticTokens.color.background.secondary }}
          />
          <div
            className="h-3 w-16 rounded"
            style={{ backgroundColor: semanticTokens.color.background.tertiary }}
          />
        </div>
      </div>

      {/* Conteúdo */}
      <div className="space-y-2 pt-2">
        <div
          className="h-3 w-full rounded"
          style={{ backgroundColor: semanticTokens.color.background.tertiary }}
        />
        <div
          className="h-3 w-2/3 rounded"
          style={{ backgroundColor: semanticTokens.color.background.tertiary }}
        />
      </div>

      {/* Footer / Ações */}
      <div className="pt-4 flex items-center justify-between">
        <div
          className="h-6 w-16 rounded-full"
          style={{ backgroundColor: semanticTokens.color.background.secondary }}
        />
        <div
          className="h-8 w-20 rounded"
          style={{ backgroundColor: semanticTokens.color.background.secondary }}
        />
      </div>
    </div>
  );
}
