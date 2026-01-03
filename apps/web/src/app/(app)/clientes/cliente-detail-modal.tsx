"use client";

import { Button, GlassCard } from "@morina/ui";
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  X,
  Edit,
  CheckCircle2,
  XCircle,
  AlertCircle,
  History,
  UserPlus,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { getAuthHeadersWithTenant } from "@/lib/auth-client";
import { notificationCenter } from "@/components/notifications/notification-center";

type Cliente = {
  clienteId: string;
  orgId: string;
  nome: string;
  razaoSocial: string | null;
  tipo: "fisica" | "juridica";
  documento: string;
  email: string | null;
  telefone: string | null;
  celular: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  status: "ativo" | "inativo" | "bloqueado";
  observacoes: string | null;
  createdAt: string;
  updatedAt: string;
};

type Representante = {
  id: string;
  nome: string;
  documento: string;
  email: string | null;
  telefone: string | null;
  percentualComissao: number;
  status: string;
};

type HistoricoItem = {
  id: string;
  acao: string;
  campo: string | null;
  estadoAnterior: any;
  estadoNovo: any;
  actorId: string;
  createdAt: string;
  justificativa: string | null;
};

type TabType = "info" | "representantes" | "historico";

interface ClienteDetailModalProps {
  cliente: Cliente;
  onClose: () => void;
  onEdit: (cliente: Cliente) => void;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const formatCPF = (value: string) => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length <= 11) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  return value;
};

const formatCNPJ = (value: string) => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length <= 14) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }
  return value;
};

const formatPhone = (value: string) => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length <= 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
};

const formatCEP = (value: string) => {
  const cleaned = value.replace(/\D/g, "");
  return cleaned.replace(/(\d{5})(\d{3})/, "$1-$2");
};

