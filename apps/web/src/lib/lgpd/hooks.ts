import { CookieService } from "@/shared/kernel/utils/cookie-service";
import { useEffect, useState } from "react";

export interface CookieConsent {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
    preferences: boolean;
    timestamp: string;
    version: string;
}

export function useCookieConsent() {
    // Initial state from cookie
    const getStoredConsent = (): CookieConsent | null => {
        const stored = CookieService.get("cookie-consent");
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                return null;
            }
        }
        return null;
    };

    const [consent, setConsent] = useState<CookieConsent | null>(null);

    // Sync with cookie on mount
    useEffect(() => {
        setConsent(getStoredConsent());
    }, []);

    const giveConsent = (newConsent: Omit<CookieConsent, "timestamp" | "version">) => {
        const fullConsent = {
            ...newConsent,
            timestamp: new Date().toISOString(),
            version: "1.0",
        };
        
        setConsent(fullConsent);
        
        // Save to cookies
        CookieService.set("cookie-consent", JSON.stringify(fullConsent), { expires: 365 });
        
        // Server sync
        CookieService.set("morina_consent", JSON.stringify({
            a: fullConsent.analytics,
            m: fullConsent.marketing,
            p: fullConsent.preferences,
            v: "1.0"
        }), { expires: 365 });
    };

    const revokeConsent = () => {
        setConsent(null);
        CookieService.remove("cookie-consent");
        CookieService.remove("morina_consent");
    };

    const hasConsent = (type: keyof CookieConsent): boolean => {
        // Optimistic check: if state is null, check cookie directly
        if (!consent) {
            const stored = getStoredConsent();
            return stored?.[type] === true;
        }
        return consent[type] === true;
    };

    return {
        consent,
        giveConsent,
        revokeConsent,
        hasConsent,
    };
}

export function useAnalytics() {
    const { hasConsent } = useCookieConsent();

    return {
        canUseAnalytics: hasConsent("analytics"),
        canUseMarketing: hasConsent("marketing"),
    };
}
