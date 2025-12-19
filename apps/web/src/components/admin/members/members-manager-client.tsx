"use client";

import { Button } from "@morina/ui";
import { Plus, Search, User, X, UserPlus, Trash2, Edit } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAuthHeadersWithTenant } from "@/lib/auth-client";

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

type MembersManagerClientProps = {
  entityType: "branch" | "department" | "sector" | "position";
  entityId: string;
  entityName: string;
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

export function MembersManagerClient({
  entityType,
  entityId,
  entityName,
}: MembersManagerClientProps) {
  const [members, setMembers] = useState<MemberInfo[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState<keyof typeof ROLE_LABELS>("member");
  const [pending, startTransition] = useTransition();
  const [editingRole, setEditingRole] = useState<string | null>(null);

  const apiBasePath = {
    branch: `/api/branches/${entityId}/members`,
    department: `/api/departments/${entityId}/members`,
    sector: `/api/sectors/${entityId}/members`,
    position: `/api/positions/${entityId}/members`,
  }[entityType];

  const loadAvailableUsers = useCallback(async (currentMembers: MemberInfo[]) => {
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
        const memberUserIds = new Set(currentMembers.map((m) => m.userId));
        setAvailableUsers(allUsers.filter((u) => !memberUserIds.has(u.userId)));
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    }
  }, []);

  const loadMembers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(apiBasePath, {
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        const membersList: MemberInfo[] = data.itens || [];
        setMembers(membersList);
        await loadAvailableUsers(membersList);
      }
    } catch (error) {
      console.error("Erro ao carregar membros:", error);
    } finally {
      setLoading(false);
    }
  }, [apiBasePath, loadAvailableUsers]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  const handleAddMember = useCallback(async () => {
    if (!selectedUserId) return;

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
          setShowAddMember(false);
          setSelectedUserId("");
          setSelectedRole("member");
          await loadMembers();
        } else {
          const error = await response.json();
          alert(error.message || "Erro ao adicionar membro");
        }
      } catch (error) {
        console.error("Erro ao adicionar membro:", error);
        alert("Erro ao adicionar membro");
      }
    });
  }, [selectedUserId, selectedRole, apiBasePath, loadMembers]);

  const handleRemoveMember = useCallback(
    async (membershipId: string) => {
      if (!confirm("Tem certeza que deseja remover este membro?")) return;

      try {
        const response = await fetch(`${apiBasePath}?membershipId=${membershipId}`, {
          method: "DELETE",
          headers: {
            ...getAuthHeadersWithTenant(),
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          await loadMembers();
        } else {
          alert("Erro ao remover membro");
        }
      } catch (error) {
        console.error("Erro ao remover membro:", error);
        alert("Erro ao remover membro");
      }
    },
    [apiBasePath, loadMembers],
  );

  const handleUpdateRole = useCallback(
    async (membershipId: string, newRole: string) => {
      try {
        const response = await fetch(apiBasePath, {
          method: "PATCH",
          headers: {
            ...getAuthHeadersWithTenant(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ membershipId, role: newRole }),
        });

        if (response.ok) {
          setEditingRole(null);
          await loadMembers();
        } else {
          alert("Erro ao atualizar função");
        }
      } catch (error) {
        console.error("Erro ao atualizar função:", error);
        alert("Erro ao atualizar função");
      }
    },
    [apiBasePath, loadMembers],
  );

  const filteredMembers = members.filter((member) => {
    const searchLower = search.toLowerCase();
    return (
      member.user.email.toLowerCase().includes(searchLower) ||
      (member.user.displayName?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Membros</h2>
          <p className="text-sm text-white/60 mt-1">
            Gerencie os membros de {entityName}
          </p>
        </div>
        <Button
          onClick={() => setShowAddMember(true)}
          className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white shadow-lg shadow-[hsl(var(--primary))]/25 hover:shadow-[hsl(var(--primary))]/40 transition-all"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Adicionar Membro
        </Button>
      </div>

      {/* Search */}
      <div className="relative group">
        <div className="absolute -inset-px bg-linear-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
        <div className="relative flex items-center gap-3 px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm focus-within:border-blue-500 hover:border-blue-500/50 transition-all">
          <Search className="h-5 w-5 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar membros..."
            className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/30"
          />
        </div>
      </div>

      {/* Add Member Modal */}
      <AnimatePresence>
        {showAddMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowAddMember(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md p-6 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Adicionar Membro</h3>
                <button
                  onClick={() => setShowAddMember(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-white/60" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Usuário
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Selecione um usuário</option>
                    {availableUsers.map((user) => (
                      <option key={user.userId} value={user.userId}>
                        {user.displayName || user.email} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Função
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as keyof typeof ROLE_LABELS)}
                    className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    {ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => setShowAddMember(false)}
                    variant="secondary"
                    className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleAddMember}
                    disabled={!selectedUserId || pending}
                    className="flex-1 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white"
                  >
                    {pending ? "Adicionando..." : "Adicionar"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Members List */}
      {loading ? (
        <div className="p-8 text-center text-white/50">Carregando membros...</div>
      ) : filteredMembers.length === 0 ? (
        <div className="p-8 text-center text-white/50">
          <User className="h-12 w-12 mx-auto mb-4 text-white/20" />
          <p className="text-lg font-medium text-white/60 mb-2">
            {search ? "Nenhum membro encontrado" : "Nenhum membro adicionado"}
          </p>
          <p className="text-sm text-white/40">
            {search
              ? "Tente ajustar os filtros de busca"
              : "Comece adicionando membros a esta entidade"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMembers.map((member) => (
            <motion.div
              key={member.membershipId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg border border-white/10 bg-white/[0.05] backdrop-blur-sm hover:bg-white/[0.08] transition-all flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center flex-shrink-0">
                {member.user.avatarUrl ? (
                  <Image
                    src={member.user.avatarUrl}
                    alt={member.user.displayName || member.user.email}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                ) : (
                  <span className="text-white text-lg font-bold">
                    {(member.user.displayName || member.user.email).charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-base font-semibold text-white/90 truncate">
                    {member.user.displayName || member.user.email}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      member.user.status === "active"
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : member.user.status === "suspended"
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                    }`}
                  >
                    {member.user.status}
                  </span>
                </div>
                <p className="text-sm text-white/50 truncate">{member.user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                {editingRole === member.membershipId ? (
                  <select
                    value={member.role}
                    onChange={(e) => {
                      handleUpdateRole(member.membershipId, e.target.value);
                    }}
                    onBlur={() => setEditingRole(null)}
                    className="px-3 py-1 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white text-sm focus:outline-none focus:border-blue-500"
                    autoFocus
                  >
                    {ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <>
                    <button
                      onClick={() => setEditingRole(member.membershipId)}
                      className="px-3 py-1 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white text-sm hover:bg-white/10 transition-colors"
                    >
                      {ROLE_LABELS[member.role as keyof typeof ROLE_LABELS] || member.role}
                    </button>
                    <Button
                      onClick={() => handleRemoveMember(member.membershipId)}
                      className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 backdrop-blur-sm cursor-pointer h-[36px] px-3"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

