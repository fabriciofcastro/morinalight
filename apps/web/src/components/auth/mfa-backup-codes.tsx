/**
 * MFA Backup Codes Display Component
 * 
 * Exibe backup codes com opção de copiar e download
 */

"use client";

import { useState } from "react";
import { Copy, Download, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MFABackupCodesProps {
    codes: string[];
    onClose?: () => void;
}

export function MFABackupCodes({ codes, onClose }: MFABackupCodesProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const text = codes.join("\n");
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const text = codes.join("\n");
        const blob = new Blob([text], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `mfa-backup-codes-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800 font-medium">
                    ⚠️ Guarde estes códigos em um local seguro
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                    Você pode usar cada código apenas uma vez para fazer login caso perca acesso ao seu
                    autenticador.
                </p>
            </div>

            {/* Codes Grid */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                {codes.map((code, index) => (
                    <div
                        key={index}
                        className="font-mono text-sm bg-white px-3 py-2 rounded border border-gray-300 text-center"
                    >
                        {code}
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <Button
                    onClick={handleCopy}
                    variant="outline"
                    className="flex-1"
                    disabled={copied}
                >
                    {copied ? (
                        <>
                            <Check className="w-4 h-4 mr-2" />
                            Copiado!
                        </>
                    ) : (
                        <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar Códigos
                        </>
                    )}
                </Button>

                <Button onClick={handleDownload} variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Baixar .txt
                </Button>
            </div>

            {/* Close Button */}
            {onClose && (
                <Button onClick={onClose} className="w-full">
                    Entendi, guardei os códigos
                </Button>
            )}
        </div>
    );
}
