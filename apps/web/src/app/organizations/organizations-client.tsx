"use client";

import { useState, useTransition, useEffect } from "react";
import { Button, GlassCard, Input, Label, FormField, FormTextarea, cn } from "@morina/ui";
import { Plus, Search, Users, Building2, Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { getAuthHeaders } from "@/lib/auth-client";
import { offlineApi } from "@/lib/offline-api";
import { useOfflineSync } from "@/hooks/use-offline-sync";
import { notificationCenter } from "@/components/notifications/notification-center";

type Organization = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

type OrganizationsResponse = {
  itens: Organization[];
};

export function OrganizationsClient() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingOrganization, setEditingOrganization] = useState<Organization | null>(null);
  const [pending, startTransition] = useTransition();
  const { hasPendingOperations } = useOfflineSync();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    loadOrganizations();
  }, []);

  async function loadOrganizations() {
    setLoading(true);
    try {
      const response = await fetch("/api/organizations", {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: OrganizationsResponse = await response.json();
        setOrganizations(data.itens || []);
      }
    } catch (error) {
      console.error("Erro ao carregar organizações:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      try {
        const response = editingOrganization
          ? await offlineApi.organizations.update(editingOrganization.id, formData)
          : await offlineApi.organizations.create(formData);

        const data = await response.json();

        if (response.ok || data.queued) {
          notificationCenter.add({
            type: "success",
            title: editingOrganization ? "Organização atualizada" : "Organização criada",
            message: `${formData.name} foi ${editingOrganization ? "atualizada" : "criada"} com sucesso`,
          });
          setShowForm(false);
          setEditingOrganization(null);
          setFormData({ name: "", description: "" });
          
          if (data.queued) {
            // Operação enfileirada - recarregar após um delay para dar tempo de sincronizar
            setTimeout(() => loadOrganizations(), 2000);
          } else {
            await loadOrganizations();
          }
        } else {
          const errorMessage = data.message || "Erro ao salvar organização";
          notificationCenter.add({
            type: "error",
            title: "Erro ao salvar organização",
            message: errorMessage,
          });
        }
      } catch (error) {
        console.error("Erro ao salvar organização:", error);
        notificationCenter.add({
          type: "error",
          title: "Erro",
          message: "Erro ao salvar organização. Tente novamente.",
        });
      }
    });
  }

  async function handleDelete(id: string) {
    const organization = organizations.find((o) => o.id === id);
    const orgName = organization?.name || "esta organização";

    if (!confirm(`Tem certeza que deseja excluir ${orgName}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    startTransition(async () => {
      try {
        const response = await offlineApi.organizations.delete(id);
        const data = await response.json();

        if (response.ok || data.queued) {
          notificationCenter.add({
            type: "success",
            title: "Organização excluída",
            message: `${orgName} foi excluída com sucesso`,
          });
          if (data.queued) {
            setTimeout(() => loadOrganizations(), 2000);
          } else {
            await loadOrganizations();
          }
        } else {
          const errorMessage = data.message || "Erro ao excluir organização";
          notificationCenter.add({
            type: "error",
            title: "Erro ao excluir organização",
            message: errorMessage,
          });
        }
      } catch (error) {
        console.error("Erro ao excluir organização:", error);
        notificationCenter.add({
          type: "error",
          title: "Erro",
          message: "Erro ao excluir organização. Tente novamente.",
        });
      }
    });
  }

  function handleEdit(org: Organization) {
    setEditingOrganization(org);
    setFormData({
      name: org.name,
      description: org.description || "",
    });
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingOrganization(null);
    setFormData({ name: "", description: "" });
  }

  const filteredOrganizations = organizations.filter((org) => {
    if (search) {
      return (
        org.name.toLowerCase().includes(search.toLowerCase()) ||
        org.description?.toLowerCase().includes(search.toLowerCase())
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
            placeholder="Buscar organizações..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 cursor-text"
          />
        </div>

        <Button onClick={() => setShowForm(true)} className="cursor-pointer">
          <Plus className="h-4 w-4" />
          Nova Organização
        </Button>
      </div>

      {/* Formulário */}
      {showForm && (
        <GlassCard className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormField label="Nome da Organização" required fieldId="name">
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </FormField>

            <FormTextarea
              label="Descrição"
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Salvando..." : editingOrganization ? "Atualizar" : "Criar"} Organização
              </Button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Lista de organizações */}
      {loading ? (
        <p className="text-sm text-[hsl(var(--text-3))]">Carregando...</p>
      ) : filteredOrganizations.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-[hsl(var(--text-3))]" />
          <p className="mt-4 text-sm text-[hsl(var(--text-3))]">
            Nenhuma organização encontrada.
          </p>
        </GlassCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredOrganizations.map((org) => (
            <GlassCard key={org.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-[hsl(var(--primary))]" />
                    <h3 className="font-semibold text-[hsl(var(--text-1))]">{org.name}</h3>
                  </div>
                  {org.description && (
                    <p className="mt-2 text-sm text-[hsl(var(--text-2))] line-clamp-2">
                      {org.description}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-[hsl(var(--text-3))]">Slug: {org.slug}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-[hsl(var(--text-3))]">
                  Criada em {new Date(org.createdAt).toLocaleDateString("pt-BR")}
                </span>

                <div className="flex items-center gap-2">
                  <Link href={`/settings/team?orgId=${org.id}`}>
                    <Button variant="ghost" size="sm" className="cursor-pointer">
                      <Users className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/organizations/${org.id}`}>
                    <Button variant="ghost" size="sm" className="cursor-pointer">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(org)}
                    className="cursor-pointer"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(org.id)}
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
