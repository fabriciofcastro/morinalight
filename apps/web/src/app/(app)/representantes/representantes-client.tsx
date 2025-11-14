"use client";

import { Button, FormField, FormSelect, FormTextarea, GlassCard, Input } from "@morina/ui";
import {
  Building2,
  CheckCircle2,
  Mail,
  MapPin,
  Percent,
  Phone,
  Plus,
  Search,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { notificationCenter } from "@/components/notifications/notification-center";
import { getAuthHeadersWithTenant } from "@/lib/auth-client";

type Representante = {
  representanteId: string;
  orgId: string;
  clienteId: string;
  nome: string;
  documento: string;
  email: string | null;
  telefone: string | null;
  celular: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  percentualComissao: number;
  status: "ativo" | "inativo" | "suspenso";
  observacoes: string | null;
  createdAt: string;
  updatedAt: string;
};

type Cliente = {
  clienteId: string;
  nome: string;
  tipo: "fisica" | "juridica";
};

type RepresentantesResponse = {
  itens: Representante[];
  proximoCursor?: string | null;
};

type ClientesResponse = {
  itens: Cliente[];
};

export function RepresentantesClient() {
  const [representantes, setRepresentantes] = useState<Representante[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [_editingRepresentante, setEditingRepresentante] = useState<Representante | null>(null);
  const [pending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    clienteId: "",
    nome: "",
    documento: "",
    email: "",
    telefone: "",
    celular: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    percentualComissao: 0,
    observacoes: "",
  });

  useEffect(() => {
    loadClientes();
    loadRepresentantes();
  }, [loadClientes, loadRepresentantes]);

  async function loadClientes() {
    setLoadingClientes(true);
    try {
      const response = await fetch(`/api/clientes`, {
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: ClientesResponse = await response.json();
        setClientes(data.itens || []);
      }
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    } finally {
      setLoadingClientes(false);
    }
  }

  async function loadRepresentantes() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (search.length >= 2) {
        params.append("busca", search);
      }

      const response = await fetch(`/api/representantes?${params.toString()}`, {
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: RepresentantesResponse = await response.json();
        setRepresentantes(data.itens || []);
      }
    } catch (error) {
      console.error("Erro ao carregar representantes:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      try {
        const url = "/api/representantes";
        const method = "POST";

        const response = await fetch(url, {
          method,
          headers: {
            ...getAuthHeadersWithTenant(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          notificationCenter.add({
            type: "success",
            title: "Representante criado",
            message: `${formData.nome} foi criado com sucesso`,
          });
          setShowForm(false);
          setEditingRepresentante(null);
          setFormData({
            clienteId: "",
            nome: "",
            documento: "",
            email: "",
            telefone: "",
            celular: "",
            endereco: "",
            cidade: "",
            estado: "",
            cep: "",
            percentualComissao: 0,
            observacoes: "",
          });
          await loadRepresentantes();
        } else {
          const error = await response.json();
          const errorMessage = error.message || "Erro ao salvar representante";
          notificationCenter.add({
            type: "error",
            title: "Erro ao salvar representante",
            message: errorMessage,
          });
          alert(errorMessage);
        }
      } catch (error) {
        console.error("Erro ao salvar representante:", error);
        notificationCenter.add({
          type: "error",
          title: "Erro",
          message: "Erro ao salvar representante. Tente novamente.",
        });
        alert("Erro ao salvar representante");
      }
    });
  }

  function handleCancel() {
    setShowForm(false);
    setEditingRepresentante(null);
    setFormData({
      clienteId: "",
      nome: "",
      documento: "",
      email: "",
      telefone: "",
      celular: "",
      endereco: "",
      cidade: "",
      estado: "",
      cep: "",
      percentualComissao: 0,
      observacoes: "",
    });
  }

  function getClienteNome(clienteId: string) {
    const cliente = clientes.find((c) => c.clienteId === clienteId);
    return cliente?.nome || "Cliente não encontrado";
  }

  const filteredRepresentantes = representantes.filter((representante) => {
    if (statusFilter !== "all" && representante.status !== statusFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Filtros e busca */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]" />
            <Input
              type="search"
              placeholder="Buscar representantes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <FormSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-[180px]"
          >
            <option value="all">Todos</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
            <option value="suspenso">Suspensos</option>
          </FormSelect>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          {showForm ? "Cancelar" : "Novo Representante"}
        </Button>
      </div>

      {/* Formulário */}
      {showForm && (
        <GlassCard className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Novo Representante</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Cliente" required fieldId="clienteId" className="md:col-span-2">
                {loadingClientes ? (
                  <p className="text-sm text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                    Carregando clientes...
                  </p>
                ) : (
                  <FormSelect
                    id="clienteId"
                    value={formData.clienteId}
                    onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
                    required
                  >
                    <option value="">Selecione um cliente</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.clienteId} value={cliente.clienteId}>
                        {cliente.nome} ({cliente.tipo === "fisica" ? "PF" : "PJ"})
                      </option>
                    ))}
                  </FormSelect>
                )}
              </FormField>

              <FormField label="Nome" required fieldId="nome">
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="CPF" required fieldId="documento">
                <Input
                  id="documento"
                  value={formData.documento}
                  onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="Email" fieldId="email">
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </FormField>

              <FormField label="Telefone" fieldId="telefone">
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                />
              </FormField>

              <FormField label="Celular" fieldId="celular">
                <Input
                  id="celular"
                  value={formData.celular}
                  onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                />
              </FormField>

              <FormField label="Percentual de Comissão (%)" required fieldId="percentualComissao">
                <Input
                  id="percentualComissao"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.percentualComissao}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      percentualComissao: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                />
              </FormField>

              <FormField label="CEP" fieldId="cep">
                <Input
                  id="cep"
                  value={formData.cep}
                  onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                />
              </FormField>

              <FormField label="Endereço" fieldId="endereco" className="md:col-span-2">
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                />
              </FormField>

              <FormField label="Cidade" fieldId="cidade">
                <Input
                  id="cidade"
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                />
              </FormField>

              <FormField label="Estado (UF)" fieldId="estado">
                <Input
                  id="estado"
                  value={formData.estado}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estado: e.target.value.toUpperCase().slice(0, 2),
                    })
                  }
                  maxLength={2}
                />
              </FormField>

              <FormTextarea
                label="Observações"
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                className="md:col-span-2"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Salvando..." : "Criar"}
              </Button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Lista de representantes */}
      {loading ? (
        <div className="py-12 text-center text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
          Carregando representantes...
        </div>
      ) : filteredRepresentantes.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <User className="mx-auto h-12 w-12 text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]" />
          <p className="mt-4 text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
            Nenhum representante encontrado.
          </p>
        </GlassCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRepresentantes.map((representante) => (
            <GlassCard key={representante.representanteId} className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-[var(--primary)]" />
                  <div>
                    <h3 className="font-semibold">{representante.nome}</h3>
                    <p className="text-sm text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                      <Building2 className="mr-1 inline h-3 w-3" />
                      {getClienteNome(representante.clienteId)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {representante.status === "ativo" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-xs capitalize">{representante.status}</span>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                  CPF: {representante.documento}
                </p>
                <p className="flex items-center gap-2 font-semibold text-[var(--primary)]">
                  <Percent className="h-4 w-4" />
                  {representante.percentualComissao.toFixed(2)}% de comissão
                </p>
                {representante.email && (
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {representante.email}
                  </p>
                )}
                {representante.telefone && (
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {representante.telefone}
                  </p>
                )}
                {representante.endereco && (
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {representante.endereco}, {representante.cidade} - {representante.estado}
                  </p>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
