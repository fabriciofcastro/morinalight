import { TimeWindow } from "./types";
/**
 * TBAC Evaluator
 * Checks if the current time is within allowed windows.
 */
export declare class TemporalEvaluator {
    /**
     * Checks if a given date is within any of the provided time windows.
     */
    static isWithinAllowedWindows(now: Date, windows: TimeWindow[]): boolean;
    /**
     * Convenience method to check "now"
     */
    static check(windows: TimeWindow[]): boolean;
}
