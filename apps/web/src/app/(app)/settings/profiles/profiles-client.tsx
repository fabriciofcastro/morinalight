"use client";

import { Button, GlassCard, Input, Label, Popover, PopoverContent, PopoverTrigger, cn } from "@morina/ui";
import {
  Copy,
  Download,
  FileSpreadsheet,
  Filter,
  Plus,
  Search,
  Settings,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getAuthHeadersWithTenant } from "@/lib/auth-client";
import { notificationCenter } from "@/shared/ui/notification-center";

type Profile = {
  profileId: string;
  name: string;
  description: string | null;
  permissions: string[];
  role: string;
  isDefault: boolean;
  userCount: number;
  createdAt: string;
  updatedAt: string;
};

type ListResponse<T> = {
  itens: T[];
  proximoCursor?: string | null;
};

export function ProfilesClient() {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [busy, setBusy] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: "",
    description: "",
    role: "member",
    permissions: [] as string[],
  });

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };

      const response = await fetch("/api/profiles", {
        headers,
        cache: "no-store",
      });

      if (response.ok) {
        const data = (await response.json()) as ListResponse<Profile>;
        setProfiles(data.itens ?? []);
      }
    } catch (e) {
      console.error(e);
      notificationCenter.add({
        type: "error",
        title: "Erro ao carregar perfis",
        message: "Não foi possível carregar a lista de perfis.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfiles();
  }, [loadProfiles]);

  const filteredProfiles = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return profiles;

    return profiles.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.role.toLowerCase().includes(query),
    );
  }, [profiles, search]);

  const handleCreate = async () => {
    if (!profileForm.name.trim()) {
      notificationCenter.add({
        type: "error",
        title: "Nome obrigatório",
        message: "Preencha o nome do perfil.",
      });
      return;
    }

    setBusy(true);
    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };

      const response = await fetch("/api/profiles", {
        method: "POST",
        headers,
        body: JSON.stringify(profileForm),
      });

      if (response.ok) {
        notificationCenter.add({
          type: "success",
          title: "Sucesso",
          message: "Perfil criado com sucesso.",
        });
        setProfileForm({ name: "", description: "", role: "member", permissions: [] });
        setCreateDrawerOpen(false);
        void loadProfiles();
      } else {
        const error = await response.json().catch(() => ({ message: "Erro ao criar perfil" }));
        notificationCenter.add({
          type: "error",
          title: "Erro",
          message: error.message || "Não foi possível criar o perfil.",
        });
      }
    } catch (e) {
      console.error(e);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Erro inesperado ao criar perfil.",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleEdit = (profile: Profile) => {
    setSelectedProfile(profile);
    setProfileForm({
      name: profile.name,
      description: profile.description || "",
      role: profile.role,
      permissions: profile.permissions,
    });
    setEditDrawerOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedProfile || !profileForm.name.trim()) return;

    setBusy(true);
    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };

      const response = await fetch(`/api/profiles/${selectedProfile.profileId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(profileForm),
      });

      if (response.ok) {
        notificationCenter.add({
          type: "success",
          title: "Sucesso",
          message: "Perfil atualizado com sucesso.",
        });
        setEditDrawerOpen(false);
        setSelectedProfile(null);
        void loadProfiles();
      } else {
        const error = await response.json().catch(() => ({ message: "Erro ao atualizar perfil" }));
        notificationCenter.add({
          type: "error",
          title: "Erro",
          message: error.message || "Não foi possível atualizar o perfil.",
        });
      }
    } catch (e) {
      console.error(e);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Erro inesperado ao atualizar perfil.",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (profileId: string) => {
    if (!confirm("Tem certeza que deseja excluir este perfil?")) return;

    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };

      const response = await fetch(`/api/profiles/${profileId}`, {
        method: "DELETE",
        headers,
      });

      if (response.ok) {
        notificationCenter.add({
          type: "success",
          title: "Sucesso",
          message: "Perfil excluído com sucesso.",
        });
        void loadProfiles();
      }
    } catch (e) {
      console.error(e);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Erro ao excluir perfil.",
      });
    }
  };

  const handleDuplicate = async (profile: Profile) => {
    setProfileForm({
      name: `${profile.name} (Cópia)`,
      description: profile.description || "",
      role: profile.role,
      permissions: profile.permissions,
    });
    setCreateDrawerOpen(true);
  };

  const handleApplyToUsers = async (profileId: string) => {
    // TODO: Implementar aplicação em massa
    notificationCenter.add({
      type: "info",
      title: "Aplicar Perfil",
      message: "Funcionalidade de aplicação em massa será implementada em breve.",
    });
  };

  const handleExport = (profileId: string) => {
    // TODO: Implementar exportação
    notificationCenter.add({
      type: "info",
      title: "Exportar Perfil",
      message: "Funcionalidade de exportação será implementada em breve.",
    });
  };

  const handleImport = () => {
    // TODO: Implementar importação
    notificationCenter.add({
      type: "info",
      title: "Importar Perfil",
      message: "Funcionalidade de importação será implementada em breve.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar perfis..."
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={handleImport}>
            <Upload className="mr-2 h-4 w-4" />
            Importar
          </Button>

          <Button type="button" onClick={() => setCreateDrawerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Perfil
          </Button>
        </div>
      </div>

      {/* Profiles Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-12 text-center text-white/50">Carregando perfis...</div>
        ) : filteredProfiles.length === 0 ? (
          <div className="col-span-full py-12 text-center text-white/50">
            {search ? "Nenhum perfil encontrado." : "Nenhum perfil cadastrado."}
          </div>
        ) : (
          filteredProfiles.map((profile) => (
            <GlassCard key={profile.profileId} className="p-6 hover:bg-white/5 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Settings className="h-5 w-5 text-[hsl(var(--primary))]" />
                    <h3 className="text-lg font-semibold text-white">{profile.name}</h3>
                    {profile.isDefault && (
                      <span className="rounded px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-[hsl(var(--primary)/0.2)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.3)]">
                        Padrão
                      </span>
                    )}
                  </div>
                  {profile.description && (
                    <p className="text-sm text-white/60">{profile.description}</p>
                  )}
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <X className="h-4 w-4 rotate-45" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-2" align="end">
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => handleEdit(profile)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicate(profile)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <Copy className="h-4 w-4" />
                        Duplicar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyToUsers(profile.profileId)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <Users className="h-4 w-4" />
                        Aplicar a Usuários
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExport(profile.profileId)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        Exportar
                      </button>
                      <div className="my-1 border-t border-white/10" />
                      <button
                        type="button"
                        onClick={() => handleDelete(profile.profileId)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Excluir
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Papel:</span>
                  <span className="text-white">{profile.role}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Permissões:</span>
                  <span className="text-white font-mono text-xs">{profile.permissions.length}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Usuários:</span>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-white/40" />
                    <span className="text-white">{profile.userCount}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10">
                  <p className="text-xs text-white/40">
                    Criado em {new Date(profile.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      {/* Create/Edit Drawer */}
      {(createDrawerOpen || editDrawerOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <GlassCard className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                {editDrawerOpen ? "Editar Perfil" : "Novo Perfil"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setCreateDrawerOpen(false);
                  setEditDrawerOpen(false);
                  setSelectedProfile(null);
                  setProfileForm({ name: "", description: "", role: "member", permissions: [] });
                }}
                className="flex h-8 w-8 items-center justify-center border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="profile-name">Nome do Perfil *</Label>
                <Input
                  id="profile-name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Gerente de Vendas"
                  required
                />
              </div>

              <div>
                <Label htmlFor="profile-description">Descrição</Label>
                <textarea
                  id="profile-description"
                  value={profileForm.description}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Descrição do perfil e suas características"
                  className="flex min-h-[100px] w-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[hsl(var(--primary))] focus:outline-none"
                />
              </div>

              <div>
                <Label htmlFor="profile-role">Papel Base</Label>
                <select
                  id="profile-role"
                  value={profileForm.role}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, role: e.target.value }))}
                  className="flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
                >
                  <option value="owner">Proprietário(a)</option>
                  <option value="admin">Administrador(a)</option>
                  <option value="manager">Gestor(a)</option>
                  <option value="member">Colaborador(a)</option>
                  <option value="viewer">Visitante</option>
                </select>
              </div>

              <div>
                <Label htmlFor="permissions-list">Permissões</Label>
                <p className="mt-1 text-sm text-white/50">
                  Selecione as permissões específicas para este perfil. (Funcionalidade será
                  implementada em breve)
                </p>
                <div className="mt-2 border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-white/50">
                    {profileForm.permissions.length} permissão(ões) selecionada(s)
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCreateDrawerOpen(false);
                  setEditDrawerOpen(false);
                  setSelectedProfile(null);
                  setProfileForm({ name: "", description: "", role: "member", permissions: [] });
                }}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={editDrawerOpen ? handleUpdate : handleCreate}
                disabled={busy}
              >
                {busy
                  ? "Salvando..."
                  : editDrawerOpen
                    ? "Salvar Alterações"
                    : "Criar Perfil"}
              </Button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}




