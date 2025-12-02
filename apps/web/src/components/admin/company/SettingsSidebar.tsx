import { cn } from "../../../lib/utils";
import { LucideIcon } from "lucide-react";

interface NavItem {
    id: string;
    label: string;
    icon: LucideIcon;
    description?: string;
}

interface SettingsSidebarProps {
    items: NavItem[];
    activeItem: string;
    onSelect: (id: string) => void;
    className?: string;
}

export function SettingsSidebar({ items, activeItem, onSelect, className }: SettingsSidebarProps) {
    return (
        <nav className={cn("flex flex-col space-y-1", className)}>
            {items.map((item) => {
                const isActive = activeItem === item.id;
                const Icon = item.icon;

                return (
                    <button
                        key={item.id}
                        onClick={() => onSelect(item.id)}
                        className={cn(
                            "group relative flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-all duration-200",
                            isActive
                                ? "bg-[#18181b] text-white shadow-md border border-white/10"
                                : "text-zinc-400 hover:bg-white/5 hover:text-white"
                        )}
                    >
                        {/* Active Indicator */}
                        {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-[hsl(var(--primary))]" />
                        )}

                        <Icon className={cn(
                            "h-5 w-5 transition-colors",
                            isActive ? "text-[hsl(var(--primary))]" : "text-zinc-500 group-hover:text-zinc-300"
                        )} />

                        <div className="flex flex-col">
                            <span className={cn("text-sm font-medium", isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-200")}>
                                {item.label}
                            </span>
                            {item.description && (
                                <span className="text-xs text-zinc-500 hidden lg:block group-hover:text-zinc-400 transition-colors">
                                    {item.description}
                                </span>
                            )}
                        </div>
                    </button>
                );
            })}
        </nav>
    );
}
