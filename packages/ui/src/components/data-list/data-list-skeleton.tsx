"use client";

import { semanticTokens } from "../../theme/semantic-tokens";

export function DataListSkeleton() {
  return (
    <div
      className="flex items-center gap-4 p-4 rounded-lg animate-pulse"
      style={{
        borderBottom: `1px solid ${semanticTokens.color.border.subtle}`,
      }}
    >
      <div
        className="h-10 w-10 rounded-lg"
        style={{ backgroundColor: semanticTokens.color.background.secondary }}
      />
      <div className="flex-1 space-y-2">
        <div
          className="h-4 w-1/3 rounded"
          style={{ backgroundColor: semanticTokens.color.background.secondary }}
        />
        <div
          className="h-3 w-1/4 rounded"
          style={{ backgroundColor: semanticTokens.color.background.tertiary }}
        />
      </div>
      <div
        className="h-8 w-20 rounded"
        style={{ backgroundColor: semanticTokens.color.background.secondary }}
      />
    </div>
  );
}
