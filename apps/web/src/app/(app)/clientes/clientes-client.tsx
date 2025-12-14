"use client";

import { Button, FormField, FormSelect, FormTextarea, GlassCard, Input } from "@morina/ui";
import {
  Building2,
  CheckCircle2,
  Edit,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  User,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";
import { notificationCenter } from "@/components/notifications/notification-center";
import { getAuthHeadersWithTenant } from "@/lib/auth-client";

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

type ClientesResponse = {
  itens: Cliente[];
  proximoCursor?: string | null;
};

export function ClientesClient() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [pending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    nome: "",
    razaoSocial: "",
    tipo: "fisica" as "fisica" | "juridica",
    documento: "",
    email: "",
    telefone: "",
    celular: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    observacoes: "",
  });

  const loadClientes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (search.length >= 2) {
        params.append("busca", search);
      }

      const response = await fetch(`/api/clientes?${params.toString()}`, {
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
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    void loadClientes();
  }, [loadClientes]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      try {
        const url = editingCliente ? `/api/clientes/${editingCliente.clienteId}` : "/api/clientes";

        const method = editingCliente ? "PUT" : "POST";

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
            title: editingCliente ? "Cliente atualizado" : "Cliente criado",
            message: `${formData.nome} foi ${editingCliente ? "atualizado" : "criado"} com sucesso`,
          });
          setShowForm(false);
          setEditingCliente(null);
          setFormData({
            nome: "",
            razaoSocial: "",
            tipo: "fisica",
            documento: "",
            email: "",
            telefone: "",
            celular: "",
            endereco: "",
            cidade: "",
            estado: "",
            cep: "",
            observacoes: "",
          });
          await loadClientes();
        } else {
          const error = await response.json();
          const errorMessage = error.message || "Erro ao salvar cliente";
          notificationCenter.add({
            type: "error",
            title: "Erro ao salvar cliente",
            message: errorMessage,
          });
          alert(errorMessage);
        }
      } catch (error) {
        console.error("Erro ao salvar cliente:", error);
        notificationCenter.add({
          type: "error",
          title: "Erro",
          message: "Erro ao salvar cliente. Tente novamente.",
        });
        alert("Erro ao salvar cliente");
      }
    });
  }

  function handleEdit(cliente: Cliente) {
    setEditingCliente(cliente);
    setFormData({
      nome: cliente.nome,
      razaoSocial: cliente.razaoSocial || "",
      tipo: cliente.tipo,
      documento: cliente.documento,
      email: cliente.email || "",
      telefone: cliente.telefone || "",
      celular: cliente.celular || "",
      endereco: cliente.endereco || "",
      cidade: cliente.cidade || "",
      estado: cliente.estado || "",
      cep: cliente.cep || "",
      observacoes: cliente.observacoes || "",
    });
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingCliente(null);
    setFormData({
      nome: "",
      razaoSocial: "",
      tipo: "fisica",
      documento: "",
      email: "",
      telefone: "",
      celular: "",
      endereco: "",
      cidade: "",
      estado: "",
      cep: "",
      observacoes: "",
    });
  }

  const filteredClientes = clientes.filter((cliente) => {
    if (statusFilter !== "all" && cliente.status !== statusFilter) {
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
              placeholder="Buscar clientes..."
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
            <option value="bloqueado">Bloqueados</option>
          </FormSelect>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          {showForm ? "Cancelar" : "Novo Cliente"}
        </Button>
      </div>

      {/* Formulário */}
      {showForm && (
        <GlassCard className="p-6">
          <h2 className="mb-4 text-lg font-semibold">
            {editingCliente ? "Editar Cliente" : "Novo Cliente"}
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormSelect
                label="Tipo"
                id="tipo"
                value={formData.tipo}
                onChange={(e) =>
                  setFormData({ ...formData, tipo: e.target.value as "fisica" | "juridica" })
                }
                required
              >
                <option value="fisica">Pessoa Física</option>
                <option value="juridica">Pessoa Jurídica</option>
              </FormSelect>

              <FormField
                label={formData.tipo === "fisica" ? "CPF" : "CNPJ"}
                required
                fieldId="documento"
              >
                <Input
                  id="documento"
                  value={formData.documento}
                  onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="Nome" required fieldId="nome">
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </FormField>

              {formData.tipo === "juridica" && (
                <FormField label="Razão Social" fieldId="razaoSocial">
                  <Input
                    id="razaoSocial"
                    value={formData.razaoSocial}
                    onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
                  />
                </FormField>
              )}

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
                    setFormData({ ...formData, estado: e.target.value.toUpperCase().slice(0, 2) })
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
                {pending ? "Salvando..." : editingCliente ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Lista de clientes */}
      {loading ? (
        <div className="text-center py-12 text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
          Carregando clientes...
        </div>
      ) : filteredClientes.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <User className="mx-auto h-12 w-12 text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]" />
          <p className="mt-4 text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
            Nenhum cliente encontrado.
          </p>
        </GlassCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClientes.map((cliente) => (
            <GlassCard key={cliente.clienteId} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {cliente.tipo === "juridica" ? (
                    <Building2 className="h-5 w-5 text-[var(--primary)]" />
                  ) : (
                    <User className="h-5 w-5 text-[var(--primary)]" />
                  )}
                  <div>
                    <h3 className="font-semibold">{cliente.nome}</h3>
                    {cliente.razaoSocial && (
                      <p className="text-sm text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                        {cliente.razaoSocial}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {cliente.status === "ativo" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-xs capitalize">{cliente.status}</span>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                  {cliente.tipo === "fisica" ? "CPF" : "CNPJ"}: {cliente.documento}
                </p>
                {cliente.email && (
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {cliente.email}
                  </p>
                )}
                {cliente.telefone && (
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {cliente.telefone}
                  </p>
                )}
                {cliente.endereco && (
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {cliente.endereco}, {cliente.cidade} - {cliente.estado}
                  </p>
                )}
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm" onClick={() => handleEdit(cliente)}>
                  <Edit className="h-4 w-4" />
                  Editar
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
