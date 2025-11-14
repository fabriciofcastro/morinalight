"use client";

import { useState, useEffect, useTransition } from "react";
import { Button, GlassCard, FormSelect, cn } from "@morina/ui";
import { User, X, Plus, Search } from "lucide-react";
import { getAuthHeadersWithTenant } from "@/lib/auth-client";
import { Input } from "@morina/ui";
import { notificationCenter } from "@/components/notifications/notification-center";

type MemberInfo = {
  membershipId: string;
  userId: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  user: {
    email: string;
    displayName: string | null;
    avatarUrl: string | null;
    status: string;
  };
};

type UserData = {
  userId: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  status: "pending" | "active" | "suspended";
};

type MembersManagerProps = {
  entityType: "unit" | "department" | "team";
  entityId: string;
  entityName: string;
  onClose?: () => void;
};

const ROLE_LABELS = {
  owner: "Proprietário(a)",
  admin: "Administrador(a)",
  manager: "Gestor(a)",
  member: "Colaborador(a)",
  viewer: "Visitante",
} as const;

const ROLE_OPTIONS = [
  { value: "owner", label: ROLE_LABELS.owner },
  { value: "admin", label: ROLE_LABELS.admin },
  { value: "manager", label: ROLE_LABELS.manager },
  { value: "member", label: ROLE_LABELS.member },
  { value: "viewer", label: ROLE_LABELS.viewer },
] as const;

const STATUS_LABELS: Record<string, string> = {
  active: "Ativo",
  pending: "Pendente",
  suspended: "Suspenso",
};

