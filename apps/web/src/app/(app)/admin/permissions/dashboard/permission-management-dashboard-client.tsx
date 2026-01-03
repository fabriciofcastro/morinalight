"use client";

import { Button, GlassCard, Input } from "@morina/ui";
import {
  CheckCircle2,
  Filter,
  RefreshCw,
  Search,
  Shield,
  Users,
  XCircle,
  Zap,
  Building2,
  Briefcase,
  UserCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getAuthHeadersWithTenant } from "@/lib/auth-client";
import {
  type Department,
  organizationalStructureApi,
  type Position,
  type Sector,
} from "@/lib/api/organizational-structure";
import { type Permission, permissionsApi } from "@/lib/api/permissions";
import { type User, usersApi } from "@/lib/api/users";

type EntityType = "department" | "sector" | "position" | "user";

type BulkOperationResult = {
  total: number;
  success: number;
  failed: number;
  results: Array<{ entityId: string; permissionId: string; success: boolean; error?: string }>;
};

export function PermissionManagementDashboard() {
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [entityType, setEntityType] = useState<EntityType>("user");
  const [selectedEntityIds, setSelectedEntityIds] = useState<Set<string>>(new Set());
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<string>>(new Set());
  const [granted, setGranted] = useState(true);
  const [reason, setReason] = useState("");
  const [searchEntity, setSearchEntity] = useState("");
  const [searchPermission, setSearchPermission] = useState("");

  const [bulkOperationResult, setBulkOperationResult] = useState<BulkOperationResult | null>(null);
  const [executing, setExecuting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [permsData, deptsData, sectorsData, positionsData, usersData] = await Promise.all([
        permissionsApi.getPermissions(),
        organizationalStructureApi.getDepartments(),
        organizationalStructureApi.getSectors(),
        organizationalStructureApi.getPositions(),
        usersApi.list(),
      ]);

      setPermissions(permsData);
      setDepartments(deptsData);
      setSectors(sectorsData);
      setPositions(positionsData);
      setUsers(usersData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const availableEntities = useMemo(() => {
    const search = searchEntity.toLowerCase();
    switch (entityType) {
      case "department":
        return departments.filter(
          (d) => d.name.toLowerCase().includes(search) || d.code.toLowerCase().includes(search),
        );
      case "sector":
        return sectors.filter(
          (s) => s.name.toLowerCase().includes(search) || s.code.toLowerCase().includes(search),
        );
      case "position":
        return positions.filter(
          (p) => p.name.toLowerCase().includes(search) || p.code.toLowerCase().includes(search),
        );
      case "user":
        return users.filter(
          (u) =>
            u.email.toLowerCase().includes(search) ||
            u.displayName?.toLowerCase().includes(search),
        );
      default:
        return [];
    }
  }, [entityType, departments, sectors, positions, users, searchEntity]);

  const filteredPermissions = useMemo(() => {
    const search = searchPermission.toLowerCase();
    return permissions.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.code.toLowerCase().includes(search) ||
        p.module.toLowerCase().includes(search),
    );
  }, [permissions, searchPermission]);

  const handleExecuteBulkOperation = useCallback(async () => {
    if (selectedEntityIds.size === 0 || selectedPermissionIds.size === 0) {
      alert("Selecione pelo menos uma entidade e uma permissão");
      return;
    }

    setExecuting(true);
    setBulkOperationResult(null);

    try {
      const response = await fetch("/api/permissions/bulk-assign", {
        method: "POST",
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entityType,
          entityIds: Array.from(selectedEntityIds),
          permissionIds: Array.from(selectedPermissionIds),
          granted,
          reason: reason.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao executar operação em massa");
      }

      const result = await response.json();
      setBulkOperationResult(result);

      if (result.success > 0) {
        alert(`Operação concluída: ${result.success} sucesso(s), ${result.failed} falha(s)`);
        setSelectedEntityIds(new Set());
        setSelectedPermissionIds(new Set());
        setReason("");
      }
    } catch (error) {
      console.error("Erro ao executar operação em massa:", error);
      alert(error instanceof Error ? error.message : "Erro ao executar operação em massa");
    } finally {
      setExecuting(false);
    }
  }, [entityType, selectedEntityIds, selectedPermissionIds, granted, reason]);

  const toggleEntitySelection = useCallback((entityId: string) => {
    setSelectedEntityIds((prev) => {
      const next = new Set(prev);
      if (next.has(entityId)) {
        next.delete(entityId);
      } else {
        next.add(entityId);
      }
      return next;
    });
  }, []);

  const togglePermissionSelection = useCallback((permissionId: string) => {
    setSelectedPermissionIds((prev) => {
      const next = new Set(prev);
      if (next.has(permissionId)) {
        next.delete(permissionId);
      } else {
        next.add(permissionId);
      }
      return next;
    });
  }, []);

  const selectAllEntities = useCallback(() => {
    if (selectedEntityIds.size === availableEntities.length) {
      setSelectedEntityIds(new Set());
    } else {
      setSelectedEntityIds(new Set(availableEntities.map((e) => "userId" in e ? (e as any).userId : (e as any).id)));
    }
  }, [availableEntities, selectedEntityIds.size]);

  const selectAllPermissions = useCallback(() => {
    if (selectedPermissionIds.size === filteredPermissions.length) {
      setSelectedPermissionIds(new Set());
    } else {
      setSelectedPermissionIds(new Set(filteredPermissions.map((p) => p.id)));
    }
  }, [filteredPermissions, selectedPermissionIds.size]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-white/60">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestão de Permissões</h1>
          <p className="mt-1 text-sm text-white/60">
            Gerencie permissões em massa para múltiplas entidades
          </p>
        </div>
        <Button onClick={loadData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Seleção de Tipo de Entidade */}
        <GlassCard className="lg:col-span-1">
          <div className="mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-white/80" />
            <h2 className="text-lg font-semibold text-white">Tipo de Entidade</h2>
          </div>
          <div className="flex flex-col gap-2">
            {(
              [
                { value: "user", label: "Usuários", icon: UserCircle },
                { value: "department", label: "Departamentos", icon: Building2 },
                { value: "sector", label: "Setores", icon: Briefcase },
                { value: "position", label: "Cargos", icon: Users },
              ] as const
            ).map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => {
                  setEntityType(value);
                  setSelectedEntityIds(new Set());
                }}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-left transition-colors ${entityType === value
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/5"
                  }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Seleção de Entidades */}
        <GlassCard className="lg:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-white/80" />
              <h2 className="text-lg font-semibold text-white">
                {entityType === "user"
                  ? "Usuários"
                  : entityType === "department"
                    ? "Departamentos"
                    : entityType === "sector"
                      ? "Setores"
                      : "Cargos"}
              </h2>
            </div>
            <Button variant="ghost" size="sm" onClick={selectAllEntities}>
              {selectedEntityIds.size === availableEntities.length ? "Desselecionar" : "Selecionar Todos"}
            </Button>
          </div>
          <Input
            placeholder="Buscar..."
            value={searchEntity}
            onChange={(e) => setSearchEntity(e.target.value)}
            className="mb-4"
          />
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {availableEntities.map((entity) => {
              const id = "userId" in entity ? (entity as any).userId : (entity as any).id;
              const name =
                entityType === "user"
                  ? (entity as User).displayName || (entity as User).email
                  : (entity as Department | Sector | Position).name;
              const selected = selectedEntityIds.has(id);

              return (
                <button
                  key={id}
                  onClick={() => toggleEntitySelection(id)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors ${selected ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5"
                    }`}
                >
                  <span className="truncate text-sm">{name}</span>
                  {selected ? (
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-white/30" />
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-2 text-xs text-white/50">
            {selectedEntityIds.size} de {availableEntities.length} selecionados
          </div>
        </GlassCard>

        {/* Seleção de Permissões */}
        <GlassCard className="lg:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-white/80" />
              <h2 className="text-lg font-semibold text-white">Permissões</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={selectAllPermissions}>
              {selectedPermissionIds.size === filteredPermissions.length
                ? "Desselecionar"
                : "Selecionar Todos"}
            </Button>
          </div>
          <Input
            placeholder="Buscar permissão..."
            value={searchPermission}
            onChange={(e) => setSearchPermission(e.target.value)}
            className="mb-4"
          />
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {filteredPermissions.map((permission) => {
              const selected = selectedPermissionIds.has(permission.id);
              return (
                <button
                  key={permission.id}
                  onClick={() => togglePermissionSelection(permission.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors ${selected ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5"
                    }`}
                >
                  <div className="flex flex-col">
                    <span className="truncate text-sm font-medium">{permission.name}</span>
                    <span className="text-xs text-white/50">{permission.code}</span>
                  </div>
                  {selected ? (
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-white/30" />
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-2 text-xs text-white/50">
            {selectedPermissionIds.size} de {filteredPermissions.length} selecionados
          </div>
        </GlassCard>
      </div>

      {/* Ação e Configurações */}
      <GlassCard>
        <div className="mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-white/80" />
          <h2 className="text-lg font-semibold text-white">Ação</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-white">
              <input
                type="radio"
                checked={granted}
                onChange={() => setGranted(true)}
                className="h-4 w-4"
              />
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              Conceder
            </label>
            <label className="flex items-center gap-2 text-white">
              <input
                type="radio"
                checked={!granted}
                onChange={() => setGranted(false)}
                className="h-4 w-4"
              />
              <XCircle className="h-4 w-4 text-red-400" />
              Negar
            </label>
          </div>
          <div>
            <label className="mb-2 block text-sm text-white/80">Motivo (opcional)</label>
            <Input
              placeholder="Informe o motivo da mudança..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <Button
            onClick={handleExecuteBulkOperation}
            disabled={executing || selectedEntityIds.size === 0 || selectedPermissionIds.size === 0}
            className="w-full"
          >
            {executing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Executando...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Executar Operação em Massa
              </>
            )}
          </Button>
        </div>
      </GlassCard>

      {/* Resultado da Operação */}
      {bulkOperationResult && (
        <GlassCard>
          <div className="mb-4 flex items-center gap-2">
            <Filter className="h-5 w-5 text-white/80" />
            <h2 className="text-lg font-semibold text-white">Resultado da Operação</h2>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/70">Total:</span>
              <span className="font-semibold text-white">{bulkOperationResult.total}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-400">Sucesso:</span>
              <span className="font-semibold text-green-400">
                {bulkOperationResult.success}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-red-400">Falhas:</span>
              <span className="font-semibold text-red-400">{bulkOperationResult.failed}</span>
            </div>
            {bulkOperationResult.failed > 0 && (
              <div className="mt-4 max-h-48 space-y-1 overflow-y-auto">
                {bulkOperationResult.results
                  .filter((r) => !r.success)
                  .map((r, idx) => (
                    <div key={idx} className="rounded bg-red-500/10 p-2 text-xs text-red-400">
                      {r.entityId} / {r.permissionId}: {r.error}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

