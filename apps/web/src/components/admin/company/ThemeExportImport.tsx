"use client";

import { useState, useCallback, useRef } from "react";
import { Download, Upload, FileJson, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../lib/utils";
import { notificationCenter } from "@/shared/ui/notification-center";
import { ConfirmDialog } from "@/shared/ui/base/confirm-dialog";

interface ThemeData {
  colors: Record<string, string>;
  gradient?: {
    from: string;
    to: string;
    direction: string;
  };
  fonts?: {
    primary?: string;
    heading?: string;
    body?: string;
  };
  effects?: {
    borderRadius?: string;
    shadowIntensity?: string;
    glassMorphism?: boolean;
    blurIntensity?: number;
  };
  layout?: {
    style?: string;
    sidebarStyle?: string;
    darkMode?: boolean;
  };
  logos?: Record<string, string | null>;
}

interface ThemeExportImportProps {
  theme: ThemeData;
  onThemeImport?: (theme: ThemeData) => void;
  className?: string;
}

export function ThemeExportImport({
  theme,
  onThemeImport,
  className,
}: ThemeExportImportProps) {
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Confirm dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingThemeData, setPendingThemeData] = useState<ThemeData | null>(null);

  const handleExport = useCallback(() => {
    try {
      const exportData = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        theme,
      };

      const json = JSON.stringify(exportData, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `tema-empresa-${new Date().toISOString().split("T")[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      notificationCenter.add({
        type: "success",
        title: "Tema exportado",
        message: "O tema foi exportado com sucesso!",
      });
    } catch (error) {
      notificationCenter.add({
        type: "error",
        title: "Erro ao exportar",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }, [theme]);

  const handleImport = useCallback(
    async (file: File) => {
      if (!file) return;

      if (!file.name.endsWith(".json")) {
        notificationCenter.add({
          type: "error",
          title: "Formato inválido",
          message: "Apenas arquivos JSON são permitidos",
        });
        return;
      }

      setImporting(true);

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        // Validar estrutura
        if (!data.theme) {
          throw new Error("Arquivo inválido: estrutura de tema não encontrada");
        }

        // Set pending data and open confirm dialog
        setPendingThemeData(data.theme);
        setConfirmDialogOpen(true);
        setImporting(false);
      } catch (error) {
        notificationCenter.add({
          type: "error",
          title: "Erro ao importar",
          message: error instanceof Error ? error.message : "Erro ao processar arquivo",
        });
        setImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [onThemeImport],
  );

  const confirmImport = useCallback(() => {
    if (pendingThemeData) {
      onThemeImport?.(pendingThemeData);
      notificationCenter.add({
        type: "success",
        title: "Tema importado",
        message: "O tema foi importado com sucesso!",
      });
    }
    setConfirmDialogOpen(false);
    setPendingThemeData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [pendingThemeData, onThemeImport]);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 mb-4">
        <FileJson className="h-5 w-5 text-[hsl(var(--primary))]" />
        <h4 className="text-sm font-semibold text-white">Exportar/Importar Tema</h4>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleExport}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-sm font-medium text-white"
        >
          <Download className="h-4 w-4" />
          Exportar Tema
        </button>

        <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-sm font-medium text-white cursor-pointer">
          <Upload className="h-4 w-4" />
          {importing ? "Importando..." : "Importar Tema"}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImport(file);
            }}
            disabled={importing}
            className="hidden"
          />
        </label>
      </div>

      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
        <p className="text-xs text-zinc-400 leading-relaxed">
          <strong className="text-white">Exportar:</strong> Salve seu tema personalizado em um arquivo JSON para
          backup ou compartilhamento.
        </p>
        <p className="text-xs text-zinc-400 leading-relaxed mt-2">
          <strong className="text-white">Importar:</strong> Carregue um tema previamente exportado para aplicar
          rapidamente todas as configurações.
        </p>
      </div>

      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={(open) => {
          setConfirmDialogOpen(open);
          if (!open) {
            setPendingThemeData(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }
        }}
        onConfirm={confirmImport}
        title="Importar Tema"
        description="Tem certeza que deseja importar este tema? As configurações atuais serão substituídas."
        confirmLabel="Importar"
        variant="warning"
      />
    </div>
  );
}










