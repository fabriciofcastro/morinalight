"use client";

import { useState, useTransition, useEffect } from "react";
import { Button, GlassCard, Input, Label, FormSelect, FormField, FormTextarea, cn } from "@morina/ui";
import { Plus, Search, Edit, Trash2, CheckCircle2, XCircle, Building2, Mail, Phone, MapPin } from "lucide-react";
import { getAuthHeaders } from "@/lib/auth-client";
import { offlineApi } from "@/lib/offline-api";
import { notificationCenter } from "@/components/notifications/notification-center";

type Supplier = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  document: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

type SuppliersResponse = {
  itens: Supplier[];
};

export function SuppliersClient() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [pending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    document: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    notes: "",
  });

  useEffect(() => {
    loadSuppliers();
  }, [statusFilter]);

  async function loadSuppliers() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (search.length >= 2) {
        params.append("busca", search);
      }

      const response = await fetch(`/api/suppliers?${params.toString()}`, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: SuppliersResponse = await response.json();
        setSuppliers(data.itens || []);
      }
    } catch (error) {
      console.error("Erro ao carregar fornecedores:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    startTransition(async () => {
      try {
        const response = editingSupplier
          ? await offlineApi.suppliers.update(editingSupplier.id, formData)
          : await offlineApi.suppliers.create(formData);

        const data = await response.json();

        if (response.ok || data.queued) {
          notificationCenter.add({
            type: "success",
            title: editingSupplier ? "Fornecedor atualizado" : "Fornecedor criado",
            message: `${formData.name} foi ${editingSupplier ? "atualizado" : "criado"} com sucesso`,
          });
          setShowForm(false);
          setEditingSupplier(null);
          setFormData({
            name: "",
            email: "",
            phone: "",
            document: "",
            address: "",
            city: "",
            state: "",
            zipCode: "",
            notes: "",
          });

          if (data.queued) {
            setTimeout(() => loadSuppliers(), 2000);
          } else {
            await loadSuppliers();
          }
        } else {
          const errorMessage = data.message || "Erro ao salvar fornecedor";
          notificationCenter.add({
            type: "error",
            title: "Erro ao salvar fornecedor",
            message: errorMessage,
          });
        }
      } catch (error) {
        console.error("Erro ao salvar fornecedor:", error);
        notificationCenter.add({
          type: "error",
          title: "Erro",
          message: "Erro ao salvar fornecedor. Tente novamente.",
        });
      }
    });
  }

  async function handleDelete(id: string) {
    const supplier = suppliers.find((s) => s.id === id);
    const supplierName = supplier?.name || "este fornecedor";

    if (!confirm(`Tem certeza que deseja excluir ${supplierName}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    startTransition(async () => {
      try {
        const response = await offlineApi.suppliers.delete(id);
        const data = await response.json();

        if (response.ok || data.queued) {
          notificationCenter.add({
            type: "success",
            title: "Fornecedor excluído",
            message: `${supplierName} foi excluído com sucesso`,
          });
          if (data.queued) {
            setTimeout(() => loadSuppliers(), 2000);
          } else {
            await loadSuppliers();
          }
        } else {
          const errorMessage = data.message || "Erro ao excluir fornecedor";
          notificationCenter.add({
            type: "error",
            title: "Erro ao excluir fornecedor",
            message: errorMessage,
          });
        }
      } catch (error) {
        console.error("Erro ao excluir fornecedor:", error);
        notificationCenter.add({
          type: "error",
          title: "Erro",
          message: "Erro ao excluir fornecedor. Tente novamente.",
        });
      }
    });
  }

  function handleEdit(supplier: Supplier) {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      email: supplier.email || "",
      phone: supplier.phone || "",
      document: supplier.document || "",
      address: supplier.address || "",
      city: supplier.city || "",
      state: supplier.state || "",
      zipCode: supplier.zipCode || "",
      notes: supplier.notes || "",
    });
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingSupplier(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      document: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      notes: "",
    });
  }

  const filteredSuppliers = suppliers.filter((supplier) => {
    if (search && search.length >= 2) {
      return (
        supplier.name.toLowerCase().includes(search.toLowerCase()) ||
        supplier.email?.toLowerCase().includes(search.toLowerCase()) ||
        supplier.document?.toLowerCase().includes(search.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      {/* Barra de ações */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--text-3))]" />
          <Input
            type="text"
            placeholder="Buscar fornecedores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                loadSuppliers();
              }
            }}
            className="pl-10 cursor-text"
          />
        </div>

        <div className="flex items-center gap-3">
          <FormSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-[180px]"
          >
            <option value="all">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </FormSelect>

          <Button
            onClick={() => setShowForm(true)}
            className="cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Novo Fornecedor
          </Button>
        </div>
      </div>

      {/* Formulário */}
      {showForm && (
        <GlassCard className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Nome / Razão Social *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="mt-2 cursor-text"
                />
              </div>

              <div>
                <Label htmlFor="document">CNPJ / CPF</Label>
                <Input
                  id="document"
                  value={formData.document}
                  onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                  className="mt-2 cursor-text"
                />
              </div>

              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-2 cursor-text"
                />
              </div>

              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-2 cursor-text"
                />
              </div>

              <div>
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-2 cursor-text"
                />
              </div>

              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="mt-2 cursor-text"
                />
              </div>

              <div>
                <Label htmlFor="state">Estado (UF)</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                  maxLength={2}
                  className="mt-2 cursor-text"
                />
              </div>

              <div>
                <Label htmlFor="zipCode">CEP</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  className="mt-2 cursor-text"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Observações</Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="mt-2 w-full cursor-text rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2 text-sm"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={handleCancel} className="cursor-pointer">
                Cancelar
              </Button>
              <Button type="submit" disabled={pending} className="cursor-pointer">
                {editingSupplier ? "Atualizar" : "Criar"} Fornecedor
              </Button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Lista de fornecedores */}
      {loading ? (
        <p className="text-sm text-[hsl(var(--text-3))]">Carregando...</p>
      ) : filteredSuppliers.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-[hsl(var(--text-3))]" />
          <p className="mt-4 text-sm text-[hsl(var(--text-3))]">
            Nenhum fornecedor encontrado.
          </p>
        </GlassCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSuppliers.map((supplier) => (
            <GlassCard key={supplier.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-[hsl(var(--primary))]" />
                    <h3 className="font-semibold text-[hsl(var(--text-1))]">{supplier.name}</h3>
                  </div>
                  
                  {supplier.document && (
                    <p className="mt-1 text-xs text-[hsl(var(--text-3))]">
                      {supplier.document}
                    </p>
                  )}

                  <div className="mt-3 space-y-1.5 text-sm text-[hsl(var(--text-2))]">
                    {supplier.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        <span>{supplier.email}</span>
                      </div>
                    )}
                    {supplier.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        <span>{supplier.phone}</span>
                      </div>
                    )}
                    {(supplier.city || supplier.state) && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <span>
                          {supplier.city}
                          {supplier.state && `, ${supplier.state}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                    supplier.status === "ativo"
                      ? "bg-green-500/10 text-green-600"
                      : "bg-red-500/10 text-red-600",
                  )}
                >
                  {supplier.status === "ativo" ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <XCircle className="h-3 w-3" />
                  )}
                  {supplier.status === "ativo" ? "Ativo" : "Inativo"}
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(supplier)}
                    className="cursor-pointer"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(supplier.id)}
                    className="cursor-pointer text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

