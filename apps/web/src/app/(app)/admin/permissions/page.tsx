"use client";

import { Button, GlassCard, Input } from "@morina/ui";
import { motion } from "framer-motion";
import { Edit, Key, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { type Permission, permissionsApi } from "@/lib/api/permissions";

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadPermissions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await permissionsApi.getPermissions();
      setPermissions(data);
    } catch (error) {
      console.error("Failed to load permissions", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPermissions();
  }, [loadPermissions]);

  const filteredPermissions = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return permissions;
    return permissions.filter(
      (perm) => perm.name.toLowerCase().includes(q) || perm.code.toLowerCase().includes(q),
    );
  }, [permissions, searchTerm]);

  const onDelete = useCallback(
    async (permissionId: string) => {
      const ok = confirm(
        "Tem certeza que deseja deletar esta permissão? Isso pode afetar RBAC e regras.",
      );
      if (!ok) return;
      try {
        setDeletingId(permissionId);
        await permissionsApi.deletePermission(permissionId);
        await loadPermissions();
      } catch (error) {
        console.error("Failed to delete permission", error);
        alert("Erro ao deletar permissão.");
      } finally {
        setDeletingId(null);
      }
    },
    [loadPermissions],
  );

  return (
    <div className="relative space-y-6">
      <div className="pointer-events-none absolute inset-0 holo-grid opacity-[0.10]" />
      <div className="pointer-events-none absolute inset-0 beam-line opacity-[0.10]" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Permissões</h1>
          <p className="mt-1 text-sm text-white/50">
            Catálogo de permissões granulares (resource:action).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/permissions/matrix">
            <Button variant="secondary" type="button">
              Matriz
            </Button>
          </Link>
          <Button variant="secondary" type="button" onClick={() => void loadPermissions()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Link href="/admin/permissions/new">
            <Button type="button">
              <Plus className="mr-2 h-4 w-4" />
              Nova Permissão
            </Button>
          </Link>
        </div>
      </div>

      <GlassCard>
        <div className="flex items-center gap-3">
          <Search className="h-4 w-4 text-white/40" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome ou permissionKey…"
            className="flex-1"
          />
        </div>
      </GlassCard>

      <GlassCard className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-white/50">Carregando permissões…</div>
        ) : filteredPermissions.length === 0 ? (
          <div className="p-8 text-center text-white/50">Nenhuma permissão encontrada.</div>
        ) : (
          <div className="divide-y divide-white/10">
            {filteredPermissions.map((perm) => (
              <motion.div
                key={perm.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between gap-3 p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center border border-white/10 bg-white/5">
                    <Key className="h-5 w-5 text-[hsl(var(--primary))]" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-medium text-white">{perm.name}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/50">
                      <span className="font-mono border border-white/10 bg-black/20 px-2 py-0.5">
                        {perm.code}
                      </span>
                      <span className="border border-white/10 bg-black/20 px-2 py-0.5">
                        {perm.module}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/admin/permissions/${perm.id}`}>
                    <Button variant="secondary" type="button">
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                  </Link>
                  <Button
                    variant="secondary"
                    type="button"
                    disabled={deletingId === perm.id}
                    onClick={() => void onDelete(perm.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deletingId === perm.id ? "Deletando…" : "Deletar"}
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
