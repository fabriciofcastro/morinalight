import { cn } from "@morina/ui";
import { Search } from "lucide-react";
import { memo, useEffect, useState } from "react";

export const HeaderSearch = memo(function HeaderSearch() {
  const [isFocused, setIsFocused] = useState(false);

  // Example handling for Cmd+K (just visual for now or triggering logic if provided)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        document.getElementById("header-search-input")?.focus();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <div className={cn(
        "relative group transition-all duration-300 ease-in-out",
        isFocused ? "w-full md:w-96" : "w-full md:w-64"
    )}>
        <div className="relative flex items-center">
            {/* 90deg Corners Decoration */}
            <div className={cn(
                "absolute -inset-[1px] pointer-events-none transition-opacity duration-200",
                (isFocused || true) ? "opacity-100" : "opacity-0"
            )}>
                <div className={cn(
                    "absolute top-0 left-0 w-1.5 h-1.5 border-t border-l transition-colors duration-200",
                    isFocused ? "border-[#2957ff]" : "border-white/10 group-hover:border-[#2957ff]/40"
                )} />
                <div className={cn(
                    "absolute top-0 right-0 w-1.5 h-1.5 border-t border-r transition-colors duration-200",
                    isFocused ? "border-[#2957ff]" : "border-white/10 group-hover:border-[#2957ff]/40"
                )} />
                <div className={cn(
                    "absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l transition-colors duration-200",
                    isFocused ? "border-[#2957ff]" : "border-white/10 group-hover:border-[#2957ff]/40"
                )} />
                <div className={cn(
                    "absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r transition-colors duration-200",
                    isFocused ? "border-[#2957ff]" : "border-white/10 group-hover:border-[#2957ff]/40"
                )} />
            </div>

            <Search className={cn(
                "absolute left-3 w-4 h-4 transition-colors duration-200 pointer-events-none",
                isFocused ? "text-[#2957ff]" : "text-white/40 group-hover:text-white/60"
            )} />
            
            <input 
                id="header-search-input"
                type="text" 
                placeholder="Buscar..."
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                style={{
                    outline: 'none',
                    boxShadow: isFocused 
                        ? '0 0 0 1px rgba(41, 87, 255, 0.4), 0 0 12px -4px rgba(41, 87, 255, 0.3)' 
                        : '0 0 0 1px rgba(255, 255, 255, 0.05)'
                }}
                className={cn(
                    "w-full py-2 pl-9 pr-16 text-sm text-white transition-all duration-200",
                    "placeholder:text-white/40",
                    "bg-transparent border-0 ring-0",
                    isFocused 
                        ? "bg-[#090b16]/60 backdrop-blur-sm" 
                        : "bg-white/[0.02] hover:bg-[#2957ff]/5",
                    "focus:outline-none focus:ring-0"
                )}
            />

            {/* Keyboard shortcut hint */}
            <div className={cn(
                "absolute right-2 flex items-center gap-1 pointer-events-none transition-opacity duration-200",
                isFocused ? "opacity-0" : "opacity-100"
            )}>
                <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] text-white/50">
                    <span className="text-[11px]">⌘</span>K
                </kbd>
            </div>
        </div>
    </div>
  );
});
