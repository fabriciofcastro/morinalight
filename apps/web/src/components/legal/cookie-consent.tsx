"use client";

import { useCookieConsent } from "@/lib/lgpd/hooks";
import { Badge } from "@/shared/ui/base/badge";
import { Button } from "@/shared/ui/base/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/ui/base/dialog";
import { Label } from "@/shared/ui/base/label";
import { Switch } from "@/shared/ui/base/switch";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Cookie, Settings2, Shield } from "lucide-react";
import { useEffect, useState } from "react";

export function CookieConsent() {
  const { consent, giveConsent } = useCookieConsent();
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const [preferences, setPreferences] = useState({
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    if (consent === null) {
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    } else {
      setShowBanner(false);
      setPreferences({
        analytics: consent.analytics,
        marketing: consent.marketing,
      });
    }
  }, [consent]);

  const handleAcceptAll = () => {
    giveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    });
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleSavePreferences = () => {
    giveConsent({
      necessary: true,
      preferences: true,
      analytics: preferences.analytics,
      marketing: preferences.marketing,
    });
    setShowBanner(false);
    setShowSettings(false);
  };

  if (!showBanner && !showSettings) return null;

  return (
    <>
      <AnimatePresence>
        {showBanner && !showSettings && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} 
            className="fixed bottom-6 left-4 right-4 z-[100] mx-auto max-w-4xl"
          >
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/60 p-6 shadow-2xl backdrop-blur-xl supports-[backdrop-filter]:bg-black/40">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
                            <Cookie className="h-5 w-5 text-white/80" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-medium text-white">Privacidade e Cookies</h3>
                                <Badge variant="secondary" className="bg-white/5 hover:bg-white/5 border-white/5 text-[10px] text-zinc-400 font-normal">LGPD</Badge>
                            </div>
                            <p className="max-w-xl text-xs text-zinc-400 leading-relaxed font-light">
                                Utilizamos cookies para aprimorar sua experiência de navegação e analisar nosso tráfego. 
                                Ao clicar em "Aceitar e Continuar", você concorda com o uso de todos os cookies.
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setShowSettings(true)}
                            className="text-zinc-400 hover:text-white hover:bg-white/5 h-9"
                        >
                            <Settings2 className="mr-2 h-3.5 w-3.5" />
                            Personalizar
                        </Button>
                        <Button 
                            size="sm"
                            onClick={handleAcceptAll}
                            className="bg-white text-black hover:bg-zinc-200 h-9 px-6 font-medium"
                        >
                            Aceitar e Continuar
                        </Button>
                    </div>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-xl border-white/10 bg-black/90 backdrop-blur-2xl p-0 gap-0 overflow-hidden">
            <div className="p-6 border-b border-white/5">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg font-medium text-white">
                        <Shield className="h-5 w-5 text-zinc-400" />
                        Preferências de Cookies
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500 text-sm mt-2">
                        Gerencie suas configurações de privacidade detalhadamente.
                    </DialogDescription>
                </DialogHeader>
            </div>
          
            <div className="p-6 space-y-6">
                <div className="space-y-4">
                    {/* Strictly Necessary */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Label className="text-sm font-medium text-zinc-200">Essenciais</Label>
                                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-none text-[10px] uppercase font-bold tracking-wider h-5">Obrigatório</Badge>
                            </div>
                            <p className="text-xs text-zinc-500 leading-relaxed max-w-sm">
                                Necessários para a segurança e estabilidade da plataforma. Não podem ser desativados.
                            </p>
                        </div>
                        <Switch checked={true} disabled className="data-[state=checked]:bg-zinc-700 opacity-50" />
                    </div>

                    <div className="h-px bg-white/5 w-full" />

                    {/* Analytics */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                            <Label className="text-sm font-medium text-zinc-200">Analíticos</Label>
                            <p className="text-xs text-zinc-500 leading-relaxed max-w-sm">
                                Nos ajudam a melhorar nossos serviços coletando dados anônimos de uso.
                            </p>
                        </div>
                        <Switch 
                            checked={preferences.analytics}
                            onCheckedChange={(c) => setPreferences(p => ({ ...p, analytics: c }))}
                            className="data-[state=checked]:bg-white"
                        />
                    </div>

                    <div className="h-px bg-white/5 w-full" />

                    {/* Marketing */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                            <Label className="text-sm font-medium text-zinc-200">Marketing</Label>
                            <p className="text-xs text-zinc-500 leading-relaxed max-w-sm">
                                Utilizados para personalizar a comunicação e o conteúdo apresentados a você.
                            </p>
                        </div>
                        <Switch 
                            checked={preferences.marketing}
                            onCheckedChange={(c) => setPreferences(p => ({ ...p, marketing: c }))}
                            className="data-[state=checked]:bg-white"
                        />
                    </div>
                </div>
            </div>

            <DialogFooter className="md:justify-between p-6 bg-white/[0.02] border-t border-white/5">
                <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowSettings(false)} 
                    className="text-zinc-500 hover:text-white hover:bg-transparent px-0"
                >
                    Cancelar
                </Button>
                <div className="flex gap-3">
                    <Button 
                        variant="outline"
                        size="sm" 
                        onClick={handleSavePreferences}
                        className="border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white"
                    >
                        Salvar Minhas Escolhas
                    </Button>
                    <Button 
                        size="sm"
                        onClick={handleAcceptAll} 
                        className="bg-white text-black hover:bg-zinc-200"
                    >
                        <Check className="mr-2 h-3.5 w-3.5" />
                        Aceitar Tudo
                    </Button>
                </div>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
