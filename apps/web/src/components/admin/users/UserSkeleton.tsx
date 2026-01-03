"use client";

import { motion } from "framer-motion";

interface UserSkeletonProps {
    variant?: "grid" | "list" | "form" | "detail";
    count?: number;
}

export function UserSkeleton({ variant = "grid", count = 6 }: UserSkeletonProps) {
    const items = Array.from({ length: count }, (_, i) => i);

    if (variant === "grid") {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((i) => (
                    <UserCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (variant === "list") {
        return (
            <div className="space-y-3">
                {items.map((i) => (
                    <UserListItemSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (variant === "form") {
        return <UserFormSkeleton />;
    }

    if (variant === "detail") {
        return <UserDetailSkeleton />;
    }

    return null;
}

// Grid card skeleton
function UserCardSkeleton() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm"
        >
            {/* Avatar and header */}
            <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-white/10 to-white/5 animate-pulse" />
                <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-5 bg-white/10 rounded animate-pulse w-3/4" />
                    <div className="h-4 bg-white/5 rounded animate-pulse w-1/2" />
                </div>
            </div>

            {/* Status badge */}
            <div className="h-6 w-20 bg-white/10 rounded-full animate-pulse mb-4" />

            {/* Info lines */}
            <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                    <div className="h-3 bg-white/5 rounded animate-pulse w-1/3" />
                    <div className="h-3 bg-white/5 rounded animate-pulse w-1/4" />
                </div>
                <div className="flex justify-between">
                    <div className="h-3 bg-white/5 rounded animate-pulse w-1/4" />
                    <div className="h-3 bg-white/5 rounded animate-pulse w-1/3" />
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-4 border-t border-white/10">
                <div className="h-10 flex-1 bg-white/10 rounded animate-pulse" />
                <div className="h-10 flex-1 bg-white/10 rounded animate-pulse" />
            </div>
        </motion.div>
    );
}

// List item skeleton
function UserListItemSkeleton() {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 rounded-lg border border-white/10 bg-white/[0.05] backdrop-blur-sm flex items-center gap-4"
        >
            {/* Checkbox */}
            <div className="w-4 h-4 rounded border border-white/20 bg-white/5 animate-pulse" />

            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-white/5 animate-pulse flex-shrink-0" />

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-3">
                    <div className="h-4 bg-white/10 rounded animate-pulse w-1/4" />
                    <div className="h-5 w-16 bg-white/10 rounded-full animate-pulse" />
                </div>
                <div className="h-3 bg-white/5 rounded animate-pulse w-1/3" />
                <div className="h-3 bg-white/5 rounded animate-pulse w-1/2" />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <div className="h-9 w-12 bg-white/10 rounded animate-pulse" />
                <div className="h-9 w-12 bg-white/10 rounded animate-pulse" />
            </div>
        </motion.div>
    );
}

// Form skeleton
function UserFormSkeleton() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-sm"
            >
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-white/10 rounded animate-pulse" />
                    <div className="space-y-2 flex-1">
                        <div className="h-8 bg-white/10 rounded animate-pulse w-1/3" />
                        <div className="h-4 bg-white/5 rounded animate-pulse w-1/2" />
                    </div>
                </div>
            </motion.div>

            {/* Form sections */}
            {[1, 2, 3].map((section) => (
                <motion.div
                    key={section}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: section * 0.1 }}
                    className="p-8 rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-sm space-y-6"
                >
                    {/* Section title */}
                    <div className="h-6 bg-white/10 rounded animate-pulse w-1/4" />

                    {/* Form fields */}
                    <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((field) => (
                            <div key={field} className="space-y-2">
                                <div className="h-4 bg-white/5 rounded animate-pulse w-1/4" />
                                <div className="h-12 bg-white/10 rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                </motion.div>
            ))}

            {/* Footer actions */}
            <div className="flex justify-between gap-4">
                <div className="h-12 w-32 bg-white/10 rounded animate-pulse" />
                <div className="flex gap-3">
                    <div className="h-12 w-32 bg-white/10 rounded animate-pulse" />
                    <div className="h-12 w-32 bg-blue-500/20 rounded animate-pulse" />
                </div>
            </div>
        </div>
    );
}

// Detail page skeleton
function UserDetailSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header with avatar */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-sm"
            >
                <div className="flex items-start gap-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-white/10 to-white/5 animate-pulse" />
                    <div className="flex-1 space-y-3">
                        <div className="h-8 bg-white/10 rounded animate-pulse w-1/3" />
                        <div className="h-5 bg-white/5 rounded animate-pulse w-1/2" />
                        <div className="flex gap-3">
                            <div className="h-6 w-20 bg-white/10 rounded-full animate-pulse" />
                            <div className="h-6 w-20 bg-white/10 rounded-full animate-pulse" />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-white/10">
                {[1, 2, 3, 4].map((tab) => (
                    <div
                        key={tab}
                        className="h-10 w-24 bg-white/10 rounded-t animate-pulse"
                    />
                ))}
            </div>

            {/* Content sections */}
            <div className="grid grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((card) => (
                    <motion.div
                        key={card}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: card * 0.1 }}
                        className="p-6 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm space-y-4"
                    >
                        <div className="h-5 bg-white/10 rounded animate-pulse w-1/3" />
                        <div className="space-y-2">
                            <div className="h-4 bg-white/5 rounded animate-pulse" />
                            <div className="h-4 bg-white/5 rounded animate-pulse w-5/6" />
                            <div className="h-4 bg-white/5 rounded animate-pulse w-4/6" />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
