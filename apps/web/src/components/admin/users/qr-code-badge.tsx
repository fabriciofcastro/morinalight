'use client';

/**
 * 🎫 QR CODE BADGE - Crachá Digital com QR Code
 * Original: erp-textil/web/components/users/qr-code-badge.tsx
 *
 * Adaptações:
 * - Imports ajustados para @morina/ui
 * - Layout responsivo
 * - Corrigido path de importações
 */

import { Avatar, Button } from '@morina/ui';
import { Briefcase, Building2, Download, Info, MapPin, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useRef, useState } from 'react';

interface QRCodeBadgeProps {
    userId: string;
    name: string;
    email: string;
    position?: string;
    department?: string;
    photo?: string | null;
    qrCode?: string;
}

export function QRCodeBadge({
    userId,
    name,
    email,
    position,
    department,
    photo,
    qrCode,
}: QRCodeBadgeProps) {
    const badgeRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    // Gerar QR Code data (se não fornecido)
    const qrData = qrCode || `morina://user/${userId}`;

    // Gerar iniciais
    const getInitials = (name: string): string => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    // Download do badge
    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            // TODO: Implementar download como PNG usando html2canvas
            alert('Download de badge será implementado em breve!');
        } catch (error) {
            console.error('Erro ao baixar badge:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Badge Visual */}
            <div
                ref={badgeRef}
                className="w-full max-w-md mx-auto bg-gradient-to-br from-[#0A0D14] to-[#111827] border border-white/10 shadow-2xl relative overflow-hidden rounded-lg"
            >
                {/* Decorative Background */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))]" />

                <div className="p-6">
                    <div className="space-y-6">
                        {/* Header com Logo */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="bg-[hsl(var(--primary))/0.2] p-1.5 rounded-lg">
                                    <Building2 className="w-5 h-5 text-[hsl(var(--primary))]" />
                                </div>
                                <span className="font-bold text-lg text-white">MORINA LIGHT</span>
                            </div>
                            <div className="bg-white/5 border border-white/10 px-2 py-1 rounded text-xs font-mono text-white/60">
                                ID: {userId.slice(0, 8)}
                            </div>
                        </div>

                        <div className="h-px bg-white/10" />

                        {/* Foto e Dados */}
                        <div className="flex items-center gap-4">
                            <Avatar 
                                src={photo || undefined} 
                                fallback={getInitials(name)} 
                                size="3xl"
                                className="ring-4 ring-white/5 shadow-xl"
                            />

                            <div className="flex-1 space-y-2 min-w-0">
                                <h3 className="font-bold text-lg leading-tight text-white truncate">{name}</h3>
                                {position && (
                                    <p className="text-sm text-white/60 flex items-center gap-1.5 truncate">
                                        <Briefcase className="w-3.5 h-3.5" />
                                        {position}
                                    </p>
                                )}
                                {department && (
                                    <p className="text-sm text-white/50 flex items-center gap-1.5 truncate">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {department}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="h-px bg-white/10" />

                        {/* QR Code */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="bg-white p-4 rounded-xl shadow-inner border-4 border-white/5">
                                <QRCodeSVG
                                    value={qrData}
                                    size={140}
                                    level="H"
                                    includeMargin={false}
                                />
                            </div>
                            <p className="text-xs text-center text-white/40 uppercase tracking-wide">
                                Escaneie para acessar identidade
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="pt-4 border-t border-white/5">
                            <p className="text-xs text-center text-white/30 truncate">
                                {email}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ações */}
            <div className="flex gap-2 justify-center">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="border-white/10 hover:bg-white/5 text-white gap-2 cursor-pointer"
                >
                    <Download className="w-4 h-4" />
                    {isDownloading ? 'Baixando...' : 'Baixar Badge'}
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    className="border-white/10 hover:bg-white/5 text-white gap-2 cursor-pointer"
                >
                    <Share2 className="w-4 h-4" />
                    Compartilhar
                </Button>
            </div>

            {/* Info */}
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg">
                <div className="pt-4 px-4 pb-4">
                    <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-200/80 space-y-1">
                            <p className="font-medium text-blue-300">Sobre o Badge Digital:</p>
                            <ul className="list-disc list-inside space-y-1 text-xs opacity-80">
                                <li>QR Code único e seguro</li>
                                <li>Acesso rápido ao perfil corporativo</li>
                                <li>Uso digital ou impresso para acesso físico</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
