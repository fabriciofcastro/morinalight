"use client";

import { Button, Input } from "@morina/ui";
import { Save, X, Filter, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

type FiltroPreset = {
  id: string;
  nome: string;
  filtros: {
    status?: string;
    colecao?: string;
    busca?: string;
    ordenacao?: string;
  };
};

type FiltrosPresetsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  filtrosAtuais: {
    status?: string;
    colecao?: string;
    busca?: string;
    ordenacao?: string;
  };
  onAplicarPreset: (filtros: FiltroPreset["filtros"]) => void;
};

const STORAGE_KEY = "fichas_custo_filtros_presets";

export function FiltrosPresetsModal({
  isOpen,
  onClose,
  filtrosAtuais,
  onAplicarPreset,
}: FiltrosPresetsModalProps) {
  const [presets, setPresets] = useState<FiltroPreset[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [nomeNovoPreset, setNomeNovoPreset] = useState("");
  const [mostrarFormNovo, setMostrarFormNovo] = useState(false);

  const salvarPreset = () => {
    if (!nomeNovoPreset.trim()) return;

    const novoPreset: FiltroPreset = {
      id: `preset-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      nome: nomeNovoPreset.trim(),
      filtros: { ...filtrosAtuais },
    };

    const novosPresets = [...presets, novoPreset];
    setPresets(novosPresets);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(novosPresets));
    setNomeNovoPreset("");
    setMostrarFormNovo(false);
  };

  const removerPreset = (id: string) => {
    const novosPresets = presets.filter((p) => p.id !== id);
    setPresets(novosPresets);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(novosPresets));
  };

  const aplicarPreset = (preset: FiltroPreset) => {
    onAplicarPreset(preset.filtros);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent backdrop-blur-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto"
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
                <Filter className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white/90">Filtros Salvos</h2>
                <p className="text-sm text-white/60">Gerencie seus filtros favoritos</p>
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

          {/* Lista de presets */}
          {presets.length === 0 && !mostrarFormNovo ? (
            <div className="text-center py-8">
              <Filter className="h-12 w-12 text-white/30 mx-auto mb-3" />
              <p className="text-white/60 mb-4">Nenhum filtro salvo ainda</p>
              <Button
                className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white border-0 shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)] cursor-pointer"
                onClick={() => setMostrarFormNovo(true)}
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar Filtros Atuais
              </Button>
            </div>
          ) : (
            <div className="space-y-3 mb-4">
              {presets.map((preset) => (
                <motion.div
                  key={preset.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white/90 mb-2 truncate">{preset.nome}</h3>
                      <div className="flex flex-wrap gap-2 text-xs text-white/60">
                        {preset.filtros.status && (
                          <span className="px-2 py-1 rounded bg-blue-500/20 border border-blue-500/30 text-blue-400">
                            Status: {preset.filtros.status}
                          </span>
                        )}
                        {preset.filtros.colecao && (
                          <span className="px-2 py-1 rounded bg-purple-500/20 border border-purple-500/30 text-purple-400">
                            Coleção: {preset.filtros.colecao}
                          </span>
                        )}
                        {preset.filtros.busca && (
                          <span className="px-2 py-1 rounded bg-green-500/20 border border-green-500/30 text-green-400">
                            Busca: {preset.filtros.busca}
                          </span>
                        )}
                        {preset.filtros.ordenacao && (
                          <span className="px-2 py-1 rounded bg-orange-500/20 border border-orange-500/30 text-orange-400">
                            Ordenação: {preset.filtros.ordenacao}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 backdrop-blur-sm cursor-pointer h-[32px] px-3"
                        onClick={() => aplicarPreset(preset)}
                      >
                        Aplicar
                      </Button>
                      <Button
                        className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 backdrop-blur-sm cursor-pointer h-[32px] w-[32px] p-0"
                        onClick={() => removerPreset(preset.id)}
                        title="Remover"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Formulário para salvar novo preset */}
          {mostrarFormNovo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-4 p-4 rounded-lg border border-white/10 bg-white/5"
            >
              <h3 className="font-medium text-white/90 mb-3">Salvar filtros atuais</h3>
              <div className="flex gap-2">
                <Input
                  value={nomeNovoPreset}
                  onChange={(e) => setNomeNovoPreset(e.target.value)}
                  placeholder="Nome do filtro (ex: Aprovadas 2024)"
                  className="flex-1 bg-[#1a1f3a] border-white/20 text-white placeholder:text-white/40"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      salvarPreset();
                    } else if (e.key === "Escape") {
                      setMostrarFormNovo(false);
                      setNomeNovoPreset("");
                    }
                  }}
                  autoFocus
                />
                <Button
                  className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 backdrop-blur-sm cursor-pointer h-[40px] px-4"
                  onClick={salvarPreset}
                  disabled={!nomeNovoPreset.trim()}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
                <Button
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[40px] px-4"
                  onClick={() => {
                    setMostrarFormNovo(false);
                    setNomeNovoPreset("");
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </motion.div>
          )}

          {/* Botão para adicionar novo (quando já tem presets) */}
          {presets.length > 0 && !mostrarFormNovo && (
            <Button
              className="w-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white border-0 shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)] cursor-pointer h-[40px]"
              onClick={() => setMostrarFormNovo(true)}
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Filtros Atuais
            </Button>
          )}

          <div className="mt-4 pt-4 border-t border-white/10">
            <Button
              className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm cursor-pointer h-[40px]"
              onClick={onClose}
            >
              Fechar
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}




