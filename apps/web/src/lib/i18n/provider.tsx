'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale, defaultLocale } from './config';

interface I18nContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextType>({
    locale: defaultLocale,
    setLocale: () => { },
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>(defaultLocale);

    useEffect(() => {
        // Load from localStorage
        const saved = localStorage.getItem('locale') as Locale;
        if (saved) {
            setLocaleState(saved);
        }
    }, []);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem('locale', newLocale);
    };

    return (
        <I18nContext.Provider value={{ locale, setLocale }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    return useContext(I18nContext);
}
