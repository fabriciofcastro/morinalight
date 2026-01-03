"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

export function HoverBorderGradient({
    children,
    containerClassName,
    className,
    as: Tag = "button",
    duration = 1,
    clockwise = true,
    ...props
}: React.PropsWithChildren<
    {
        as?: React.ElementType;
        containerClassName?: string;
        className?: string;
        duration?: number;
        clockwise?: boolean;
    } & React.HTMLAttributes<HTMLElement>
>) {
    const [hovered, setHovered] = useState<boolean>(false);

    return (
        <Tag
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={cn(
                "relative flex h-min w-fit flex-col flex-nowrap content-center items-center justify-center overflow-hidden rounded-md p-[1px] decoration-clone transition-all duration-500",
                containerClassName
            )}
            {...props}
        >
            {/* Content Container - Fica por cima da animação */}
            <div
                className={cn(
                    "relative z-10 w-auto rounded-[inherit] bg-black/80 px-4 py-2 text-white/80",
                    className
                )}
            >
                {children}
            </div>

            {/* Spinning Gradient Layer */}
            <div
                className={cn(
                    "absolute inset-0 z-0 flex items-center justify-center overflow-hidden rounded-[inherit]"
                )}
            >
                <div
                    className="absolute aspect-square h-[200%] w-[200%] animate-spin bg-[conic-gradient(from_0deg,transparent_0_340deg,hsl(var(--primary))_360deg)] opacity-60"
                    style={{
                        animationDuration: hovered ? "1.5s" : "3s",
                        animationTimingFunction: "linear"
                    }}
                />
            </div>

            {/* Static Border Fallback / Background under the spinner */}
            <div className="absolute inset-0 z-0 bg-[hsl(var(--primary)/0.1)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </Tag>
    );
}
