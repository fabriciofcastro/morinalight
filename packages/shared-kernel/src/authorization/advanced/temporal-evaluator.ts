import { TimeWindow } from "./types";

/**
 * TBAC Evaluator
 * Checks if the current time is within allowed windows.
 */
export class TemporalEvaluator {
    /**
     * Checks if a given date is within any of the provided time windows.
     */
    static isWithinAllowedWindows(now: Date, windows: TimeWindow[]): boolean {
        if (windows.length === 0) return true; // Default to always allow if no windows defined

        const currentDay = now.getDay();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTimeInMinutes = currentHour * 60 + currentMinute;

        return windows.some(window => {
            // Check day of week
            if (!window.daysOfWeek.includes(currentDay)) return false;

            // Parse start/end times
            const [startH, startM] = window.startTime.split(":").map(Number);
            const [endH, endM] = window.endTime.split(":").map(Number);
            const startInMinutes = startH * 60 + startM;
            const endInMinutes = endH * 60 + endM;

            // Simple check (doesn't handle midnight wraparound yet)
            if (startInMinutes <= endInMinutes) {
                return currentTimeInMinutes >= startInMinutes && currentTimeInMinutes <= endInMinutes;
            } else {
                // Handle wrap around midnight (e.g., 22:00 to 06:00)
                return currentTimeInMinutes >= startInMinutes || currentTimeInMinutes <= endInMinutes;
            }
        });
    }

    /**
     * Convenience method to check "now"
     */
    static check(windows: TimeWindow[]): boolean {
        return this.isWithinAllowedWindows(new Date(), windows);
    }
}
