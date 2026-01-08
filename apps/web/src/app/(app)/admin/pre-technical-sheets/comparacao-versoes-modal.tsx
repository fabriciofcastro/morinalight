"use client";

import type { ComparacaoVersoes } from "@/lib/api/pre-fichas-tecnicas";
import { Button, GlassCard } from "@morina/ui";
import { X } from "lucide-react";

export function ComparacaoVersoesModal({
  comparacao,
  onClose,
}: {
  comparacao: ComparacaoVersoes;
  onClose: () => void;
}) {
  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "boolean") return value ? "Sim" : "Não";
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    return String(value);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[70] p-4">
      <GlassCard className="p-6 max-w-6xl max-h-[90vh] overflow-y-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            Comparação de Versões: {comparacao.versao1} vs {comparacao.versao2}
          </h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {comparacao.diff.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>Nenhuma diferença encontrada entre as versões</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comparacao.diff.map((item, index) => (
              <GlassCard key={index} className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          item.tipo === "alterado"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : item.tipo === "adicionado"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {item.tipo === "alterado"
                          ? "ALTERADO"
                          : item.tipo === "adicionado"
                            ? "ADICIONADO"
                            : "REMOVIDO"}
                      </span>
                      <span className="font-semibold text-white">{item.campo}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Versão {comparacao.versao1}</p>
                        <div className="p-2 bg-red-500/10 border border-red-500/20 rounded text-sm text-white">
                          {formatValue(item.valorAnterior)}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Versão {comparacao.versao2}</p>
                        <div className="p-2 bg-green-500/10 border border-green-500/20 rounded text-sm text-white">
                          {formatValue(item.valorNovo)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}












