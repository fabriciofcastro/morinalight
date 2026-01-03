"use client";

import { Button } from "@morina/ui";
import { Copy, X } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import type { FichaCusto } from "@/lib/api/fichas-custo";

type DuplicarFichaModalProps = {
  ficha: FichaCusto;
  onClose: () => void;
  onDuplicate: (options: {
    manterFornecedores: boolean;
    resetarValores: boolean;
    copiarEstrutura: boolean;
  }) => void;
};

export function DuplicarFichaModal({ ficha, onClose, onDuplicate }: DuplicarFichaModalProps) {
  const [manterFornecedores, setManterFornecedores] = useState(true);
  const [resetarValores, setResetarValores] = useState(true);
  const [copiarEstrutura, setCopiarEstrutura] = useState(true);

  const handleDuplicate = () => {
    onDuplicate({
      manterFornecedores,
      resetarValores,
      copiarEstrutura,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent backdrop-blur-xl shadow-2xl max-w-md w-full"
      >
        {/* Tech corner accents */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[hsl(var(--primary)/0.6)]" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[hsl(var(--primary)/0.6)]" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
                <Copy className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white/90">Duplicar Ficha</h2>
                <p className="text-sm text-white/60">#{ficha.numeroSequencial} - {ficha.nomePeca}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <p className="text-sm text-white/70">
              Escolha as opções para duplicar a ficha:
            </p>

            <label className="flex items-start gap-3 p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={copiarEstrutura}
                onChange={(e) => setCopiarEstrutura(e.target.checked)}
                className="mt-1 h-4 w-4 cursor-pointer rounded border-white/20 bg-white/5 checked:bg-blue-500 checked:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
              />
              <div className="flex-1">
                <div className="font-medium text-white/90">Copiar estrutura</div>
                <div className="text-xs text-white/60">Mantém os campos principais (coleção, descrição, etc.)</div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={manterFornecedores}
                onChange={(e) => setManterFornecedores(e.target.checked)}
                className="mt-1 h-4 w-4 cursor-pointer rounded border-white/20 bg-white/5 checked:bg-blue-500 checked:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
              />
              <div className="flex-1">
                <div className="font-medium text-white/90">Manter fornecedores</div>
                <div className="text-xs text-white/60">Mantém a lista de fornecedores dos insumos</div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={resetarValores}
                onChange={(e) => setResetarValores(e.target.checked)}
                className="mt-1 h-4 w-4 cursor-pointer rounded border-white/20 bg-white/5 checked:bg-blue-500 checked:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
              />
              <div className="flex-1">
                <div className="font-medium text-white/90">Resetar valores</div>
                <div className="text-xs text-white/60">Remove valores unitários e quantidades dos insumos</div>
              </div>
            </label>
          </div>

          <div className="flex gap-3">
            <Button
              className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[40px]"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white border-0 shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)] cursor-pointer h-[40px]"
              onClick={handleDuplicate}
            >
              <Copy className="h-4 w-4 mr-2" />
              Duplicar
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}





