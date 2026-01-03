"use client";

import { Button, GlassCard, Label, cn } from "@morina/ui";
import {
  Building2,
  Calendar,
  ChevronRight,
  Download,
  Plus,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { getAuthHeadersWithTenant } from "@/lib/auth-client";
import { notificationCenter } from "@/components/notifications/notification-center";

type UserOrganizationTabProps = {
  userId: string;
  onUserUpdated: () => void;
};

type DepartmentMembership = {
  membershipId: string;
  departmentId: string;
  departmentName: string;
  role: string;
  createdAt: string;
};

type SectorMembership = {
  membershipId: string;
  sectorId: string;
  sectorName: string;
  departmentName: string;
  role: string;
  createdAt: string;
};

type PositionMembership = {
  membershipId: string;
  positionId: string;
  positionName: string;
  sectorName: string;
  role: string;
  createdAt: string;
};

type OrganizationMembership = {
  membershipId: string;
  orgId: string;
  orgName: string;
  role: string;
  status: string;
  createdAt: string;
};

type Movement = {
  id: string;
  type: "department" | "sector" | "position" | "organization";
  action: "added" | "removed" | "role_changed";
  entityName: string;
  oldValue?: string;
  newValue?: string;
  performedBy: string;
  performedAt: string;
};

const ROLE_OPTIONS = [
  { value: "owner", label: "Proprietário(a)" },
  { value: "admin", label: "Administrador(a)" },
  { value: "manager", label: "Gestor(a)" },
  { value: "member", label: "Colaborador(a)" },
  { value: "viewer", label: "Visitante" },
] as const;

export function UserOrganizationTab({ userId, onUserUpdated }: UserOrganizationTabProps) {
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<DepartmentMembership[]>([]);
  const [sectors, setSectors] = useState<SectorMembership[]>([]);
  const [positions, setPositions] = useState<PositionMembership[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationMembership[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [addDepartmentOpen, setAddDepartmentOpen] = useState(false);
  const [addSectorOpen, setAddSectorOpen] = useState(false);
  const [addPositionOpen, setAddPositionOpen] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedSectorId, setSelectedSectorId] = useState("");
  const [selectedPositionId, setSelectedPositionId] = useState("");
  const [selectedRole, setSelectedRole] = useState<(typeof ROLE_OPTIONS)[number]["value"]>("member");
  const [movementFilter, setMovementFilter] = useState<"all" | "department" | "sector" | "position" | "organization">("all");

  useEffect(() => {
    void loadData();
    // biome-ignore lint/correctness/useExhaustiveDependencies: loadData depende de userId
  }, [userId]);

  const filteredMovements = useMemo(() => {
    if (movementFilter === "all") return movements;
    return movements.filter((m) => m.type === movementFilter);
  }, [movements, movementFilter]);

  const handleExportMovements = () => {
    try {
      if (filteredMovements.length === 0) {
        notificationCenter.add({
          type: "warning",
          title: "Nenhum dado para exportar",
          message: "Não há movimentações para exportar com os filtros aplicados.",
        });
        return;
      }

      const exportData = filteredMovements.map((movement) => {
        const actionLabels: Record<Movement["action"], string> = {
          added: "Adicionado",
          removed: "Removido",
          role_changed: "Role Alterado",
        };

        const typeLabels: Record<Movement["type"], string> = {
          department: "Departamento",
          sector: "Setor",
          position: "Cargo",
          organization: "Organização",
        };

        return {
          Tipo: typeLabels[movement.type],
          Ação: actionLabels[movement.action],
          Entidade: movement.entityName,
          "Valor Anterior": movement.oldValue || "",
          "Valor Novo": movement.newValue || "",
          "Realizado Por": movement.performedBy,
          "Data": new Date(movement.performedAt).toLocaleString("pt-BR"),
        };
      });

      const headers = Object.keys(exportData[0] || {});
      const csvRows = [
        headers.join(","),
        ...exportData.map((row) =>
          headers
            .map((header) => {
              const value = row[header as keyof typeof row];
              if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
              }
              return value;
            })
            .join(","),
        ),
      ];

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `movimentacoes_usuario_${userId}_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      notificationCenter.add({
        type: "success",
        title: "Exportação concluída",
        message: `${filteredMovements.length} movimentação(ões) exportada(s) com sucesso.`,
      });
    } catch (error) {
      console.error("Erro ao exportar movimentações:", error);
      notificationCenter.add({
        type: "error",
        title: "Erro na exportação",
        message: "Não foi possível exportar as movimentações.",
      });
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };

      // Carregar membros de departamentos, setores, cargos e organizações
      // TODO: Implementar endpoints específicos quando disponíveis
      // Por enquanto, usar endpoints genéricos
      const [deptRes, sectorRes, posRes, orgRes, movRes] = await Promise.all([
        fetch(`/api/departments?userId=${userId}`, { headers }),
        fetch(`/api/sectors?userId=${userId}`, { headers }),
        fetch(`/api/positions?userId=${userId}`, { headers }),
        fetch(`/api/organizations?userId=${userId}`, { headers }),
        fetch(`/api/users/${userId}/movements`, { headers }),
      ]);

      if (deptRes.ok) {
        const data = await deptRes.json();
        setDepartments(data.itens || []);
      }
      if (sectorRes.ok) {
        const data = await sectorRes.json();
        setSectors(data.itens || []);
      }
      if (posRes.ok) {
        const data = await posRes.json();
        setPositions(data.itens || []);
      }
      if (orgRes.ok) {
        const data = await orgRes.json();
        setOrganizations(data.itens || []);
      }
      if (movRes.ok) {
        const data = await movRes.json();
        setMovements(data.itens || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = async () => {
    if (!selectedDepartmentId || !selectedRole) return;

    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };

      const response = await fetch(`/api/departments/${selectedDepartmentId}/members`, {
        method: "POST",
        headers,
        body: JSON.stringify({ userId, role: selectedRole }),
      });

      if (response.ok) {
        notificationCenter.add({
          type: "success",
          title: "Sucesso",
          message: "Usuário adicionado ao departamento.",
        });
        setAddDepartmentOpen(false);
        setSelectedDepartmentId("");
        void loadData();
        onUserUpdated();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveDepartment = async (membershipId: string) => {
    if (!confirm("Tem certeza que deseja remover este usuário do departamento?")) return;

    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };

      const response = await fetch(`/api/departments/members/${membershipId}`, {
        method: "DELETE",
        headers,
      });

      if (response.ok) {
        notificationCenter.add({
          type: "success",
          title: "Sucesso",
          message: "Usuário removido do departamento.",
        });
        void loadData();
        onUserUpdated();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddSector = async () => {
    if (!selectedSectorId || !selectedRole) return;

    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };

      const response = await fetch(`/api/sectors/${selectedSectorId}/members`, {
        method: "POST",
        headers,
        body: JSON.stringify({ userId, role: selectedRole }),
      });

      if (response.ok) {
        notificationCenter.add({
          type: "success",
          title: "Sucesso",
          message: "Usuário adicionado ao setor.",
        });
        setAddSectorOpen(false);
        setSelectedSectorId("");
        void loadData();
        onUserUpdated();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveSector = async (membershipId: string) => {
    if (!confirm("Tem certeza que deseja remover este usuário do setor?")) return;

    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };

      const response = await fetch(`/api/sectors/members/${membershipId}`, {
        method: "DELETE",
        headers,
      });

      if (response.ok) {
        notificationCenter.add({
          type: "success",
          title: "Sucesso",
          message: "Usuário removido do setor.",
        });
        void loadData();
        onUserUpdated();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddPosition = async () => {
    if (!selectedPositionId || !selectedRole) return;

    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };

      const response = await fetch(`/api/positions/${selectedPositionId}/members`, {
        method: "POST",
        headers,
        body: JSON.stringify({ userId, role: selectedRole }),
      });

      if (response.ok) {
        notificationCenter.add({
          type: "success",
          title: "Sucesso",
          message: "Usuário adicionado ao cargo.",
        });
        setAddPositionOpen(false);
        setSelectedPositionId("");
        void loadData();
        onUserUpdated();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemovePosition = async (membershipId: string) => {
    if (!confirm("Tem certeza que deseja remover este usuário do cargo?")) return;

    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };

      const response = await fetch(`/api/positions/members/${membershipId}`, {
        method: "DELETE",
        headers,
      });

      if (response.ok) {
        notificationCenter.add({
          type: "success",
          title: "Sucesso",
          message: "Usuário removido do cargo.",
        });
        void loadData();
        onUserUpdated();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Departamentos */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h5 className="text-sm font-semibold uppercase tracking-wider text-white/70">
            Membros de Departamentos
          </h5>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAddDepartmentOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-white/50">Carregando...</p>
        ) : departments.length === 0 ? (
          <p className="text-sm text-white/50">Nenhum departamento vinculado</p>
        ) : (
          <div className="space-y-2">
            {departments.map((dept) => (
              <div
                key={dept.membershipId}
                className="flex items-center justify-between border border-white/10 bg-white/5 p-3"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-[hsl(var(--primary))]" />
                  <div>
                    <p className="text-sm font-medium text-white">{dept.departmentName}</p>
                    <p className="text-xs text-white/50">
                      {ROLE_OPTIONS.find((r) => r.value === dept.role)?.label || dept.role}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/40">
                    {new Date(dept.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDepartment(dept.membershipId)}
                    className="flex h-8 w-8 items-center justify-center border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {addDepartmentOpen && (
          <GlassCard className="mt-4 p-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="add-dept-select">Departamento</Label>
                <select
                  id="add-dept-select"
                  value={selectedDepartmentId}
                  onChange={(e) => setSelectedDepartmentId(e.target.value)}
                  className="mt-1 flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
                >
                  <option value="">Selecione um departamento</option>
                  {/* TODO: Carregar lista de departamentos */}
                </select>
              </div>
              <div>
                <Label htmlFor="add-dept-role">Role</Label>
                <select
                  id="add-dept-role"
                  value={selectedRole}
                  onChange={(e) =>
                    setSelectedRole(e.target.value as (typeof ROLE_OPTIONS)[number]["value"])
                  }
                  className="mt-1 flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setAddDepartmentOpen(false);
                    setSelectedDepartmentId("");
                  }}
                >
                  Cancelar
                </Button>
                <Button type="button" onClick={handleAddDepartment}>
                  Adicionar
                </Button>
              </div>
            </div>
          </GlassCard>
        )}
      </div>

      {/* Setores */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h5 className="text-sm font-semibold uppercase tracking-wider text-white/70">
            Membros de Setores
          </h5>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAddSectorOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar
          </Button>
        </div>

        {sectors.length === 0 ? (
          <p className="text-sm text-white/50">Nenhum setor vinculado</p>
        ) : (
          <div className="space-y-2">
            {sectors.map((sector) => (
              <div
                key={sector.membershipId}
                className="flex items-center justify-between border border-white/10 bg-white/5 p-3"
              >
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-[hsl(var(--primary))]" />
                  <div>
                    <p className="text-sm font-medium text-white">{sector.sectorName}</p>
                    <p className="text-xs text-white/50">
                      {sector.departmentName} •{" "}
                      {ROLE_OPTIONS.find((r) => r.value === sector.role)?.label || sector.role}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/40">
                    {new Date(sector.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSector(sector.membershipId)}
                    className="flex h-8 w-8 items-center justify-center border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {addSectorOpen && (
          <GlassCard className="mt-4 p-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="add-sector-select">Setor</Label>
                <select
                  id="add-sector-select"
                  value={selectedSectorId}
                  onChange={(e) => setSelectedSectorId(e.target.value)}
                  className="mt-1 flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
                >
                  <option value="">Selecione um setor</option>
                  {/* TODO: Carregar lista de setores */}
                </select>
              </div>
              <div>
                <Label htmlFor="add-sector-role">Role</Label>
                <select
                  id="add-sector-role"
                  value={selectedRole}
                  onChange={(e) =>
                    setSelectedRole(e.target.value as (typeof ROLE_OPTIONS)[number]["value"])
                  }
                  className="mt-1 flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setAddSectorOpen(false);
                    setSelectedSectorId("");
                  }}
                >
                  Cancelar
                </Button>
                <Button type="button" onClick={handleAddSector}>
                  Adicionar
                </Button>
              </div>
            </div>
          </GlassCard>
        )}
      </div>

      {/* Cargos */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h5 className="text-sm font-semibold uppercase tracking-wider text-white/70">
            Membros de Cargos
          </h5>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAddPositionOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar
          </Button>
        </div>

        {positions.length === 0 ? (
          <p className="text-sm text-white/50">Nenhum cargo vinculado</p>
        ) : (
          <div className="space-y-2">
            {positions.map((pos) => (
              <div
                key={pos.membershipId}
                className="flex items-center justify-between border border-white/10 bg-white/5 p-3"
              >
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-[hsl(var(--primary))]" />
                  <div>
                    <p className="text-sm font-medium text-white">{pos.positionName}</p>
                    <p className="text-xs text-white/50">
                      {pos.sectorName} •{" "}
                      {ROLE_OPTIONS.find((r) => r.value === pos.role)?.label || pos.role}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/40">
                    {new Date(pos.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemovePosition(pos.membershipId)}
                    className="flex h-8 w-8 items-center justify-center border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {addPositionOpen && (
          <GlassCard className="mt-4 p-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="add-position-select">Cargo</Label>
                <select
                  id="add-position-select"
                  value={selectedPositionId}
                  onChange={(e) => setSelectedPositionId(e.target.value)}
                  className="mt-1 flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
                >
                  <option value="">Selecione um cargo</option>
                  {/* TODO: Carregar lista de cargos */}
                </select>
              </div>
              <div>
                <Label htmlFor="add-position-role">Role</Label>
                <select
                  id="add-position-role"
                  value={selectedRole}
                  onChange={(e) =>
                    setSelectedRole(e.target.value as (typeof ROLE_OPTIONS)[number]["value"])
                  }
                  className="mt-1 flex h-10 w-full border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setAddPositionOpen(false);
                    setSelectedPositionId("");
                  }}
                >
                  Cancelar
                </Button>
                <Button type="button" onClick={handleAddPosition}>
                  Adicionar
                </Button>
              </div>
            </div>
          </GlassCard>
        )}
      </div>

      {/* Organizações */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h5 className="text-sm font-semibold uppercase tracking-wider text-white/70">
            Organizações
          </h5>
        </div>

        {organizations.length === 0 ? (
          <p className="text-sm text-white/50">Nenhuma organização vinculada</p>
        ) : (
          <div className="space-y-2">
            {organizations.map((org) => (
              <div
                key={org.membershipId}
                className="flex items-center justify-between border border-white/10 bg-white/5 p-3"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-[hsl(var(--primary))]" />
                  <div>
                    <p className="text-sm font-medium text-white">{org.orgName}</p>
                    <p className="text-xs text-white/50">
                      {ROLE_OPTIONS.find((r) => r.value === org.role)?.label || org.role} •{" "}
                      {org.status}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-white/40">
                  {new Date(org.createdAt).toLocaleDateString("pt-BR")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Timeline de Movimentações */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h5 className="text-sm font-semibold uppercase tracking-wider text-white/70">
            Timeline de Movimentações
          </h5>
          <div className="flex items-center gap-2">
            <select
              value={movementFilter}
              onChange={(e) =>
                setMovementFilter(
                  e.target.value as "all" | "department" | "sector" | "position" | "organization",
                )
              }
              className="flex h-9 border border-white/10 bg-white/5 px-3 text-xs text-white focus:border-[hsl(var(--primary))] focus:outline-none"
            >
              <option value="all">Todos os tipos</option>
              <option value="department">Departamentos</option>
              <option value="sector">Setores</option>
              <option value="position">Cargos</option>
              <option value="organization">Organizações</option>
            </select>
            <Button type="button" variant="outline" size="sm" onClick={handleExportMovements}>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        {filteredMovements.length === 0 ? (
          <p className="text-sm text-white/50">
            {movements.length === 0
              ? "Nenhuma movimentação registrada"
              : "Nenhuma movimentação encontrada com os filtros aplicados"}
          </p>
        ) : (
          <div className="space-y-3">
            {filteredMovements.map((mov) => (
              <div
                key={mov.id}
                className="flex gap-4 border-l-2 border-white/10 pl-4 py-2 hover:bg-white/5 transition-colors"
              >
                <Calendar className="h-5 w-5 shrink-0 text-white/40 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-white">
                    {mov.action === "added" && "Adicionado"}
                    {mov.action === "removed" && "Removido"}
                    {mov.action === "role_changed" && "Role alterado"} em{" "}
                    {mov.type === "department" && "Departamento"}
                    {mov.type === "sector" && "Setor"}
                    {mov.type === "position" && "Cargo"}
                    {mov.type === "organization" && "Organização"}: <strong>{mov.entityName}</strong>
                  </p>
                  {mov.oldValue && mov.newValue && (
                    <p className="text-xs text-white/50 mt-1">
                      {mov.oldValue} → {mov.newValue}
                    </p>
                  )}
                  <p className="text-xs text-white/40 mt-1">
                    Por {mov.performedBy} em {new Date(mov.performedAt).toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}




