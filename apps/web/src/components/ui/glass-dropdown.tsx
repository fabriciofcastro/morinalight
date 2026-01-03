"use client";

import React, { createContext, useContext, useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Compound Component Pattern: GlassDropdown
 * 
 * Permite composição flexível:
 * <GlassDropdown>
 *   <GlassDropdown.Trigger>Options</GlassDropdown.Trigger>
 *   <GlassDropdown.Content>
 *     <GlassDropdown.Item onClick={...} />
 *   </GlassDropdown.Content>
 * </GlassDropdown>
 */

interface DropdownContextType {
    isOpen: boolean;
    toggle: () => void;
    close: () => void;
}

const DropdownContext = createContext<DropdownContextType | undefined>(undefined);

// 1. Root Component
export function GlassDropdown({ children, className }: { children: React.ReactNode; className?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen((prev) => !prev);
    const close = () => setIsOpen(false);

    return (
        <DropdownContext.Provider value={{ isOpen, toggle, close }}>
            <div className={`relative inline-block text-left ${className}`}>
                {children}
            </div>
        </DropdownContext.Provider>
    );
}

// 2. Trigger Component
function Trigger({ children, className }: { children: React.ReactNode; className?: string }) {
    const context = useContext(DropdownContext);
    if (!context) throw new Error("GlassDropdown.Trigger must be used within GlassDropdown");

    return (
        <button
            type="button"
            onClick={context.toggle}
            className={`flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-white ${className}`}
        >
            {children}
            <ChevronDown className={`h-4 w-4 transition-transform ${context.isOpen ? 'rotate-180' : ''}`} />
        </button>
    );
}

// 3. Content Component
function Content({ children, className }: { children: React.ReactNode; className?: string }) {
    const context = useContext(DropdownContext);
    if (!context) throw new Error("GlassDropdown.Content must be used within GlassDropdown");

    if (!context.isOpen) return null;

    return (
        <div className={`absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-black/80 backdrop-blur-xl border border-white/10 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 ${className}`}>
            <div className="py-1">
                {children}
            </div>
        </div>
    );
}

// 4. Item Component
function Item({ children, onClick, className, destructive }: { children: React.ReactNode; onClick?: () => void; className?: string; destructive?: boolean }) {
    const context = useContext(DropdownContext);

    const handleClick = () => {
        if (onClick) onClick();
        context?.close();
    };

    return (
        <button
            onClick={handleClick}
            className={`
                group flex w-full items-center px-4 py-2 text-sm transition-colors
                ${destructive
                    ? 'text-red-400 hover:bg-red-500/10'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }
                ${className}
            `}
        >
            {children}
        </button>
    );
}

// Attach sub-components
GlassDropdown.Trigger = Trigger;
GlassDropdown.Content = Content;
GlassDropdown.Item = Item;
