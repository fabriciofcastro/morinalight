"use client";

import { cn, Button } from "@morina/ui";
import { FileText, Upload, X, Loader2, AlertCircle, Check } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface FileUploadProps {
    value?: File | null;
    onChange: (file: File | null) => void;
    accept?: Record<string, string[]>;
    maxSize?: number; // in bytes
    disabled?: boolean;
    label?: string;
    description?: string;
}

export function FileUpload({
    value,
    onChange,
    accept = {
        "application/pdf": [".pdf"],
        "application/msword": [".doc"],
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxSize = 10 * 1024 * 1024, // 10MB
    disabled = false,
    label = "Upload de Arquivo",
    description = "Arraste e solte ou clique para selecionar (PDF, DOC, DOCX)",
}: FileUploadProps) {
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback(
        (acceptedFiles: File[], rejectedFiles: any[]) => {
            setError(null);

            // Handle rejections
            if (rejectedFiles.length > 0) {
                const rejection = rejectedFiles[0];
                if (rejection.errors[0]?.code === "file-too-large") {
                    setError(`Arquivo muito grande. Máximo: ${maxSize / 1024 / 1024}MB`);
                } else if (rejection.errors[0]?.code === "file-invalid-type") {
                    setError("Tipo de arquivo inválido.");
                } else {
                    setError("Erro ao processar arquivo");
                }
                return;
            }

            const file = acceptedFiles[0];
            if (file) {
                onChange(file);
            }
        },
        [onChange, maxSize]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxSize,
        multiple: false,
        disabled,
    });

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(null);
        setError(null);
    };

    return (
        <div className="w-full space-y-2">
            {label && <p className="text-sm font-medium text-[var(--fg)]">{label}</p>}

            <div
                {...getRootProps()}
                className={cn(
                    "relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer overflow-hidden",
                    isDragActive
                        ? "border-[var(--primary)] bg-[color-mix(in_oklab,var(--primary)_5%,transparent)]"
                        : "border-[color-mix(in_oklab,var(--border)_80%,transparent)] hover:border-[var(--primary)] hover:bg-[color-mix(in_oklab,var(--surface)_80%,transparent)]",
                    disabled && "opacity-50 cursor-not-allowed hover:bg-transparent hover:border-[color-mix(in_oklab,var(--border)_80%,transparent)]",
                    error && "border-red-500/50 bg-red-500/5"
                )}
            >
                <input {...getInputProps()} />

                {value ? (
                    <div className="flex items-center gap-4 w-full">
                        <div className="h-12 w-12 rounded-lg bg-[color-mix(in_oklab,var(--primary)_10%,transparent)] flex items-center justify-center shrink-0">
                            <FileText className="h-6 w-6 text-[var(--primary)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate text-[var(--fg)]">
                                {value.name}
                            </p>
                            <p className="text-xs text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                                {(value.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                        {!disabled && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleRemove}
                                className="hover:bg-red-500/10 hover:text-red-500 shrink-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-center">
                        <div className="h-10 w-10 rounded-full bg-[color-mix(in_oklab,var(--surface)_90%,transparent)] flex items-center justify-center mb-2">
                            <Upload className="h-5 w-5 text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-[var(--fg)]">
                                {isDragActive ? "Solte o arquivo aqui" : "Clique ou arraste o arquivo"}
                            </p>
                            <p className="text-xs text-[color-mix(in_oklab,var(--muted)_60%,var(--fg)_40%)]">
                                {description}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="flex items-center gap-2 text-xs text-red-400 mt-1.5 animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}
