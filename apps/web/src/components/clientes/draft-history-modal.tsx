"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, GlassCard } from "@morina/ui";
import {
  History,
  Clock,
  Trash2,
  RotateCcw,
  X,
  CheckCircle2,
  AlertCircle,
  GitCompare,
} from "lucide-react";
import { notificationCenter } from "@/components/notifications/notification-center";
import type { DraftVersion } from "@/hooks/use-draft-history";

interface DraftHistoryModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  versions: DraftVersion<T>[];
  currentVersionId: string | null;
  currentData: T;
  onRestore: (versionId: string) => void;
  onDelete: (versionId: string) => void;
  onClear: () => void;
  formatLabel?: (version: DraftVersion<T>) => string;
  getFieldLabel?: (key: string) => string;
  formatValue?: (key: string, value: unknown) => string;
}

export function DraftHistoryModal<T extends Record<string, unknown>>({
  isOpen,
  onClose,
  versions,
  currentVersionId,
  currentData,
  onRestore,
  onDelete,
  onClear,
  formatLabel,
  getFieldLabel,
  formatValue,
}: DraftHistoryModalProps<T>) {
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [compareVersionId, setCompareVersionId] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonVersions, setComparisonVersions] = useState<{
    before: DraftVersion<T> | null;
    after: DraftVersion<T> | null;
  }>({ before: null, after: null });

  if (!isOpen) return null;

  const formatVersionLabel = (version: DraftVersion<T>): string => {
    if (formatLabel) return formatLabel(version);
    if (version.label) return version.label;
    return `Rascunho de ${version.savedAt.toLocaleString("pt-BR")}`;
  };

  const handleRestore = (versionId: string) => {
    if (
      confirm(
        "Tem certeza que deseja restaurar esta versão? Os dados atuais serão substituídos."
      )
    ) {
      onRestore(versionId);
      notificationCenter.add({
        type: "success",
        title: "Versão restaurada",
        message: "Os dados foram restaurados com sucesso",
      });
      onClose();
    }
  };

  const handleDelete = (versionId: string) => {
    if (confirm("Tem certeza que deseja excluir esta versão?")) {
      onDelete(versionId);
      notificationCenter.add({
        type: "success",
        title: "Versão excluída",
        message: "A versão foi excluída com sucesso",
      });
    }
  };

  const handleClear = () => {
    if (
      confirm(
        "Tem certeza que deseja limpar todo o histórico? Esta ação não pode ser desfeita."
      )
    ) {
      onClear();
      notificationCenter.add({
        type: "success",
        title: "Histórico limpo",
        message: "Todo o histórico foi excluído",
      });
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <GlassCard className="w-full max-w-2xl max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-[color-mix(in oklab,var(--muted-soft)_20%,transparent)]">
                <div className="flex items-center gap-3">
                  <History className="h-5 w-5 text-[var(--primary)]" />
                  <h2 className="text-lg font-semibold">Histórico de Rascunhos</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {versions.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="h-16 w-16 text-[color-mix(in oklab,var(--muted-soft)_70%,var(--fg)_30%)] mx-auto mb-4" />
                    <p className="text-[color-mix(in oklab,var(--muted-soft)_70%,var(--fg)_30%)]">
                      Nenhum rascunho salvo ainda
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {versions.map((version) => {
                      const isCurrent = version.id === currentVersionId;
                      const isSelected = version.id === selectedVersion;

                      return (
                        <motion.div
                          key={version.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-4 rounded-lg border transition-all cursor-pointer ${
                            isCurrent
                              ? "border-[var(--primary)] bg-[color-mix(in oklab,var(--primary)_10%,transparent)]"
                              : isSelected
                                ? "border-[color-mix(in oklab,var(--primary)_30%,transparent)] bg-[color-mix(in oklab,var(--muted-soft)_5%,transparent)]"
                                : "border-[color-mix(in oklab,var(--muted-soft)_20%,transparent)] hover:border-[color-mix(in oklab,var(--primary)_20%,transparent)]"
                          }`}
                          onClick={() => setSelectedVersion(version.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="h-4 w-4 text-[color-mix(in oklab,var(--muted-soft)_70%,var(--fg)_30%)]" />
                                <span className="font-medium text-sm">
                                  {formatVersionLabel(version)}
                                </span>
                                {isCurrent && (
                                  <span className="px-2 py-0.5 rounded-full bg-[var(--primary)] text-white text-xs">
                                    Atual
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[color-mix(in oklab,var(--muted-soft)_70%,var(--fg)_30%)]">
                                {version.savedAt.toLocaleString("pt-BR", {
                                  dateStyle: "full",
                                  timeStyle: "short",
                                })}
                              </p>
                              {isSelected && (
                                <div className="mt-3 pt-3 border-t border-[color-mix(in oklab,var(--muted-soft)_20%,transparent)]">
                                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                    <div>
                                      <span className="text-[color-mix(in oklab,var(--muted-soft)_70%,var(--fg)_30%)]">
                                        Campos preenchidos:
                                      </span>
                                      <span className="ml-1 font-medium">
                                        {Object.values(version.data).filter(
                                          (v) => v && v !== ""
                                        ).length}
                                      </span>
                                    </div>
                                  </div>
                                  {currentVersionId && currentVersionId !== version.id && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const currentVersion = versions.find(
                                          (v) => v.id === currentVersionId
                                        );
                                        if (currentVersion) {
                                          setComparisonVersions({
                                            before: version,
                                            after: currentVersion,
                                          });
                                          setShowComparison(true);
                                        }
                                      }}
                                      className="w-full gap-2"
                                    >
                                      Comparar com versão atual
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              {!isCurrent && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCompareVersionId(version.id);
                                    }}
                                    className="gap-1.5"
                                  >
                                    <GitCompare className="h-3.5 w-3.5" />
                                    Comparar
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRestore(version.id);
                                    }}
                                    className="gap-1.5"
                                  >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    Restaurar
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(version.id);
                                }}
                                className="gap-1.5 text-red-500 hover:text-red-600"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {versions.length > 0 && (
                <div className="p-6 border-t border-[color-mix(in oklab,var(--muted-soft)_20%,transparent)] flex items-center justify-between">
                  <p className="text-sm text-[color-mix(in oklab,var(--muted-soft)_70%,var(--fg)_30%)]">
                    {versions.length} versão(ões) salva(s)
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClear}
                    className="gap-2 text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                    Limpar Histórico
                  </Button>
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* Modal de comparação */}
          {showComparison && comparisonVersions.before && comparisonVersions.after && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
              onClick={() => setShowComparison(false)}
            />
          )}
          {showComparison && comparisonVersions.before && comparisonVersions.after && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <GlassCard className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-[color-mix(in oklab,var(--muted-soft)_20%,transparent)]">
                  <h3 className="text-lg font-semibold">Comparação de Versões</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowComparison(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-6">
                  <ComparisonView
                    before={comparisonVersions.before.data}
                    after={comparisonVersions.after.data}
                    fieldLabels={{
                      nome: "Nome",
                      razaoSocial: "Razão Social",
                      nomeFantasia: "Nome Fantasia",
                      tipo: "Tipo",
                      documento: "Documento",
                      email: "Email",
                      telefone: "Telefone",
                      celular: "Celular",
                      website: "Website",
                      endereco: "Endereço",
                      numero: "Número",
                      complemento: "Complemento",
                      bairro: "Bairro",
                      cidade: "Cidade",
                      estado: "Estado",
                      cep: "CEP",
                      observacoes: "Observações",
                    }}
                  />
                </div>
              </GlassCard>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}

