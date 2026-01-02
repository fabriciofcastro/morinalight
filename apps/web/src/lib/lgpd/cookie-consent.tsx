/**
 * LGPD Compliance - Cookie Consent
 * 
 * Sistema de consentimento de cookies conforme LGPD
 */

"use client";

import { useState, useEffect } from "react";
import { useLocalStorage } from "@/lib/component-architecture";

export interface CookieConsent {
    necessary: boolean; // Sempre true
    analytics: boolean;
    marketing: boolean;
    preferences: boolean;
    timestamp: string;
    version: string; // Versão da política de privacidade
}

export function useCookieConsent() {
    const [consent, setConsent] = useLocalStorage<CookieConsent | null>(
        "cookie-consent",
        null,
    );

    const giveConsent = (newConsent: Omit<CookieConsent, "timestamp" | "version">) => {
        setConsent({
            ...newConsent,
            timestamp: new Date().toISOString(),
            version: "1.0", // Atualizar quando política mudar
        });
    };

    const revokeConsent = () => {
        setConsent(null);
    };

    const hasConsent = (type: keyof CookieConsent): boolean => {
        return consent?.[type] === true;
    };

    return {
        consent,
        giveConsent,
        revokeConsent,
        hasConsent,
    };
}

export function CookieConsentBanner() {
    const { consent, giveConsent } = useCookieConsent();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Mostrar banner se não houver consentimento
        if (!consent) {
            setIsVisible(true);
        }
    }, [consent]);

    if (!isVisible || consent) {
        return null;
    }

    const acceptAll = () => {
        giveConsent({
            necessary: true,
            analytics: true,
            marketing: true,
            preferences: true,
        });
        setIsVisible(false);
    };

    const acceptNecessary = () => {
        giveConsent({
            necessary: true,
            analytics: false,
            marketing: false,
            preferences: false,
        });
        setIsVisible(false);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white p-6 shadow-lg dark:bg-gray-900">
            <div className="container mx-auto max-w-6xl">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                        <h3 className="mb-2 text-lg font-semibold">
                            Este site usa cookies
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Usamos cookies para melhorar sua experiência, personalizar conteúdo
                            e analisar nosso tráfego. Ao clicar em "Aceitar Todos", você
                            concorda com o uso de todos os cookies.{" "}
                            <a
                                href="/privacy-policy"
                                className="underline hover:text-primary"
                            >
                                Política de Privacidade
                            </a>
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={acceptNecessary}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                        >
                            Apenas Necessários
                        </button>
                        <button
                            onClick={acceptAll}
                            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                        >
                            Aceitar Todos
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Hook para verificar se pode usar analytics
 */
export function useAnalytics() {
    const { hasConsent } = useCookieConsent();

    return {
        canUseAnalytics: hasConsent("analytics"),
        canUseMarketing: hasConsent("marketing"),
    };
}
