import { Skeleton } from "@morina/ui";

export function BranchesSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48 bg-white/10" />
                    <Skeleton className="h-4 w-64 bg-white/5" />
                </div>
                <Skeleton className="h-10 w-32 bg-white/10" />
            </div>

            {/* Filters Skeleton */}
            <div className="flex gap-4">
                <Skeleton className="h-10 flex-1 bg-white/5" />
                <Skeleton className="h-10 w-32 bg-white/5" />
                <Skeleton className="h-10 w-32 bg-white/5" />
            </div>

            {/* Grid Skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-lg bg-white/10" />
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-32 bg-white/10" />
                                    <Skeleton className="h-3 w-16 bg-white/5" />
                                </div>
                            </div>
                            <Skeleton className="h-8 w-8 rounded bg-white/5" />
                        </div>
                        <div className="space-y-3">
                            <Skeleton className="h-4 w-full bg-white/5" />
                            <Skeleton className="h-4 w-3/4 bg-white/5" />
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-between">
                            <Skeleton className="h-5 w-16 rounded-full bg-white/10" />
                            <Skeleton className="h-5 w-24 bg-white/5" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
