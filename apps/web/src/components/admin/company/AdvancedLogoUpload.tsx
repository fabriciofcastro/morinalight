"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, X, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon, ZoomIn, ZoomOut, RotateCw, Crop } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@morina/ui";
import { processImage, validateImage, getImageDimensions, type ProcessedImage, formatFileSize } from "@/lib/utils/image-processing";
import { ConfirmDialog } from "@/shared/ui/base/confirm-dialog";

interface AdvancedLogoUploadProps {
  value?: string | null;
  onChange?: (value: string | null, variants?: {
    thumbnail: string;
    medium: string;
    large: string;
  }) => void;
  label?: string;
  description?: string;
  required?: boolean;
  maxSize?: number; // bytes
  acceptedFormats?: string[];
  aspectRatio?: { min: number; max: number };
  className?: string;
}

export function AdvancedLogoUpload({
  value,
  onChange,
  label = "Logo da Empresa",
  description = "Upload de logo com processamento avançado e múltiplas variantes",
  required = false,
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedFormats = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"],
  aspectRatio = { min: 0.8, max: 1.2 }, // Proporção próxima de 1:1
  className,
}: AdvancedLogoUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [variants, setVariants] = useState<{
    thumbnail: string;
    medium: string;
    large: string;
  } | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Confirm dialog state
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);

  const handleFileSelect = useCallback(
    async (file: File) => {
      setError(null);
      setProcessing(true);
      setUploadProgress(0);

      try {
        // Validar arquivo
        const validation = await validateImage(file, {
          maxSize,
          allowedFormats: acceptedFormats,
          aspectRatio,
          minWidth: 100,
          maxWidth: 4096,
          minHeight: 100,
          maxHeight: 4096,
        });

        if (!validation.valid) {
          setError(validation.errors.join(", "));
          setProcessing(false);
          return;
        }

        // Obter dimensões
        const dims = await getImageDimensions(file);
        setDimensions(dims);

        // Processar imagem com múltiplas variantes
        setUploadProgress(25);
        const processed = await processImage(file, {
          maxWidth: 2048,
          maxHeight: 2048,
          quality: 0.95,
          format: "webp",
          maintainAspectRatio: true,
        });

        setUploadProgress(50);

        // Criar variantes
        const imageVariants = await Promise.all([
          processImage(file, { maxWidth: 150, maxHeight: 150, quality: 0.8, format: "webp" }),
          processImage(file, { maxWidth: 512, maxHeight: 512, quality: 0.9, format: "webp" }),
          processImage(file, { maxWidth: 1024, maxHeight: 1024, quality: 0.95, format: "webp" }),
        ]);

        setUploadProgress(100);

        const variantsData = {
          thumbnail: imageVariants[0].dataUrl,
          medium: imageVariants[1].dataUrl,
          large: imageVariants[2].dataUrl,
        };

        setVariants(variantsData);
        setPreview(processed.dataUrl);
        onChange?.(processed.dataUrl, variantsData);

        // Simular delay para feedback visual
        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao processar imagem");
      } finally {
        setProcessing(false);
        setUploadProgress(0);
      }
    },
    [maxSize, acceptedFormats, aspectRatio, onChange],
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect],
  );

  const handleRemove = () => {
    setConfirmRemoveOpen(true);
  };

  const confirmRemove = useCallback(() => {
    setPreview(null);
    setVariants(null);
    setDimensions(null);
    setError(null);
    onChange?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setConfirmRemoveOpen(false);
  }, [onChange]);

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <label className="block text-sm font-semibold text-white mb-1">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
        {description && (
          <p className="text-xs text-zinc-400 leading-relaxed">{description}</p>
        )}
      </div>

      <div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative group rounded-xl border-2 border-dashed transition-all duration-300",
          isDragging
            ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 scale-[1.02]"
            : "border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/10",
          processing && "pointer-events-none opacity-70",
        )}
      >
        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative p-6"
            >
              {/* Preview da imagem */}
              <div className="flex items-center justify-center mb-4">
                <div className="relative group/preview">
                  <div className="relative w-48 h-48 rounded-xl border border-white/10 bg-white/5 p-4 overflow-hidden">
                    <img
                      src={preview}
                      alt="Logo preview"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/preview:opacity-100 transition-opacity" />
                  </div>

                  {/* Overlay com ações */}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover/preview:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 rounded-lg bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                      title="Alterar logo"
                    >
                      <ImageIcon className="h-4 w-4 text-white" />
                    </button>
                    <button
                      type="button"
                      onClick={handleRemove}
                      className="p-2 rounded-lg bg-red-500/20 backdrop-blur-sm hover:bg-red-500/30 transition-colors"
                      title="Remover logo"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Informações da imagem */}
              {dimensions && (
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="flex items-center gap-2 text-white/60">
                    <span>Dimensões:</span>
                    <span className="font-medium text-white">
                      {dimensions.width} × {dimensions.height}px
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <span>Proporção:</span>
                    <span className="font-medium text-white">
                      {(dimensions.width / dimensions.height).toFixed(2)}:1
                    </span>
                  </div>
                </div>
              )}

              {/* Variantes geradas */}
              {variants && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-white/60 mb-2">Variantes geradas:</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <div className="w-full aspect-square rounded border border-white/10 bg-white/5 p-1 mb-1 overflow-hidden">
                        <img
                          src={variants.thumbnail}
                          alt="Thumbnail"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <p className="text-[10px] text-white/40">Thumbnail</p>
                    </div>
                    <div className="text-center">
                      <div className="w-full aspect-square rounded border border-white/10 bg-white/5 p-1 mb-1 overflow-hidden">
                        <img
                          src={variants.medium}
                          alt="Medium"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <p className="text-[10px] text-white/40">Médio</p>
                    </div>
                    <div className="text-center">
                      <div className="w-full aspect-square rounded border border-white/10 bg-white/5 p-1 mb-1 overflow-hidden">
                        <img
                          src={variants.large}
                          alt="Large"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <p className="text-[10px] text-white/40">Grande</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 text-center"
            >
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-[hsl(var(--primary))]/20 rounded-full blur-xl" />
                  <div className="relative w-16 h-16 rounded-full bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/30 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-[hsl(var(--primary))]" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-white mb-1">
                    Arraste e solte ou clique para fazer upload
                  </p>
                  <p className="text-xs text-white/60">
                    PNG, JPG, SVG ou WEBP • Máximo {formatFileSize(maxSize)}
                  </p>
                  {aspectRatio && (
                    <p className="text-xs text-white/40 mt-1">
                      Proporção recomendada: {aspectRatio.min}:1 a {aspectRatio.max}:1
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 text-sm font-medium text-white bg-[hsl(var(--primary))] rounded-lg hover:bg-[hsl(var(--primary))]/90 transition-colors"
                >
                  Selecionar arquivo
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Barra de progresso */}
        {processing && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 overflow-hidden rounded-b-xl">
            <motion.div
              className="h-full bg-gradient-to-r from-[hsl(var(--primary))] to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        {/* Input de arquivo oculto */}
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(",")}
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      {/* Mensagens de erro */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
          >
            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
            <p className="text-xs text-red-400">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status de processamento */}
      {processing && (
        <div className="flex items-center gap-2 text-xs text-white/60">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Processando imagem e gerando variantes...</span>
        </div>
      )}

      <ConfirmDialog
        open={confirmRemoveOpen}
        onOpenChange={setConfirmRemoveOpen}
        onConfirm={confirmRemove}
        title="Remover Logo"
        description="Tem certeza que deseja remover o logo da empresa?"
        confirmLabel="Remover"
        variant="warning"
      />
    </div>
  );
}

