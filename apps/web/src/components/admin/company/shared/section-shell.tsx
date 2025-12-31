import { cn } from "@morina/ui";

// Tech Corner Component
export const TechCorner = ({
    position,
}: {
    position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}) => {
    const classes = {
        "top-left": "top-0 left-0 border-t-2 border-l-2",
        "top-right": "top-0 right-0 border-t-2 border-r-2",
        "bottom-left": "bottom-0 left-0 border-b-2 border-l-2",
        "bottom-right": "bottom-0 right-0 border-b-2 border-r-2",
    };

    return (
        <div className={`absolute w-6 h-6 border-[hsl(var(--primary)/0.6)] ${classes[position]}`} />
    );
};

interface SectionShellProps {
    children: React.ReactNode;
    className?: string;
    active?: boolean;
}

export function SectionShell({ children, className, active = true }: SectionShellProps) {
    return (
        <div
            className={cn(
                "relative p-6 md:p-8 border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent backdrop-blur-xl shadow-xl",
                !active && "hidden",
                className
            )}
        >
            <TechCorner position="top-left" />
            <TechCorner position="top-right" />
            {children}
        </div>
    );
}
