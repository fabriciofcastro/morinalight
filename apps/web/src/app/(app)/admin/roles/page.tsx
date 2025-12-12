"use client";

import { Button, cn, GlassCard, Input } from "@morina/ui";
import { motion } from "framer-motion";
import { Edit, Plus, RefreshCw, Search, Shield, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { permissionsApi, type Role } from "@/lib/api/permissions";

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadRoles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await permissionsApi.getRoles();
      setRoles(data);
    } catch (error) {
      console.error("Failed to load roles", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRoles();
  }, [loadRoles]);

  const filteredRoles = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter(
      (role) => role.name.toLowerCase().includes(q) || role.code.toLowerCase().includes(q),
    );
  }, [roles, searchTerm]);

  const onDelete = useCallback(
    async (roleId: string) => {
      const ok = confirm(
        "Tem certeza que deseja deletar este perfil? Esta ação não pode ser desfeita.",
      );
      if (!ok) return;
      try {
        setDeletingId(roleId);
        await permissionsApi.deleteRole(roleId);
        await loadRoles();
      } catch (error) {
        console.error("Failed to delete role", error);
        alert("Erro ao deletar perfil.");
      } finally {
        setDeletingId(null);
      }
    },
    [loadRoles],
  );

  return (
    <div className="relative space-y-6">
      <div className="pointer-events-none absolute inset-0 holo-grid opacity-[0.10]" />
      <div className="pointer-events-none absolute inset-0 beam-line opacity-[0.10]" />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Perfis de Acesso</h1>
          <p className="mt-1 text-sm text-white/50">
            RBAC (Roles) com eventos, auditoria e consistência multiempresa.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={() => void loadRoles()} type="button">
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Link href="/admin/roles/new">
            <Button type="button">
              <Plus className="mr-2 h-4 w-4" />
              Novo Perfil
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <GlassCard className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,hsl(var(--primary))/0.08,transparent_60%)]" />
        <div className="relative flex items-center gap-3">
          <Search className="h-4 w-4 text-white/40" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome ou código…"
            className="flex-1"
          />
        </div>
      </GlassCard>

      {/* List */}
      <GlassCard className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-white/50">Carregando perfis…</div>
        ) : filteredRoles.length === 0 ? (
          <div className="p-8 text-center text-white/50">Nenhum perfil encontrado.</div>
        ) : (
          <div className="divide-y divide-white/10">
            {filteredRoles.map((role) => (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between gap-3 p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center border border-white/10 bg-white/5">
                    <Shield className="h-5 w-5 text-[hsl(var(--primary))]" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-medium text-white">{role.name}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/50">
                      <span className="font-mono border border-white/10 bg-black/20 px-2 py-0.5">
                        {role.code}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-2 border border-white/10 bg-black/20 px-2 py-0.5",
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5",
                            role.active ? "bg-[hsl(var(--success))]" : "bg-[hsl(var(--danger))]",
                          )}
                        />
                        {role.active ? "Ativo" : "Inativo"}
                      </span>
                      <span className="border border-white/10 bg-black/20 px-2 py-0.5">
                        {role.scope}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/admin/roles/${role.id}`}>
                    <Button variant="secondary" type="button">
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                  </Link>
                  <Button
                    variant="secondary"
                    type="button"
                    disabled={deletingId === role.id}
                    onClick={() => void onDelete(role.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deletingId === role.id ? "Deletando…" : "Deletar"}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
