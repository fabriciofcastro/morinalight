"use client";

import { useState, useMemo } from "react";
import { QrCode, Download, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@morina/ui";

interface UserQRCodeProps {
    userId: string;
    displayName: string;
    email: string;
}

export function UserQRCode({ userId, displayName, email }: UserQRCodeProps) {
    const [copied, setCopied] = useState(false);

    // Generate URL for user profile
    const profileUrl = useMemo(() => {
        if (typeof window !== "undefined") {
            return `${window.location.origin}/profile/${userId}`;
        }
        return `https://app.morina.com.br/profile/${userId}`;
    }, [userId]);

    // Simple QR Code generation using external API
    const qrCodeUrl = useMemo(() => {
        return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(profileUrl)}`;
    }, [profileUrl]);

    const handleCopyUrl = async () => {
        try {
            await navigator.clipboard.writeText(profileUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = qrCodeUrl;
        link.download = `qrcode-${userId}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-6 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm space-y-4">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center">
                    <QrCode className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h3 className="font-semibold text-white/90">QR Code do Perfil</h3>
                    <p className="text-sm text-white/60">Compartilhe o perfil facilmente</p>
                </div>
            </div>

            {/* QR Code Display */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex justify-center p-8 bg-white rounded-xl"
            >
                <img
                    src={qrCodeUrl}
                    alt={`QR Code para ${displayName}`}
                    className="w-64 h-64"
                />
            </motion.div>

            {/* User Info */}
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <p className="text-sm font-medium text-white/90 mb-1">{displayName}</p>
                <p className="text-xs text-white/60">{email}</p>
            </div>

            {/* URL */}
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={profileUrl}
                    readOnly
                    className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/80 font-mono"
                />
                <Button
                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[40px] px-4"
                    onClick={handleCopyUrl}
                >
                    {copied ? (
                        <>
                            <Check className="h-4 w-4 mr-2" />
                            Copiado!
                        </>
                    ) : (
                        <>
                            <Copy className="h-4 w-4 mr-2" />
                            Copiar
                        </>
                    )}
                </Button>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <Button
                    className="flex-1 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white border-0 shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)] cursor-pointer h-[40px]"
                    onClick={handleDownload}
                >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar QR Code
                </Button>
            </div>

            <p className="text-xs text-white/50 text-center">
                Escaneie o QR Code para acessar o perfil público
            </p>
        </div>
    );
}
