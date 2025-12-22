"use client";

import { useCallback, useState } from "react";
import { Upload, FileSpreadsheet, X, CheckCircle2 } from "lucide-react";
import { Button } from "@morina/ui";
import { motion } from "framer-motion";

interface UploadStepProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onValidate: () => void;
  loading: boolean;
}

export function UploadStep({ onFileSelect, selectedFile, onValidate, loading }: UploadStepProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const file = files.find((f) => f.name.endsWith(".csv") || f.name.endsWith(".xlsx") || f.name.endsWith(".xls"));

      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-white">Upload do Arquivo</h2>
        <p className="text-white/70">Selecione um arquivo CSV ou Excel (XLSX/XLS) para importar fornecedores</p>
      </div>

      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-lg border-2 border-dashed p-12 text-center transition-all ${
            isDragging
              ? "border-blue-400 bg-blue-400/10"
              : "border-white/30 bg-white/5 hover:border-white/50"
          }`}
        >
          <motion.div
            animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Upload className="mx-auto mb-4 h-16 w-16 text-white/50" />
            <p className="mb-2 text-lg font-medium text-white">
              Arraste e solte o arquivo aqui
            </p>
            <p className="mb-4 text-sm text-white/70">ou</p>
            <label>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileInput}
                className="hidden"
              />
              <Button variant="outline" asChild>
                <span>Selecionar Arquivo</span>
              </Button>
            </label>
            <p className="mt-4 text-xs text-white/50">
              Formatos suportados: CSV, XLSX, XLS (máx. 10MB)
            </p>
          </motion.div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-white/20 bg-white/5 p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20">
                <FileSpreadsheet className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-white">{selectedFile.name}</p>
                <p className="text-sm text-white/70">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFileSelect(null as any)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {selectedFile && (
        <div className="flex justify-end">
          <Button onClick={onValidate} disabled={loading} size="lg">
            {loading ? "Validando..." : "Validar Arquivo"}
          </Button>
        </div>
      )}
    </div>
  );
}









