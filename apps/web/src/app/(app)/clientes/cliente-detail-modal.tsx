"use client";

import { Button, GlassCard, FormField, Input, FormTextarea } from "@morina/ui";
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
  Plus,
  Save,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { getAuthHeadersWithTenant } from "@/lib/auth-client";
import { notificationCenter } from "@/components/notifications/notification-center";
import { ContactsManager } from "@/components/clientes/contacts-manager";

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
  performedByEmail?: string | null;
};

type TabType = "info" | "contatos" | "representantes" | "historico";

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
  const [showRepForm, setShowRepForm] = useState(false);
  const [savingRep, setSavingRep] = useState(false);
  const [repFormData, setRepFormData] = useState({
    nome: "",
    documento: "",
    email: "",
    telefone: "",
    celular: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    percentualComissao: "0",
    observacoes: "",
  });

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

  const handleCreateRepresentante = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRep(true);

    try {
      const percentual = parseFloat(repFormData.percentualComissao);
      if (isNaN(percentual) || percentual < 0 || percentual > 100) {
        notificationCenter.add({
          type: "error",
          title: "Erro",
          message: "Percentual de comissão deve estar entre 0 e 100",
        });
        return;
      }

      const response = await fetch("/api/representantes", {
        method: "POST",
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clienteId: cliente.clienteId,
          nome: repFormData.nome,
          documento: repFormData.documento.replace(/\D/g, ""),
          email: repFormData.email || null,
          telefone: repFormData.telefone.replace(/\D/g, "") || null,
          celular: repFormData.celular.replace(/\D/g, "") || null,
          endereco: repFormData.endereco || null,
          cidade: repFormData.cidade || null,
          estado: repFormData.estado || null,
          cep: repFormData.cep.replace(/\D/g, "") || null,
          percentualComissao: percentual,
          observacoes: repFormData.observacoes || null,
        }),
      });

      if (response.ok) {
        notificationCenter.add({
          type: "success",
          title: "Sucesso",
          message: "Representante vinculado com sucesso",
        });
        setShowRepForm(false);
        setRepFormData({
          nome: "",
          documento: "",
          email: "",
          telefone: "",
          celular: "",
          endereco: "",
          cidade: "",
          estado: "",
          cep: "",
          percentualComissao: "0",
          observacoes: "",
        });
        await loadRepresentantes();
      } else {
        const error = await response.json();
        notificationCenter.add({
          type: "error",
          title: "Erro",
          message: error.message || "Erro ao vincular representante",
        });
      }
    } catch (error) {
      console.error("Erro ao criar representante:", error);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Erro ao vincular representante. Tente novamente.",
      });
    } finally {
      setSavingRep(false);
    }
  };

  const loadHistorico = async () => {
    setLoadingHist(true);
    try {
      const response = await fetch(`/api/clientes/${cliente.clienteId}/audit?limite=50`, {
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHistorico(data.itens || []);
      } else {
        setHistorico([]);
      }
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
      setHistorico([]);
    } finally {
      setLoadingHist(false);
    }
  };

  const tabs = [
    { id: "info" as TabType, label: "Informações", icon: FileText },
    { id: "contatos" as TabType, label: "Contatos", icon: Phone },
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

              {activeTab === "contatos" && (
                <motion.div
                  key="contatos"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <ContactsManager clienteId={cliente.clienteId} />
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
                  ) : (
                    <div className="space-y-4">
                      {!showRepForm && (
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            onClick={() => setShowRepForm(true)}
                            className="gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Vincular Representante
                          </Button>
                        </div>
                      )}

                      {showRepForm && (
                        <GlassCard className="p-6">
                          <h3 className="text-lg font-semibold mb-4">Novo Representante</h3>
                          <form onSubmit={handleCreateRepresentante} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField label="Nome" required fieldId="rep-nome">
                                <Input
                                  id="rep-nome"
                                  value={repFormData.nome}
                                  onChange={(e) => setRepFormData({ ...repFormData, nome: e.target.value })}
                                  required
                                />
                              </FormField>
                              <FormField label="CPF" required fieldId="rep-documento">
                                <Input
                                  id="rep-documento"
                                  value={formatCPF(repFormData.documento)}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, "");
                                    setRepFormData({ ...repFormData, documento: value });
                                  }}
                                  maxLength={14}
                                  required
                                />
                              </FormField>
                              <FormField label="Email" fieldId="rep-email">
                                <Input
                                  id="rep-email"
                                  type="email"
                                  value={repFormData.email}
                                  onChange={(e) => setRepFormData({ ...repFormData, email: e.target.value })}
                                />
                              </FormField>
                              <FormField label="Telefone" fieldId="rep-telefone">
                                <Input
                                  id="rep-telefone"
                                  value={formatPhone(repFormData.telefone)}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, "");
                                    setRepFormData({ ...repFormData, telefone: value });
                                  }}
                                  maxLength={14}
                                />
                              </FormField>
                              <FormField label="Celular" fieldId="rep-celular">
                                <Input
                                  id="rep-celular"
                                  value={formatPhone(repFormData.celular)}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, "");
                                    setRepFormData({ ...repFormData, celular: value });
                                  }}
                                  maxLength={15}
                                />
                              </FormField>
                              <FormField label="Percentual de Comissão (%)" required fieldId="rep-comissao">
                                <Input
                                  id="rep-comissao"
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  value={repFormData.percentualComissao}
                                  onChange={(e) => setRepFormData({ ...repFormData, percentualComissao: e.target.value })}
                                  required
                                />
                              </FormField>
                              <FormField label="CEP" fieldId="rep-cep">
                                <Input
                                  id="rep-cep"
                                  value={formatCEP(repFormData.cep)}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, "");
                                    setRepFormData({ ...repFormData, cep: value });
                                  }}
                                  maxLength={9}
                                />
                              </FormField>
                              <FormField label="Estado (UF)" fieldId="rep-estado">
                                <Input
                                  id="rep-estado"
                                  value={repFormData.estado}
                                  onChange={(e) =>
                                    setRepFormData({ ...repFormData, estado: e.target.value.toUpperCase().slice(0, 2) })
                                  }
                                  maxLength={2}
                                />
                              </FormField>
                              <FormField label="Cidade" fieldId="rep-cidade" className="md:col-span-2">
                                <Input
                                  id="rep-cidade"
                                  value={repFormData.cidade}
                                  onChange={(e) => setRepFormData({ ...repFormData, cidade: e.target.value })}
                                />
                              </FormField>
                              <FormField label="Endereço" fieldId="rep-endereco" className="md:col-span-2">
                                <Input
                                  id="rep-endereco"
                                  value={repFormData.endereco}
                                  onChange={(e) => setRepFormData({ ...repFormData, endereco: e.target.value })}
                                />
                              </FormField>
                              <FormTextarea
                                label="Observações"
                                id="rep-observacoes"
                                value={repFormData.observacoes}
                                onChange={(e) => setRepFormData({ ...repFormData, observacoes: e.target.value })}
                                className="md:col-span-2"
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                  setShowRepForm(false);
                                  setRepFormData({
                                    nome: "",
                                    documento: "",
                                    email: "",
                                    telefone: "",
                                    celular: "",
                                    endereco: "",
                                    cidade: "",
                                    estado: "",
                                    cep: "",
                                    percentualComissao: "0",
                                    observacoes: "",
                                  });
                                }}
                              >
                                Cancelar
                              </Button>
                              <Button type="submit" disabled={savingRep}>
                                <Save className="h-4 w-4 mr-2" />
                                {savingRep ? "Salvando..." : "Salvar"}
                              </Button>
                            </div>
                          </form>
                        </GlassCard>
                      )}

                      {representantes.length === 0 && !showRepForm ? (
                        <div className="text-center py-12">
                          <UserPlus className="h-12 w-12 mx-auto text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)] mb-4" />
                          <p className="text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                            Nenhum representante vinculado
                          </p>
                        </div>
                      ) : (
                        representantes.map((rep) => (
                          <GlassCard key={rep.id} className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold">{rep.nome}</h4>
                                <p className="text-sm text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                                  {formatCPF(rep.documento)}
                                </p>
                                {rep.email && (
                                  <p className="text-sm flex items-center gap-1.5 mt-1">
                                    <Mail className="h-3.5 w-3.5" />
                                    {rep.email}
                                  </p>
                                )}
                                {rep.telefone && (
                                  <p className="text-sm flex items-center gap-1.5 mt-1">
                                    <Phone className="h-3.5 w-3.5" />
                                    {formatPhone(rep.telefone)}
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
                        ))
                      )}
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
                                <span className="font-semibold capitalize">
                                  {item.acao === "created" ? "Criado" :
                                   item.acao === "updated" ? "Atualizado" :
                                   item.acao === "deleted" ? "Excluído" :
                                   item.acao}
                                </span>
                                <span className="text-xs text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                                  {new Date(item.createdAt).toLocaleString("pt-BR")}
                                </span>
                              </div>
                              <p className="text-sm text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)] mb-2">
                                Por: {item.performedByEmail || item.actorId}
                              </p>
                              {item.campo && (
                                <div className="mt-2 p-2 rounded bg-[color-mix(in oklab,var(--muted-soft) 5%,transparent)]">
                                  <p className="text-xs font-medium mb-1">Campo: {item.campo}</p>
                                  {item.estadoAnterior && (
                                    <p className="text-xs text-red-500 line-through mb-1">
                                      Antes: {String(item.estadoAnterior)}
                                    </p>
                                  )}
                                  {item.estadoNovo && (
                                    <p className="text-xs text-green-500">
                                      Depois: {String(item.estadoNovo)}
                                    </p>
                                  )}
                                </div>
                              )}
                              {item.justificativa && (
                                <p className="text-sm mt-2 italic text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                                  Justificativa: {item.justificativa}
                                </p>
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


