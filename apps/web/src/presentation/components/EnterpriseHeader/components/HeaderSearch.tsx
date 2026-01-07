import { Input, cn } from "@morina/ui";
import { Search } from "lucide-react";
import { memo } from "react";
import { searchContainerStyles, searchInputContainerStyles } from "../EnterpriseHeader.styles";

export const HeaderSearch = memo(function HeaderSearch() {
  return (
    <div className={searchContainerStyles}>
      <div className="group relative w-full">
        {/* Hover effect background */}
        <div className="absolute -inset-px bg-linear-to-r from-[hsl(var(--primary)/0)] to-[hsl(var(--primary)/0)] rounded-none group-hover:from-[hsl(var(--primary)/0.3)] group-hover:to-[hsl(var(--primary)/0.2)] blur-sm transition-all duration-300 group-focus-within:hidden pointer-events-none" />
        {/* Focus glow */}
        <div className="absolute inset-0 bg-[hsl(var(--primary)/0.08)] opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none rounded-none" />
        <div className={searchInputContainerStyles}>
          <div className="h-full w-12 flex items-center justify-center border-r border-[color-mix(in_oklab,hsl(var(--border))_55%,transparent_45%)] bg-white/5 group-hover:border-[hsl(var(--primary)/0.3)] group-focus-within:border-[hsl(var(--primary)/0.5)] transition-colors">
            <Search className="h-4 w-4 text-white/40 group-hover:text-[hsl(var(--primary)/0.8)] group-focus-within:text-[hsl(var(--primary))] transition-colors" />
          </div>
          <Input
            type="search"
            placeholder="Buscar em todo o sistema..."
            aria-label="Buscar em todo o sistema"
            className={cn(
              "h-full flex-1 border-0 bg-transparent px-4 cursor-text",
              "text-white placeholder:text-white/20",
              "hover:border-0 focus:border-0 focus:shadow-none focus:outline-none",
              "transition-colors",
            )}
          />
          {/* Corner accents */}
          <div className="absolute top-0 right-0 h-2 w-2 border-t border-r border-white/30 group-hover:border-[hsl(var(--primary)/0.6)] group-focus-within:border-[hsl(var(--primary))] transition-colors" />
          <div className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-white/30 group-hover:border-[hsl(var(--primary)/0.6)] group-focus-within:border-[hsl(var(--primary))] transition-colors" />
        </div>
      </div>
    </div>
  );
});
