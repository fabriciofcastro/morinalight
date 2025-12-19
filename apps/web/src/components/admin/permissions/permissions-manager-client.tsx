"use client";

import { Button } from "@morina/ui";
import { Search, Key, Plus, X, Trash2, Check } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAuthHeadersWithTenant } from "@/lib/auth-client";
import { permissionsApi, type Permission } from "@/lib/api/permissions";

type PermissionsManagerClientProps = {
  entityType: "department" | "sector" | "position" | "role";
  entityId: string;
  entityName: string;
};

export function PermissionsManagerClient({
  entityType,
  entityId,
  entityName,
}: PermissionsManagerClientProps) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddPermission, setShowAddPermission] = useState(false);
  const [selectedPermissionId, setSelectedPermissionId] = useState("");
  const [pending, startTransition] = useTransition();

  const apiBasePath = {
    department: `/api/departments/${entityId}/permissions`,
    sector: `/api/sectors/${entityId}/permissions`,
    position: `/api/positions/${entityId}/permissions`,
    role: `/api/roles/${entityId}/permissions`,
  }[entityType];

  const loadAllPermissions = useCallback(async () => {
    try {
      const data = await permissionsApi.getPermissions();
      setAllPermissions(data);
    } catch (error) {
      console.error("Erro ao carregar permissões:", error);
    }
  }, []);

  const loadPermissions = useCallback(async () => {
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
        setPermissions(data.itens || []);
      }
      await loadAllPermissions();
    } catch (error) {
      console.error("Erro ao carregar permissões:", error);
    } finally {
      setLoading(false);
    }
  }, [apiBasePath, loadAllPermissions]);

  useEffect(() => {
    void loadPermissions();
  }, [loadPermissions]);

  const handleAddPermission = useCallback(async () => {
    if (!selectedPermissionId) return;

    startTransition(async () => {
      try {
        const response = await fetch(apiBasePath, {
          method: "POST",
          headers: {
            ...getAuthHeadersWithTenant(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            permissionId: selectedPermissionId,
          }),
        });

        if (response.ok) {
          setShowAddPermission(false);
          setSelectedPermissionId("");
          await loadPermissions();
        } else {
          const error = await response.json();
          alert(error.message || "Erro ao adicionar permissão");
        }
      } catch (error) {
        console.error("Erro ao adicionar permissão:", error);
        alert("Erro ao adicionar permissão");
      }
    });
  }, [selectedPermissionId, apiBasePath, loadPermissions]);

  const handleRemovePermission = useCallback(
    async (permissionId: string) => {
      if (!confirm("Tem certeza que deseja remover esta permissão?")) return;

      try {
        const response = await fetch(`${apiBasePath}?permissionId=${permissionId}`, {
          method: "DELETE",
          headers: {
            ...getAuthHeadersWithTenant(),
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          await loadPermissions();
        } else {
          alert("Erro ao remover permissão");
        }
      } catch (error) {
        console.error("Erro ao remover permissão:", error);
        alert("Erro ao remover permissão");
      }
    },
    [apiBasePath, loadPermissions],
  );

  const availablePermissions = allPermissions.filter(
    (perm) => !permissions.some((p) => p.id === perm.id),
  );

  const filteredPermissions = permissions.filter((permission) => {
    const searchLower = search.toLowerCase();
    return (
      permission.name.toLowerCase().includes(searchLower) ||
      permission.code.toLowerCase().includes(searchLower) ||
      permission.module.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Permissões</h2>
          <p className="text-sm text-white/60 mt-1">
            Gerencie as permissões de {entityName}
          </p>
        </div>
        <Button
          onClick={() => setShowAddPermission(true)}
          className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white shadow-lg shadow-[hsl(var(--primary))]/25 hover:shadow-[hsl(var(--primary))]/40 transition-all"
          disabled={availablePermissions.length === 0}
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Permissão
        </Button>
      </div>

      {/* Search */}
      <div className="relative group">
        <div className="absolute -inset-px bg-gradient-to-r from-blue-500/0 to-blue-500/0 rounded-lg group-hover:from-blue-500/30 group-hover:to-blue-400/30 blur-sm transition-all duration-300 group-focus-within:hidden" />
        <div className="relative flex items-center gap-3 px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm focus-within:border-blue-500 hover:border-blue-500/50 transition-all">
          <Search className="h-5 w-5 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar permissões..."
            className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/30"
          />
        </div>
      </div>

      {/* Add Permission Modal */}
      <AnimatePresence>
        {showAddPermission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowAddPermission(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md p-6 rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Adicionar Permissão</h3>
                <button
                  onClick={() => setShowAddPermission(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-white/60" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Permissão
                  </label>
                  <select
                    value={selectedPermissionId}
                    onChange={(e) => setSelectedPermissionId(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Selecione uma permissão</option>
                    {availablePermissions.map((perm) => (
                      <option key={perm.id} value={perm.id}>
                        {perm.name} ({perm.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => setShowAddPermission(false)}
                    variant="secondary"
                    className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleAddPermission}
                    disabled={!selectedPermissionId || pending}
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

      {/* Permissions List */}
      {loading ? (
        <div className="p-8 text-center text-white/50">Carregando permissões...</div>
      ) : filteredPermissions.length === 0 ? (
        <div className="p-8 text-center text-white/50">
          <Key className="h-12 w-12 mx-auto mb-4 text-white/20" />
          <p className="text-lg font-medium text-white/60 mb-2">
            {search ? "Nenhuma permissão encontrada" : "Nenhuma permissão atribuída"}
          </p>
          <p className="text-sm text-white/40">
            {search
              ? "Tente ajustar os filtros de busca"
              : "Comece adicionando permissões a esta entidade"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPermissions.map((permission) => (
            <motion.div
              key={permission.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg border border-white/10 bg-white/[0.05] backdrop-blur-sm hover:bg-white/[0.08] transition-all flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center flex-shrink-0">
                <Key className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-base font-semibold text-white/90 truncate">
                    {permission.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {permission.module}
                  </span>
                </div>
                <p className="text-sm text-white/50 truncate font-mono">{permission.code}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleRemovePermission(permission.id)}
                  className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 backdrop-blur-sm cursor-pointer h-[36px] px-3"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}