export function ClienteDetailModal({
  cliente,
  onClose,
  onEdit,
  activeTab,
  onTabChange,
}: ClienteDetailModalProps) {
  const [representantes, setRepresentantes] = useState<Representante[]>([]);
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [loadingRep, setLoadingRep] = useState(false);
  const [loadingHist, setLoadingHist] = useState(false);

  useEffect(() => {
    if (activeTab === "representantes") {
      loadRepresentantes();
    } else if (activeTab === "historico") {
      loadHistorico();
    }
  }, [activeTab, cliente.clienteId]);

  const loadRepresentantes = async () => {
    setLoadingRep(true);
    try {
      const response = await fetch(`/api/representantes?clienteId=${cliente.clienteId}`, {
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRepresentantes(data.itens || []);
      }
    } catch (error) {
      console.error("Erro ao carregar representantes:", error);
    } finally {
      setLoadingRep(false);
    }
  };

  const loadHistorico = async () => {
    setLoadingHist(true);
    try {
      // TODO: Implementar API de histórico de clientes
      // Por enquanto, retornar array vazio
      setHistorico([]);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    } finally {
      setLoadingHist(false);
    }
  };

  const tabs = [
    { id: "info" as TabType, label: "Informações", icon: FileText },
    { id: "representantes" as TabType, label: "Representantes", icon: UserPlus },
    { id: "historico" as TabType, label: "Histórico", icon: History },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        <GlassCard className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-start justify-between mb-6 pb-4 border-b border-[color-mix(in oklab,var(--muted-soft) 20%,transparent)]">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-[color-mix(in oklab,var(--primary)_10%,transparent)]">
                {cliente.tipo === "juridica" ? (
                  <Building2 className="h-6 w-6 text-[var(--primary)]" />
                ) : (
                  <User className="h-6 w-6 text-[var(--primary)]" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{cliente.nome}</h2>
                {cliente.razaoSocial && (
                  <p className="text-sm text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                    {cliente.razaoSocial}
                  </p>
                )}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="gap-2">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-[color-mix(in oklab,var(--muted-soft) 20%,transparent)]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-[var(--primary)] text-[var(--primary)]"
                      : "border-transparent text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)] hover:text-[var(--fg)]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {activeTab === "info" && (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                      Informações Básicas
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)] mb-1">
                          {cliente.tipo === "fisica" ? "CPF" : "CNPJ"}
                        </p>
                        <p className="font-medium">
                          {cliente.tipo === "fisica"
                            ? formatCPF(cliente.documento)
                            : formatCNPJ(cliente.documento)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)] mb-1">
                          Tipo
                        </p>
                        <p className="font-medium capitalize">
                          {cliente.tipo === "fisica" ? "Pessoa Física" : "Pessoa Jurídica"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)] mb-1">
                          Status
                        </p>
                        <div className="flex items-center gap-2">
                          {cliente.status === "ativo" ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : cliente.status === "inativo" ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                          )}
                          <span className="font-medium capitalize">{cliente.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                      Contato
                    </h3>
                    <div className="space-y-3">
                      {cliente.email && (
                        <div>
                          <p className="text-xs text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)] mb-1 flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5" />
                            Email
                          </p>
                          <p className="font-medium">{cliente.email}</p>
                        </div>
                      )}
                      {cliente.telefone && (
                        <div>
                          <p className="text-xs text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)] mb-1 flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5" />
                            Telefone
                          </p>
                          <p className="font-medium">{formatPhone(cliente.telefone)}</p>
                        </div>
                      )}
                      {cliente.celular && (
                        <div>
                          <p className="text-xs text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)] mb-1 flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5" />
                            Celular
                          </p>
                          <p className="font-medium">{formatPhone(cliente.celular)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {cliente.endereco && (
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-semibold mb-3 text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)] flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        Endereço
                      </h3>
                      <div className="space-y-2">
                        <p className="font-medium">{cliente.endereco}</p>
                        <p className="text-sm text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                          {cliente.cidade}, {cliente.estado}
                          {cliente.cep && ` - ${formatCEP(cliente.cep)}`}
                        </p>
                      </div>
                    </div>
                  )}

                  {cliente.observacoes && (
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-semibold mb-3 text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                        Observações
                      </h3>
                      <p className="text-sm whitespace-pre-wrap">{cliente.observacoes}</p>
                    </div>
                  )}

                  <div className="md:col-span-2 flex items-center justify-between pt-4 border-t border-[color-mix(in oklab,var(--muted-soft) 20%,transparent)]">
                    <div className="text-xs text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                      <p>Criado em: {new Date(cliente.createdAt).toLocaleDateString("pt-BR")}</p>
                      <p>Atualizado em: {new Date(cliente.updatedAt).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <Button variant="outline" onClick={() => onEdit(cliente)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                </motion.div>
              )}

              {activeTab === "representantes" && (
                <motion.div
                  key="representantes"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {loadingRep ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-[var(--primary)] border-t-transparent mx-auto mb-4" />
                      <p className="text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                        Carregando representantes...
                      </p>
                    </div>
                  ) : representantes.length === 0 ? (
                    <div className="text-center py-12">
                      <UserPlus className="h-12 w-12 mx-auto text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)] mb-4" />
                      <p className="text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)] mb-4">
                        Nenhum representante vinculado
                      </p>
                      <Button variant="outline">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Vincular Representante
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {representantes.map((rep) => (
                        <GlassCard key={rep.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold">{rep.nome}</h4>
                              <p className="text-sm text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                                {rep.documento}
                              </p>
                              {rep.email && (
                                <p className="text-sm flex items-center gap-1.5 mt-1">
                                  <Mail className="h-3.5 w-3.5" />
                                  {rep.email}
                                </p>
                              )}
                              <p className="text-sm mt-2">
                                Comissão: <span className="font-medium">{rep.percentualComissao}%</span>
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {rep.status === "ativo" ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          </div>
                        </GlassCard>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "historico" && (
                <motion.div
                  key="historico"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {loadingHist ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-[var(--primary)] border-t-transparent mx-auto mb-4" />
                      <p className="text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                        Carregando histórico...
                      </p>
                    </div>
                  ) : historico.length === 0 ? (
                    <div className="text-center py-12">
                      <History className="h-12 w-12 mx-auto text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)] mb-4" />
                      <p className="text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                        Nenhum histórico encontrado
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {historico.map((item) => (
                        <GlassCard key={item.id} className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="p-2 rounded-lg bg-[color-mix(in oklab,var(--primary)_10%,transparent)]">
                              <History className="h-4 w-4 text-[var(--primary)]" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold capitalize">{item.acao}</span>
                                <span className="text-xs text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                                  {new Date(item.createdAt).toLocaleString("pt-BR")}
                                </span>
                              </div>
                              <p className="text-sm text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                                Por: {item.actorId}
                              </p>
                              {item.justificativa && (
                                <p className="text-sm mt-2 italic">{item.justificativa}</p>
                              )}
                            </div>
                          </div>
                        </GlassCard>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}


