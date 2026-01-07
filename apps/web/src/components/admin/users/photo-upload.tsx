'use client';

/**
 * 📸 PHOTO UPLOAD - Componente Moderno para Upload de Foto
 * Original: erp-textil/web/components/users/photo-upload.tsx
 *
 * Adaptações:
 * - Imports ajustados para @morina/ui
 * - Layout responsivo
 */

import { Avatar, Button } from '@morina/ui';
import { AlertCircle, Check, CloudUpload, Info, Loader2, Upload, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface PhotoUploadProps {
    currentPhoto?: string | null;
    userName?: string;
    onPhotoChange?: (file: File | null) => void;
    disabled?: boolean;
}

export function PhotoUpload({
    currentPhoto,
    userName = 'User',
    onPhotoChange,
    disabled = false,
}: PhotoUploadProps) {
    const [preview, setPreview] = useState<string | null>(currentPhoto || null);
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Gerar iniciais do nome
    const getInitials = (name: string): string => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const onDrop = useCallback(
        async (acceptedFiles: File[], rejectedFiles: any[]) => {
            setError(null);

            // Validar rejeições
            if (rejectedFiles.length > 0) {
                const rejection = rejectedFiles[0];
                if (rejection.errors[0]?.code === 'file-too-large') {
                    setError('Arquivo muito grande. Máximo: 5MB');
                } else if (rejection.errors[0]?.code === 'file-invalid-type') {
                    setError('Tipo de arquivo inválido. Use JPG, PNG ou WEBP');
                } else {
                    setError('Erro ao processar arquivo');
                }
                return;
            }

            const file = acceptedFiles[0];
            if (!file) return;

            setIsUploading(true);

            try {
                // Criar preview local
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result as string);
                };
                reader.readAsDataURL(file);

                // Notificar componente pai
                if (onPhotoChange) {
                    onPhotoChange(file);
                }
            } catch (err: any) {
                setError('Erro ao processar imagem');
                console.error(err);
            } finally {
                setIsUploading(false);
            }
        },
        [onPhotoChange],
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
        },
        maxSize: 5 * 1024 * 1024, // 5MB
        multiple: false,
        disabled: disabled || isUploading,
    });

    const handleRemovePhoto = () => {
        setPreview(null);
        setError(null);
        if (onPhotoChange) {
            onPhotoChange(null);
        }
    };

    return (
        <div className="flex flex-col items-center gap-6">
            {/* Avatar Preview */}
            <div className="relative group">
                <Avatar
                    size="xl"
                    src={preview || undefined}
                    fallback={getInitials(userName)}
                    className="w-40 h-40 ring-4 ring-white/10 shadow-xl transition-all group-hover:ring-[hsl(var(--primary))/0.5]"
                />

                {preview && !disabled && (
                    <Button
                        type="button"
                        variant="danger"
                        size="icon"
                        className="absolute -top-2 -right-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={handleRemovePhoto}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                )}

                {isUploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <div className="animate-spin">
                            <Loader2 className="w-8 h-8 text-white" />
                        </div>
                    </div>
                )}
            </div>

            {/* Upload Area */}
            <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-lg">
                <div className="pt-6 px-6 pb-6">
                    <div
                        {...(getRootProps() as any)}
                        className={`
              border-2 border-dashed rounded-lg p-8 cursor-pointer text-center
              transition-all duration-200
              ${isDragActive
                                ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))/0.1] scale-105'
                                : 'border-white/20 hover:border-[hsl(var(--primary))/0.5] hover:bg-white/5'
                            }
              ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
                    >
                        <input {...(getInputProps() as any)} />

                        <div className="flex flex-col items-center gap-4">
                            {isDragActive ? (
                                <>
                                    <div className="w-16 h-16 rounded-full bg-[hsl(var(--primary))/0.2] flex items-center justify-center">
                                        <Upload className="w-8 h-8 text-[hsl(var(--primary))] animate-bounce" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold text-white">Solte a imagem aqui</p>
                                        <p className="text-sm text-white/50">
                                            Para fazer o upload
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                                        <CloudUpload className="w-8 h-8 text-white/50" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold text-white">
                                            Arraste ou clique para selecionar
                                        </p>
                                        <p className="text-sm text-white/50 mt-1">
                                            JPG, PNG ou WEBP (máx. 5MB)
                                        </p>
                                    </div>
                                </>
                            )}

                            {preview && (
                                <div className="flex items-center gap-2 text-sm text-emerald-400">
                                    <Check className="w-4 h-4" />
                                    <span>Foto carregada com sucesso</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mt-4 flex items-center gap-2 text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Info */}
                    <div className="mt-4 flex items-start gap-2 text-xs text-white/50 bg-white/5 p-3 rounded-lg border border-white/5">
                        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium mb-1 text-white/80">Dicas para uma boa foto:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Use uma foto recente e de boa qualidade</li>
                                <li>Prefira fundo neutro</li>
                                <li>Rosto visível e centralizado</li>
                                <li>Iluminação adequada</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
