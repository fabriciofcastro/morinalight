"use client";

import { useCallback, useState } from "react";
import { Upload, X, FileText, Image as ImageIcon, File, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface UploadedFile {
    id: string;
    name: string;
    size: number;
    type: string;
    url?: string;
    uploadedAt?: string;
    category?: string;
}

interface FileUploadZoneProps {
    onFilesSelected: (files: File[]) => void;
    onFileRemove?: (fileId: string) => void;
    uploadedFiles?: UploadedFile[];
    maxFiles?: number;
    maxSizeMB?: number;
    acceptedTypes?: string[];
    isUploading?: boolean;
    error?: string;
    className?: string;
}

const ACCEPTED_FILE_TYPES = {
    "application/pdf": [".pdf"],
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
};

const FILE_ICONS: Record<string, any> = {
    "application/pdf": FileText,
    "image/jpeg": ImageIcon,
    "image/png": ImageIcon,
    "image/webp": ImageIcon,
};

function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}

export function FileUploadZone({
    onFilesSelected,
    onFileRemove,
    uploadedFiles = [],
    maxFiles = 10,
    maxSizeMB = 10,
    acceptedTypes = Object.keys(ACCEPTED_FILE_TYPES),
    isUploading = false,
    error,
    className,
}: FileUploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [validationError, setValidationError] = useState<string>("");

    const validateFiles = useCallback(
        (files: FileList | File[]): File[] => {
            const fileArray = Array.from(files);
            const maxSizeBytes = maxSizeMB * 1024 * 1024;

            // Check max files
            if (uploadedFiles.length + fileArray.length > maxFiles) {
                setValidationError(`Máximo de ${maxFiles} arquivos permitidos`);
                return [];
            }

            // Validate each file
            const validFiles: File[] = [];
            for (const file of fileArray) {
                // Check file type
                if (!acceptedTypes.includes(file.type)) {
                    setValidationError(
                        `Tipo de arquivo não permitido: ${file.name}. Apenas PDF e imagens são aceitos.`
                    );
                    continue;
                }

                // Check file size
                if (file.size > maxSizeBytes) {
                    setValidationError(
                        `Arquivo muito grande: ${file.name}. Tamanho máximo: ${maxSizeMB}MB`
                    );
                    continue;
                }

                validFiles.push(file);
            }

            if (validFiles.length > 0) {
                setValidationError("");
            }

            return validFiles;
        },
        [acceptedTypes, maxFiles, maxSizeMB, uploadedFiles.length]
    );

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const validFiles = validateFiles(files);
                if (validFiles.length > 0) {
                    onFilesSelected(validFiles);
                }
            }
        },
        [onFilesSelected, validateFiles]
    );

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (files && files.length > 0) {
                const validFiles = validateFiles(files);
                if (validFiles.length > 0) {
                    onFilesSelected(validFiles);
                }
            }
            // Reset input
            e.target.value = "";
        },
        [onFilesSelected, validateFiles]
    );

    const displayError = error || validationError;

    return (
        <div className={cn("space-y-4", className)}>
            {/* Upload Zone */}
            <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    "relative border-2 border-dashed rounded-xl p-8 transition-all duration-200",
                    isDragging
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/10",
                    isUploading && "opacity-50 pointer-events-none"
                )}
            >
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    multiple
                    accept={acceptedTypes.join(",")}
                    onChange={handleFileInput}
                    disabled={isUploading}
                />

                <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center cursor-pointer"
                >
                    <div className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors",
                        isDragging ? "bg-blue-500/20" : "bg-white/10"
                    )}>
                        <Upload className={cn(
                            "w-8 h-8 transition-colors",
                            isDragging ? "text-blue-400" : "text-white/70"
                        )} />
                    </div>

                    <p className="text-lg font-medium text-white mb-1">
                        {isDragging ? "Solte os arquivos aqui" : "Arraste arquivos ou clique para selecionar"}
                    </p>
                    <p className="text-sm text-gray-400">
                        PDF, JPG, PNG até {maxSizeMB}MB • Máximo {maxFiles} arquivos
                    </p>

                    {isUploading && (
                        <div className="mt-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    )}
                </label>
            </div>

            {/* Error Message */}
            {displayError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-400">{displayError}</p>
                </div>
            )}

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-white/90">
                        Arquivos ({uploadedFiles.length}/{maxFiles})
                    </h4>
                    <div className="space-y-2">
                        {uploadedFiles.map((file) => {
                            const Icon = FILE_ICONS[file.type] || File;
                            return (
                                <div
                                    key={file.id}
                                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                        <Icon className="w-5 h-5 text-blue-400" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">
                                            {file.name}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <span>{formatFileSize(file.size)}</span>
                                            {file.category && (
                                                <>
                                                    <span>•</span>
                                                    <span>{file.category}</span>
                                                </>
                                            )}
                                            {file.uploadedAt && (
                                                <>
                                                    <span>•</span>
                                                    <span>{new Date(file.uploadedAt).toLocaleDateString("pt-BR")}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {file.url && (
                                        <a
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                            title="Visualizar"
                                        >
                                            <Check className="w-4 h-4 text-green-400" />
                                        </a>
                                    )}

                                    {onFileRemove && (
                                        <button
                                            onClick={() => onFileRemove(file.id)}
                                            className="p-2 rounded-lg hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100"
                                            title="Remover"
                                        >
                                            <X className="w-4 h-4 text-red-400" />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
