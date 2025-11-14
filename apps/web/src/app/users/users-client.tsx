"use client";

import { useState, useTransition, useEffect } from "react";
import { Button, GlassCard, Input, Label, FormSelect, FormField, cn } from "@morina/ui";
import {
  Plus,
  Search,
  User,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Edit,
  Trash2,
} from "lucide-react";
import { getAuthHeaders } from "@/lib/auth-client";
import { offlineApi } from "@/lib/offline-api";
import { useOfflineSync } from "@/hooks/use-offline-sync";
import { notificationCenter } from "@/components/notifications/notification-center";

type UserData = {
  userId: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  status: "pending" | "active" | "suspended";
  lastLoginAt: string | null;
  createdAt: string;
};

type UsersResponse = {
  itens: UserData[];
};

const STATUS_LABELS = {
  active: "Ativo",
  pending: "Pendente",
  suspended: "Suspenso",
} as const;

export function UsersClient() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [pending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    displayName: "",
    status: "active" as "active" | "pending" | "suspended",
  });

  useEffect(() => {
    loadUsers();
  }, [statusFilter]);

  async function loadUsers() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      const response = await fetch(`/api/users?${params.toString()}`, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: UsersResponse = await response.json();
        setUsers(data.itens || []);
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      try {
        const body: any = {
          email: formData.email,
          displayName: formData.displayName || null,
          status: formData.status,
        };

        // Só incluir senha se estiver preenchida (para edição) ou se for criação
        if (!editingUser || formData.password) {
          body.password = formData.password;
        }

        const response = editingUser
          ? await offlineApi.users.update(editingUser.userId, body)
          : await offlineApi.users.create(body);

        const data = await response.json();

        if (response.ok || data.queued) {
          notificationCenter.add({
            type: "success",
            title: editingUser ? "Usuário atualizado" : "Usuário criado",
            message: `${formData.email} foi ${editingUser ? "atualizado" : "criado"} com sucesso`,
          });
          setShowForm(false);
          setEditingUser(null);
          setFormData({
            email: "",
            password: "",
            displayName: "",
            status: "active",
          });

          if (data.queued) {
            setTimeout(() => loadUsers(), 2000);
          } else {
            await loadUsers();
          }
        } else {
          const errorMessage = data.message || "Erro ao salvar usuário";
          notificationCenter.add({
            type: "error",
            title: "Erro ao salvar usuário",
            message: errorMessage,
          });
        }
      } catch (error) {
        console.error("Erro ao salvar usuário:", error);
        notificationCenter.add({
          type: "error",
          title: "Erro",
          message: "Erro ao salvar usuário. Tente novamente.",
        });
      }
    });
  }

  async function handleDelete(userId: string) {
    const user = users.find((u) => u.userId === userId);
    const userName = user?.displayName || user?.email || "este usuário";

    if (!confirm(`Tem certeza que deseja excluir ${userName}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    startTransition(async () => {
      try {
        const response = await offlineApi.users.delete(userId);
        const data = await response.json();

        if (response.ok || data.queued) {
          notificationCenter.add({
            type: "success",
            title: "Usuário excluído",
            message: `${userName} foi excluído com sucesso`,
          });
          if (data.queued) {
            setTimeout(() => loadUsers(), 2000);
          } else {
            await loadUsers();
          }
        } else {
          const errorMessage = data.message || "Erro ao excluir usuário";
          notificationCenter.add({
            type: "error",
            title: "Erro ao excluir usuário",
            message: errorMessage,
          });
        }
      } catch (error) {
        console.error("Erro ao excluir usuário:", error);
        notificationCenter.add({
          type: "error",
          title: "Erro",
          message: "Erro ao excluir usuário. Tente novamente.",
        });
      }
    });
  }

  function handleEdit(user: UserData) {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: "",
      displayName: user.displayName || "",
      status: user.status,
    });
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingUser(null);
    setFormData({
      email: "",
      password: "",
      displayName: "",
      status: "active",
    });
  }

  const filteredUsers = users.filter((user) => {
    if (search) {
      return (
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.displayName?.toLowerCase().includes(search.toLowerCase())
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
            placeholder="Buscar usuários..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
            <option value="active">Ativo</option>
            <option value="pending">Pendente</option>
            <option value="suspended">Suspenso</option>
          </FormSelect>

          <Button onClick={() => setShowForm(true)} className="cursor-pointer">
            <Plus className="h-4 w-4" />
            Novo Usuário
          </Button>
        </div>
      </div>

      {/* Formulário */}
      {showForm && (
        <GlassCard className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="E-mail" required fieldId="email">
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="Nome" fieldId="displayName">
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                />
              </FormField>

              <FormField
                label={editingUser ? "Nova Senha (deixe em branco para manter)" : "Senha"}
                required={!editingUser}
                fieldId="password"
              >
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                />
              </FormField>

              <FormSelect
                label="Status"
                id="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as "active" | "pending" | "suspended",
                  })
                }
                required
              >
                <option value="active">Ativo</option>
                <option value="pending">Pendente</option>
                <option value="suspended">Suspenso</option>
              </FormSelect>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Salvando..." : editingUser ? "Atualizar" : "Criar"} Usuário
              </Button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Lista de usuários */}
      {loading ? (
        <p className="text-sm text-[hsl(var(--text-3))]">Carregando...</p>
      ) : filteredUsers.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <User className="mx-auto h-12 w-12 text-[hsl(var(--text-3))]" />
          <p className="mt-4 text-sm text-[hsl(var(--text-3))]">Nenhum usuário encontrado.</p>
        </GlassCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => (
            <GlassCard key={user.userId} className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--primary)_/_0.1)]">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.displayName || user.email}
                      className="h-12 w-12 rounded-full"
                    />
                  ) : (
                    <User className="h-6 w-6 text-[hsl(var(--primary))]" />
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-[hsl(var(--text-1))]">
                    {user.displayName || "Sem nome"}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-sm text-[hsl(var(--text-2))]">
                    <Mail className="h-3 w-3" />
                    <span>{user.email}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                    user.status === "active" && "bg-green-500/10 text-green-600",
                    user.status === "pending" && "bg-yellow-500/10 text-yellow-600",
                    user.status === "suspended" && "bg-red-500/10 text-red-600",
                  )}
                >
                  {user.status === "active" && <CheckCircle2 className="h-3 w-3" />}
                  {user.status === "pending" && <Clock className="h-3 w-3" />}
                  {user.status === "suspended" && <XCircle className="h-3 w-3" />}
                  {STATUS_LABELS[user.status]}
                </span>

                {user.lastLoginAt && (
                  <div className="flex items-center gap-1 text-xs text-[hsl(var(--text-3))]">
                    <Calendar className="h-3 w-3" />
                    {new Date(user.lastLoginAt).toLocaleDateString("pt-BR")}
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(user)}
                  className="cursor-pointer"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(user.userId)}
                  className="cursor-pointer text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
