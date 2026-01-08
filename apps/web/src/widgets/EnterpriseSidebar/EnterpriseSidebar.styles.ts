import { cva } from "class-variance-authority";

export const sidebarItemStyles = cva(
  "relative flex h-10 w-10 items-center justify-center transition-all duration-300 border border-transparent rounded-none",
  {
    variants: {
      active: {
        true: "bg-white/5 text-[hsl(var(--primary))] border-[hsl(var(--primary)/0.3)] shadow-[0_0_15px_hsl(var(--primary)/0.2)]",
        false: "text-white/60 hover:bg-white/5 hover:text-white hover:border-white/10",
      },
      hovered: {
        true: "bg-white/5 text-white scale-105 border-white/20",
        false: "",
      },
    },
    compoundVariants: [
        {
            active: false,
            hovered: true,
            class: "bg-white/5 text-white scale-105 border-white/20"
        }
    ],
    defaultVariants: {
      active: false,
      hovered: false,
    },
  }
);

export const drawerContainerStyles = "fixed left-[80px] top-0 bottom-0 z-30 w-72 overflow-hidden border-r border-[color-mix(in_oklab,hsl(var(--border))_78%,transparent_22%)] bg-(--surface-veil,#020617) shadow-[0_28px_140px_-45px_rgba(0,0,0,0.98)] ring-1 ring-white/8 rounded-none";

export const drawerHeaderStyles = "relative flex h-20 items-center gap-4 border-b border-white/10 px-6 bg-(--surface-veil,#020617)";

export const drawerContentStyles = "relative flex-1 overflow-y-auto p-4";

export const drawerItemStyles = cva(
    "group relative flex flex-col gap-1 border border-white/12 bg-linear-to-br from-white/7 to-white/2 px-4 py-3 shadow-[0_16px_40px_-28px_rgba(0,0,0,0.9)] transition hover:border-white/18 hover:from-white/9 hover:to-white/3",
    {
        variants: {
            active: {
                true: "border-l-2 border-l-[hsl(var(--primary))] shadow-[0_0_40px_rgba(55,224,246,0.14)]",
                false: "text-white/80",
            }
        }
    }
);
