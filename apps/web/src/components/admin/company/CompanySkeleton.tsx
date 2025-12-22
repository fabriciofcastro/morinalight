import { Skeleton } from "@morina/ui";

export function CompanySkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            {/* Header Skeleton */}
            <div className="relative p-8 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl">
                <div className="flex items-center gap-4 mb-3">
                    <Skeleton className="h-8 w-8 rounded bg-white/10" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64 rounded bg-white/10" />
                        <Skeleton className="h-4 w-96 rounded bg-white/5" />
                    </div>
                </div>
            </div>

            {/* Navigation Skeleton */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-10 w-32 rounded-lg bg-white/5" />
                ))}
            </div>

            {/* Content Skeleton */}
            <div className="grid grid-cols-1 gap-6">
                {/* Card 1 */}
                <div className="p-8 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl">
                    <Skeleton className="h-6 w-48 mb-6 rounded bg-white/10" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Skeleton className="h-12 w-full rounded-lg bg-white/5" />
                        <Skeleton className="h-12 w-full rounded-lg bg-white/5" />
                        <div className="md:col-span-2">
                            <Skeleton className="h-12 w-full rounded-lg bg-white/5" />
                        </div>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="p-8 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl">
                    <Skeleton className="h-6 w-48 mb-6 rounded bg-white/10" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Skeleton className="h-12 w-full rounded-lg bg-white/5" />
                        <Skeleton className="h-12 w-full rounded-lg bg-white/5" />
                        <Skeleton className="h-12 w-full rounded-lg bg-white/5" />
                    </div>
                </div>
            </div>
        </div>
    );
}