export function MembersManager({
  entityType,
  entityId,
  entityName,
  onClose,
}: MembersManagerProps) {
  const [members, setMembers] = useState<MemberInfo[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState<keyof typeof ROLE_LABELS>("member");
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  const apiBasePath = {
    unit: `/api/organizational-units/${entityId}/members`,
    department: `/api/departments/${entityId}/members`,
    team: `/api/teams/${entityId}/members`,
  }[entityType];

  useEffect(() => {
    loadMembers();
  }, [entityId, entityType]);

  async function loadMembers() {
    setLoading(true);
    try {
      const response = await fetch(apiBasePath, {
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        const loadedMembers = data.itens || [];
        setMembers(loadedMembers);
        // Carregar usuários disponíveis após carregar membros
        await loadAvailableUsers(loadedMembers);
      }
    } catch (error) {
      console.error("Erro ao carregar membros:", error);
      notificationCenter.add({
        type: "error",
        title: "Erro ao carregar membros",
        message: "Não foi possível carregar a lista de membros. Tente novamente.",
      });
      setFeedback({
        type: "error",
        message: "Erro ao carregar membros",
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadAvailableUsers(currentMembers: MemberInfo[] = members) {
    try {
      const response = await fetch("/api/users", {
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        const allUsers: UserData[] = data.itens || [];
        // Filtrar usuários que já são membros
        const memberUserIds = new Set(currentMembers.map((m) => m.userId));
        setAvailableUsers(allUsers.filter((u) => !memberUserIds.has(u.userId)));
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    }
  }

  async function handleAddMember() {
    if (!selectedUserId) {
      setFeedback({
        type: "error",
        message: "Selecione um usuário",
      });
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch(apiBasePath, {
          method: "POST",
          headers: {
            ...getAuthHeadersWithTenant(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: selectedUserId,
            role: selectedRole,
          }),
        });

        if (response.ok) {
          notificationCenter.add({
            type: "success",
            title: "Membro adicionado",
            message: "Membro adicionado com sucesso à estrutura organizacional",
          });
          setShowAddMember(false);
          setSelectedUserId("");
          setSelectedRole("member");
          setSearch("");
          // Recarregar membros atualiza automaticamente a lista de usuários disponíveis
          await loadMembers();
        } else {
          const error = await response.json();
          const errorMessage = error.message || "Erro ao adicionar membro";
          notificationCenter.add({
            type: "error",
            title: "Erro ao adicionar membro",
            message: errorMessage,
          });
          setFeedback({
            type: "error",
            message: errorMessage,
          });
        }
      } catch (error) {
        const errorMessage = "Erro ao adicionar membro";
        notificationCenter.add({
          type: "error",
          title: "Erro",
          message: errorMessage,
        });
        setFeedback({
          type: "error",
          message: errorMessage,
        });
      }
    });
  }

  async function handleRemoveMember(userId: string) {
    const member = members.find((m) => m.userId === userId);
    const memberName = member?.user.displayName || member?.user.email || "este membro";

    if (
      !confirm(
        `Tem certeza que deseja remover ${memberName}? Esta ação não pode ser desfeita.`,
      )
    ) {
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch(`${apiBasePath}/${userId}`, {
          method: "DELETE",
          headers: {
            ...getAuthHeadersWithTenant(),
            "Content-Type": "application/json",
          },
        });

        if (response.ok || response.status === 204) {
          notificationCenter.add({
            type: "success",
            title: "Membro removido",
            message: `${memberName} foi removido da estrutura organizacional`,
          });
          // Recarregar membros atualiza automaticamente a lista de usuários disponíveis
          await loadMembers();
        } else {
          const error = await response.json();
          const errorMessage = error.message || "Erro ao remover membro";
          notificationCenter.add({
            type: "error",
            title: "Erro ao remover membro",
            message: errorMessage,
          });
          setFeedback({
            type: "error",
            message: errorMessage,
          });
        }
      } catch (error) {
        const errorMessage = "Erro ao remover membro";
        notificationCenter.add({
          type: "error",
          title: "Erro",
          message: errorMessage,
        });
        setFeedback({
          type: "error",
          message: errorMessage,
        });
      }
    });
  }

  async function handleRoleChange(userId: string, role: keyof typeof ROLE_LABELS) {
    startTransition(async () => {
      try {
        const response = await fetch(`${apiBasePath}/${userId}`, {
          method: "PATCH",
          headers: {
            ...getAuthHeadersWithTenant(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role }),
        });

        if (response.ok) {
          const member = members.find((m) => m.userId === userId);
          const roleLabel = ROLE_OPTIONS.find((r) => r.value === role)?.label || role;
          notificationCenter.add({
            type: "success",
            title: "Papel atualizado",
            message: `Papel de ${member?.user.displayName || member?.user.email || "membro"} atualizado para ${roleLabel}`,
          });
          await loadMembers();
        } else {
          const error = await response.json();
          const errorMessage = error.message || "Erro ao atualizar papel";
          notificationCenter.add({
            type: "error",
            title: "Erro ao atualizar papel",
            message: errorMessage,
          });
          setFeedback({
            type: "error",
            message: errorMessage,
          });
        }
      } catch (error) {
        const errorMessage = "Erro ao atualizar papel";
        notificationCenter.add({
          type: "error",
          title: "Erro",
          message: errorMessage,
        });
        setFeedback({
          type: "error",
          message: errorMessage,
        });
      }
    });
  }

  const filteredAvailableUsers = availableUsers.filter((user) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchLower) ||
      user.displayName?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <GlassCard className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Membros de {entityName}</h3>
          <p className="text-sm text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
            {members.length} membro(s)
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {feedback && (
        <div
          className={cn(
            "mb-4 rounded-lg px-4 py-2 text-sm",
            feedback.type === "success"
              ? "bg-green-500/20 text-green-500"
              : "bg-red-500/20 text-red-500",
          )}
        >
          {feedback.message}
        </div>
      )}

      {/* Adicionar membro */}
      <div className="mb-4">
        {!showAddMember ? (
          <Button onClick={() => setShowAddMember(true)} variant="secondary" size="sm">
            <Plus className="h-4 w-4" />
            Adicionar Membro
          </Button>
        ) : (
          <GlassCard className="p-4">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]" />
                <Input
                  type="search"
                  placeholder="Buscar usuários..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {filteredAvailableUsers.length === 0 ? (
                <p className="py-4 text-center text-sm text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                  Nenhum usuário disponível
                </p>
              ) : (
                <div className="max-h-48 overflow-y-auto">
                  {filteredAvailableUsers.map((user) => (
                    <button
                      key={user.userId}
                      type="button"
                      onClick={() => setSelectedUserId(user.userId)}
                      className={cn(
                        "w-full rounded-lg border p-3 text-left transition-colors",
                        selectedUserId === user.userId
                          ? "border-[var(--primary)] bg-[color-mix(in_oklab,var(--primary)_10%,transparent)]"
                          : "border-[color-mix(in_oklab,var(--border)_90%,transparent)] hover:border-[var(--primary)]",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.displayName || user.email}
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <User className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{user.displayName || user.email}</p>
                          <p className="text-xs text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <FormSelect
                label="Papel"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as keyof typeof ROLE_LABELS)}
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </FormSelect>

              <div className="flex gap-2">
                <Button
                  onClick={handleAddMember}
                  disabled={!selectedUserId || pending}
                  size="sm"
                >
                  Adicionar
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setShowAddMember(false);
                    setSelectedUserId("");
                    setSearch("");
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </GlassCard>
        )}
      </div>

      {/* Lista de membros */}
      {loading ? (
        <p className="py-8 text-center text-sm text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
          Carregando membros...
        </p>
      ) : members.length === 0 ? (
        <p className="py-8 text-center text-sm text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
          Nenhum membro encontrado
        </p>
      ) : (
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.membershipId}
              className="flex items-center justify-between rounded-lg border border-[color-mix(in_oklab,var(--border)_90%,transparent)] p-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white">
                  {member.user.avatarUrl ? (
                    <img
                      src={member.user.avatarUrl}
                      alt={member.user.displayName || member.user.email}
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{member.user.displayName || member.user.email}</p>
                  <p className="text-xs text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                    {member.user.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <FormSelect
                  value={member.role}
                  onChange={(e) =>
                    handleRoleChange(member.userId, e.target.value as keyof typeof ROLE_LABELS)
                  }
                  disabled={pending}
                  className="w-40"
                >
                  {ROLE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </FormSelect>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveMember(member.userId)}
                  disabled={pending}
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

