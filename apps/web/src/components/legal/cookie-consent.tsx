"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";

type Consent = {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
    preferences: boolean;
};

const DEFAULT_CONSENT: Consent = {
    necessary: true, // Always true
    analytics: false,
    marketing: false,
    preferences: false,
};

export function CookieConsent() {
    const [isOpen, setIsOpen] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [consent, setConsent] = useState<Consent>(DEFAULT_CONSENT);

    useEffect(() => {
        // Check if consent is already saved
        const savedConsent = localStorage.getItem("cookie-consent");
        if (!savedConsent) {
            setIsOpen(true);
        } else {
            // If needed, we can load it here to allow editing settings
        }
    }, []);

    const handleAcceptAll = () => {
        const allConsent = {
            necessary: true,
            analytics: true,
            marketing: true,
            preferences: true,
        };
        saveConsent(allConsent);
    };

    const handleAcceptSelected = () => {
        saveConsent(consent);
    };

    const saveConsent = (consentData: Consent) => {
        localStorage.setItem("cookie-consent", JSON.stringify(consentData));
        setIsOpen(false);

        // Trigger analytics/marketing scripts here based on consent
        if (consentData.analytics) {
            console.log("Analytics cookies enabled");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[9999] max-w-md animate-in slide-in-from-bottom-5 fade-in duration-500">
            <Card className="border-primary/20 shadow-2xl backdrop-blur-xl bg-background/95">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        🍪 Configuração de Cookies
                    </CardTitle>
                    <CardDescription>
                        Nós usamos cookies para melhorar sua experiência. Alguns são essenciais,
                        enquanto outros nos ajudam a melhorar o site.
                    </CardDescription>
                </CardHeader>

                {showDetails && (
                    <CardContent className="grid gap-4 py-4">
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="necessary" className="flex flex-col space-y-1">
                                <span>Necessários</span>
                                <span className="font-normal text-xs text-muted-foreground">
                                    Essenciais para o funcionamento do site.
                                </span>
                            </Label>
                            <Switch id="necessary" checked={true} disabled />
                        </div>

                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="analytics" className="flex flex-col space-y-1">
                                <span>Analíticos</span>
                                <span className="font-normal text-xs text-muted-foreground">
                                    Nos ajudam a entender como você usa o site.
                                </span>
                            </Label>
                            <Switch
                                id="analytics"
                                checked={consent.analytics}
                                onCheckedChange={(c) => setConsent({ ...consent, analytics: c })}
                            />
                        </div>

                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="marketing" className="flex flex-col space-y-1">
                                <span>Marketing</span>
                                <span className="font-normal text-xs text-muted-foreground">
                                    Usados para personalizar anúncios.
                                </span>
                            </Label>
                            <Switch
                                id="marketing"
                                checked={consent.marketing}
                                onCheckedChange={(c) => setConsent({ ...consent, marketing: c })}
                            />
                        </div>
                    </CardContent>
                )}

                <CardFooter className="flex flex-col gap-2 pt-2">
                    <div className="flex gap-2 w-full">
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setShowDetails(!showDetails)}
                        >
                            {showDetails ? "Menos Detalhes" : "Personalizar"}
                        </Button>
                        <Button
                            className="w-full"
                            onClick={handleAcceptAll}
                        >
                            Aceitar Tudo
                        </Button>
                    </div>
                    {showDetails && (
                        <Button
                            variant="secondary"
                            className="w-full"
                            onClick={handleAcceptSelected}
                        >
                            Salvar Preferências
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
