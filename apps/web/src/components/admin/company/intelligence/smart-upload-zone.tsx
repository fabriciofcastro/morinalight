
"use client";

import { notificationCenter } from "@/shared/ui/notification-center";
import { companySettingsAPI } from "@/lib/api/company-settings";
import { cn } from "@morina/ui";
import { FileText, Loader2, Sparkles } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface SmartUploadZoneProps {
    onDataExtracted: (data: any) => void;
}

export function SmartUploadZone({ onDataExtracted }: SmartUploadZoneProps) {
    const [analyzing, setAnalyzing] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0]!;
        setAnalyzing(true);

        try {
            const result = await companySettingsAPI.extractCompanyData(file);
            console.log("Extracted:", result);

            notificationCenter.add({
                type: "success",
                title: "Documento Analisado",
                message: "Dados extraídos com sucesso! Verifique e confirme."
            });

            onDataExtracted(result.extracted);
        } catch (error) {
            console.error(error);
            notificationCenter.add({
                type: "error",
                title: "Falha na Análise",
                message: "Não foi possível extrair dados deste documento."
            });
        } finally {
            setAnalyzing(false);
        }
    }, [onDataExtracted]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png'],
            'application/pdf': ['.pdf']
        },
        maxFiles: 1
    });

    return (
        <div className="mb-8">
            <div
                {...getRootProps()}
                className={cn(
                    "relative overflow-hidden rounded-xl border-2 border-dashed transition-all duration-300 p-8 text-center cursor-pointer group",
                    isDragActive ? "border-indigo-500 bg-indigo-500/10 scale-[1.01]" : "border-white/10 hover:border-white/20 bg-white/5"
                )}
            >
                <input {...(getInputProps() as any)} />

                {analyzing && (
                    <div className="absolute inset-0 z-10 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
                        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-3" />
                        <p className="text-indigo-200 font-medium animate-pulse">Analisando documento com IA...</p>
                        <p className="text-white/40 text-xs mt-1">Extraindo CNPJ, Razão Social e Endereço</p>
                    </div>
                )}

                <div className="flex flex-col items-center gap-3">
                    <div className={cn(
                        "w-14 h-14 rounded-full flex items-center justify-center transition-colors shadow-lg",
                        isDragActive ? "bg-indigo-500 text-white" : "bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 group-hover:scale-110 duration-300"
                    )}>
                        <Sparkles className="w-6 h-6" />
                    </div>

                    <div className="space-y-1">
                        <p className="font-semibold text-lg text-white">Preenchimento Inteligente</p>
                        <p className="text-white/50 text-sm max-w-sm mx-auto">
                            Arraste seu <strong className="text-indigo-400">Cartão CNPJ</strong> ou <strong className="text-indigo-400">Contrato Social</strong> aqui para preencher automaticamente.
                        </p>
                    </div>

                    <div className="mt-2 text-xs text-white/30 uppercase tracking-widest font-mono">
                        Suporta JPG, PNG, PDF
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
                    <FileText className="w-24 h-24 text-white -rotate-12" />
                </div>
            </div>
        </div>
    );
}
