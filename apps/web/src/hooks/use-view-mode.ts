"use client";

import { useState, useEffect } from 'react';

type ViewMode = 'grid' | 'list';

export function useViewMode(key: string, defaultMode: ViewMode = 'grid'): [ViewMode, (mode: ViewMode) => void] {
    const [viewMode, setViewModeState] = useState<ViewMode>(defaultMode);

    // Load from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(`viewMode:${key}`);
            if (saved === 'grid' || saved === 'list') {
                setViewModeState(saved);
            }
        }
    }, [key]);

    // Save to localStorage when changed
    const setViewMode = (mode: ViewMode) => {
        setViewModeState(mode);
        if (typeof window !== 'undefined') {
            localStorage.setItem(`viewMode:${key}`, mode);
        }
    };

    return [viewMode, setViewMode];
}
