import { addDays, isAfter, isBefore, isWithinInterval, parseISO, startOfDay, subDays } from "date-fns";

export type DateRangePreset = "7d" | "30d" | "90d" | "custom";

export interface DateRangeFilter {
    start: Date;
    end: Date;
    preset: DateRangePreset;
}

/**
 * Parse a date range preset into actual start/end dates
 */
export function parseDateRange(preset: DateRangePreset, customStart?: Date, customEnd?: Date): DateRangeFilter {
    const now = new Date();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    if (preset === "custom" && customStart && customEnd) {
        return {
            start: startOfDay(customStart),
            end: endOfToday,
            preset: "custom"
        };
    }

    let start: Date;
    switch (preset) {
        case "7d":
            start = subDays(endOfToday, 7);
            break;
        case "30d":
            start = subDays(endOfToday, 30);
            break;
        case "90d":
            start = subDays(endOfToday, 90);
            break;
        default:
            start = subDays(endOfToday, 30); // default to 30 days
    }

    return {
        start: startOfDay(start),
        end: endOfToday,
        preset
    };
}

/**
 * Filter entities by creation date within range
 */
export function filterByDateRange<T extends { createdAt: string | Date }>(
    entities: T[],
    range: DateRangeFilter
): T[] {
    return entities.filter(entity => {
        const createdAt = typeof entity.createdAt === 'string'
            ? parseISO(entity.createdAt)
            : entity.createdAt;

        return isWithinInterval(createdAt, { start: range.start, end: range.end });
    });
}

/**
 * Get optimal time bucket granularity based on date range
 */
export function getTimeBucketGranularity(range: DateRangeFilter): 'day' | 'week' | 'month' {
    const daysDiff = Math.ceil((range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff <= 14) return 'day';
    if (daysDiff <= 60) return 'week';
    return 'month';
}

/**
 * Generate time buckets for growth chart based on range and granularity
 */
export function generateTimeBuckets(range: DateRangeFilter): Date[] {
    const granularity = getTimeBucketGranularity(range);
    const buckets: Date[] = [];
    let current = new Date(range.start);

    while (isBefore(current, range.end) || current.getTime() === range.end.getTime()) {
        buckets.push(new Date(current));

        switch (granularity) {
            case 'day':
                current = addDays(current, 1);
                break;
            case 'week':
                current = addDays(current, 7);
                break;
            case 'month':
                current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
                break;
        }
    }

    return buckets;
}

/**
 * Format bucket label based on granularity
 */
export function formatBucketLabel(date: Date, granularity: 'day' | 'week' | 'month'): string {
    switch (granularity) {
        case 'day':
            return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        case 'week':
            return `S${Math.ceil(date.getDate() / 7)} ${date.toLocaleDateString('pt-BR', { month: 'short' })}`;
        case 'month':
            return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
    }
}
