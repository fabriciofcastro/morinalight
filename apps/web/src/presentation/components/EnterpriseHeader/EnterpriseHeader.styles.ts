import { cva } from "class-variance-authority";

export const headerContainerStyles = "sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[color-mix(in_oklab,hsl(var(--border))_70%,transparent_30%)] bg-[color-mix(in_oklab,hsl(var(--surface))_72%,transparent_28%)] backdrop-blur-2xl px-6";

export const searchContainerStyles = "flex flex-1 items-center gap-4 max-w-xl";

export const searchInputContainerStyles = "relative flex h-12 items-center border border-[color-mix(in_oklab,hsl(var(--border))_55%,transparent_45%)] bg-[color-mix(in_oklab,hsl(var(--surface))_35%,black_65%)] group-hover:border-[hsl(var(--primary)/0.5)] group-focus-within:border-[hsl(var(--primary))] transition-all duration-300 rounded-none cursor-text";

export const actionButtonStyles = cva(
    "relative flex h-12 w-12 items-center justify-center border border-[color-mix(in_oklab,hsl(var(--border))_55%,transparent_45%)] bg-[color-mix(in_oklab,hsl(var(--surface))_35%,black_65%)] text-white/70 hover:text-[hsl(var(--primary))] hover:border-[hsl(var(--primary)/0.55)] hover:shadow-[0_0_24px_-14px_hsl(var(--primary)/0.35)] hover:bg-[color-mix(in_oklab,hsl(var(--surface))_45%,black_55%)] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-2 focus:ring-offset-transparent rounded-none",
    {
        variants: {
            variant: {
                default: "",
                notification: "w-auto px-1", // wider for notification center
            }
        },
        defaultVariants: {
            variant: "default"
        }
    }
)

export const userMenuButtonStyles = "relative flex h-12 items-center gap-3 border border-[color-mix(in_oklab,hsl(var(--border))_55%,transparent_45%)] bg-[color-mix(in_oklab,hsl(var(--surface))_35%,black_65%)] px-3 hover:border-[hsl(var(--primary)/0.55)] hover:bg-[color-mix(in_oklab,hsl(var(--surface))_45%,black_55%)] hover:shadow-[0_0_24px_-14px_hsl(var(--primary)/0.35)] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-2 focus:ring-offset-transparent rounded-none";

export const userMenuDropdownStyles = "absolute right-0 top-14 z-[60] w-56 border border-[color-mix(in_oklab,hsl(var(--border))_60%,transparent_40%)] bg-[color-mix(in_oklab,hsl(var(--surface))_78%,black_22%)] p-2 shadow-[0_28px_120px_-48px_rgba(55,224,246,0.35)] rounded-none";

export const menuItemStyles = cva(
    "flex w-full items-center gap-3 border border-transparent px-3 py-2 text-sm transition-all rounded-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-transparent",
    {
        variants: {
            intent: {
                default: "text-white/80 hover:border-white/15 hover:bg-white/8 hover:text-white focus:ring-[hsl(var(--primary))]",
                danger: "text-red-400/90 hover:border-red-500/30 hover:bg-red-500/15 hover:text-red-300 focus:ring-red-500/50"
            }
        },
        defaultVariants: {
            intent: "default"
        }
    }
);
