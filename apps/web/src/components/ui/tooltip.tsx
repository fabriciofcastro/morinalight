import { HelpCircle } from "lucide-react";
import { useState } from "react";

interface TooltipProps {
    content: string;
    children?: React.ReactNode;
    position?: "top" | "bottom" | "left" | "right";
    id?: string;
}

export function Tooltip({
    content,
    children,
    position = "top",
    id,
}: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    const positionClasses = {
        top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
        bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
        left: "right-full mr-2 top-1/2 -translate-y-1/2",
        right: "left-full ml-2 top-1/2 -translate-y-1/2",
    };

    const arrowClasses = {
        top: "top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900",
        bottom:
            "bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-900",
        left: "left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-900",
        right:
            "right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-900",
    };

    return (
        <div className="relative inline-block">
            <div
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                onFocus={() => setIsVisible(true)}
                onBlur={() => setIsVisible(false)}
                aria-describedby={id}
            >
                {children || (
                    <button
                        type="button"
                        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/10 text-white/50 hover:bg-white/20 hover:text-white/70 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-colors"
                        aria-label="Mais informações"
                        onClick={(e) => {
                            e.preventDefault();
                            setIsVisible(!isVisible);
                        }}
                        tabIndex={0}
                    >
                        <HelpCircle className="h-3 w-3" aria-hidden="true" />
                    </button>
                )}
            </div>

            {isVisible && (
                <div
                    id={id}
                    role="tooltip"
                    className={`absolute z-50 max-w-xs rounded-lg bg-gray-900 px-3 py-2 text-sm text-white shadow-lg ${positionClasses[position]}`}
                >
                    {content}
                    <div
                        className={`absolute h-0 w-0 border-4 ${arrowClasses[position]}`}
                        aria-hidden="true"
                    />
                </div>
            )}
        </div>
    );
}
