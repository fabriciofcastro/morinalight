"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ShieldAlert, BookOpen } from "lucide-react";

interface LGPDConsentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

export function LGPDConsentModal({
    open,
    onOpenChange,
    onConfirm,
}: LGPDConsentModalProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="bg-[#09090b] border border-white/10 max-w-2xl">
                <AlertDialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                            <ShieldAlert className="w-6 h-6 text-orange-400" />
                        </div>
                        <AlertDialogTitle className="text-xl font-bold text-white">
                            Consentimento de Tratamento de Dados (LGPD)
                        </AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="text-white/70 space-y-4 pt-2">
                        <p>
                            Em conformidade com a <strong>Lei Geral de Proteção de Dados (13.709/2018)</strong>,
                            precisamos do seu consentimento explícito para processar as alterações
                            nos dados corporativos sensíveis que você acabou de realizar.
                        </p>

                        <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-sm space-y-2">
                            <p className="font-semibold text-white">O que será armazenado:</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Histórico completo das alterações (Audit Log)</li>
                                <li>Identificação do usuário (IP, Dispositivo, ID)</li>
                                <li>Dados fiscais e bancários da organização</li>
                            </ul>
                        </div>

                        <p className="text-xs text-white/40">
                            Ao confirmar, você declara ter autoridade legal para representar a organização
                            e concorda com nossa Política de Privacidade e Tratamento de Dados.
                        </p>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-3 mt-4">
                    <div className="flex-1 flex justify-start">
                        <button className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            Ler Política Completa
                        </button>
                    </div>
                    <AlertDialogCancel className="border-white/10 text-white hover:bg-white/5 hover:text-white">
                        Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault(); // Prevent closing immediately if needed
                            //   setValidationStep("2fa"); // This logic will be handled by parent
                            onConfirm();
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white border-none"
                    >
                        Concordo e Continuar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
