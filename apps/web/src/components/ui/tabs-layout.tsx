"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Tab {
    id: string;
    label: string;
    icon?: React.ReactNode;
}

interface TabsLayoutProps {
    tabs: Tab[];
    children: (activeTab: string) => React.ReactNode;
    className?: string;
}

export function TabsLayout({ tabs, children, className }: TabsLayoutProps) {
    const [activeTab, setActiveTab] = useState(tabs[0].id);

    return (
        <div className={cn("space-y-6", className)}>
            {/* Tab Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto border-b border-white/10 pb-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                            activeTab === tab.id
                                ? "text-white bg-white/10"
                                : "text-white/50 hover:text-white hover:bg-white/5"
                        )}
                    >
                        {tab.icon && <span className="h-4 w-4">{tab.icon}</span>}
                        {tab.label}
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[hsl(var(--primary))]"
                                initial={false}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {children(activeTab)}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
