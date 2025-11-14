"use client";

import React, { useState, useEffect } from "react";
import { Button, GlassCard, Input, Label, FormSelect, cn } from "@morina/ui";
import {
  Building2,
  Users,
  UserCircle,
  Plus,
  Search,
  Edit,
  Trash2,
  UserPlus,
  Network,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { getAuthHeadersWithTenant } from "@/lib/auth-client";
import { MembersManager } from "@/components/organizational-structure/members-manager";
import { notificationCenter } from "@/components/notifications/notification-center";

type OrganizationalUnit = {
  unitId: string;
  orgId: string;
  name: string;
  code: string;
  description: string | null;
  parentId: string | null;
  status: "ativo" | "inativo" | "arquivado";
  ordem: number;
  createdAt: string;
  updatedAt: string;
};

type Department = {
  departmentId: string;
  orgId: string;
  unitId: string | null;
  name: string;
  code: string;
  description: string | null;
  parentId: string | null;
  status: "ativo" | "inativo" | "arquivado";
  ordem: number;
  createdAt: string;
  updatedAt: string;
};

type Team = {
  teamId: string;
  orgId: string;
  departmentId: string | null;
  name: string;
  code: string;
  description: string | null;
  status: "ativo" | "inativo" | "arquivado";
  ordem: number;
  createdAt: string;
  updatedAt: string;
};

type UnitsResponse = {
  itens: OrganizationalUnit[];
  proximoCursor?: string | null;
};

type DepartmentsResponse = {
  itens: Department[];
  proximoCursor?: string | null;
};

type TeamsResponse = {
  itens: Team[];
  proximoCursor?: string | null;
};

type Tab = "units" | "departments" | "teams";

export function OrganizationalStructureClient() {
  const [activeTab, setActiveTab] = useState<Tab>("units");
  const [units, setUnits] = useState<OrganizationalUnit[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState<OrganizationalUnit | null>(null);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [managingMembers, setManagingMembers] = useState<{
    type: "unit" | "department" | "team";
    id: string;
    name: string;
  } | null>(null);

  const [unitFormData, setUnitFormData] = useState({
    name: "",
    code: "",
    description: "",
    parentId: "",
    status: "ativo" as "ativo" | "inativo" | "arquivado",
    ordem: 0,
  });

  const [departmentFormData, setDepartmentFormData] = useState({
    name: "",
    code: "",
    description: "",
    unitId: "",
    parentId: "",
    status: "ativo" as "ativo" | "inativo" | "arquivado",
    ordem: 0,
  });

  const [teamFormData, setTeamFormData] = useState({
    name: "",
    code: "",
    description: "",
    departmentId: "",
    status: "ativo" as "ativo" | "inativo" | "arquivado",
    ordem: 0,
  });

  // Carregar dados quando a aba mudar
  useEffect(() => {
    setShowForm(false);
    setEditingUnit(null);
    setEditingDepartment(null);
    setEditingTeam(null);
    setManagingMembers(null);
    if (activeTab === "hierarchy") {
      // Para a visualização hierárquica, precisamos carregar tudo
      loadAllData();
    } else {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Carregar dados quando a busca mudar (debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function loadAllData() {
    setLoading(true);
    try {
      await Promise.all([loadUnits(), loadDepartments(), loadTeams()]);
    } finally {
      setLoading(false);
    }
  }

  async function loadData() {
    setLoading(true);
    try {
      if (activeTab === "units") {
        await loadUnits();
      } else if (activeTab === "departments") {
        await loadDepartments();
        await loadUnits(); // Precisa das unidades para o select
      } else if (activeTab === "teams") {
        await loadTeams();
        await loadDepartments(); // Precisa dos departamentos para o select
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadUnits() {
    try {
      const params = new URLSearchParams();
      if (search.length >= 2) {
        params.append("busca", search);
      }

      const response = await fetch(`/api/organizational-units?${params.toString()}`, {
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: UnitsResponse = await response.json();
        setUnits(data.itens || []);
      }
    } catch (error) {
      console.error("Erro ao carregar unidades:", error);
    }
  }

  async function loadDepartments() {
    try {
      const params = new URLSearchParams();
      if (search.length >= 2) {
        params.append("busca", search);
      }

      const response = await fetch(`/api/departments?${params.toString()}`, {
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: DepartmentsResponse = await response.json();
        setDepartments(data.itens || []);
      }
    } catch (error) {
      console.error("Erro ao carregar departamentos:", error);
    }
  }

  async function loadTeams() {
    try {
      const params = new URLSearchParams();
      if (search.length >= 2) {
        params.append("busca", search);
      }

      const response = await fetch(`/api/teams?${params.toString()}`, {
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: TeamsResponse = await response.json();
        setTeams(data.itens || []);
      }
    } catch (error) {
      console.error("Erro ao carregar times:", error);
    }
  }

  async function handleUnitSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const url = editingUnit
        ? `/api/organizational-units/${editingUnit.unitId}`
        : "/api/organizational-units";
      const method = editingUnit ? "PUT" : "POST";

      const body = {
        ...unitFormData,
        parentId: unitFormData.parentId || null,
        description: unitFormData.description || null,
      };

      const response = await fetch(url, {
        method,
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        notificationCenter.add({
          type: "success",
          title: editingUnit ? "Unidade atualizada" : "Unidade criada",
          message: `${unitFormData.name} foi ${editingUnit ? "atualizada" : "criada"} com sucesso`,
        });
        setShowForm(false);
        setEditingUnit(null);
        resetUnitForm();
        await loadUnits();
      } else {
        const error = await response.json();
        const errorMessage = error.message || "Erro ao salvar unidade";
        notificationCenter.add({
          type: "error",
          title: "Erro ao salvar unidade",
          message: errorMessage,
        });
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Erro ao salvar unidade:", error);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Erro ao salvar unidade. Tente novamente.",
      });
      alert("Erro ao salvar unidade");
    }
  }

  async function handleDepartmentSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const url = editingDepartment
        ? `/api/departments/${editingDepartment.departmentId}`
        : "/api/departments";
      const method = editingDepartment ? "PUT" : "POST";

      const body = {
        ...departmentFormData,
        unitId: departmentFormData.unitId || null,
        parentId: departmentFormData.parentId || null,
        description: departmentFormData.description || null,
      };

      const response = await fetch(url, {
        method,
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        notificationCenter.add({
          type: "success",
          title: editingDepartment ? "Departamento atualizado" : "Departamento criado",
          message: `${departmentFormData.name} foi ${editingDepartment ? "atualizado" : "criado"} com sucesso`,
        });
        setShowForm(false);
        setEditingDepartment(null);
        resetDepartmentForm();
        await loadDepartments();
      } else {
        const error = await response.json();
        const errorMessage = error.message || "Erro ao salvar departamento";
        notificationCenter.add({
          type: "error",
          title: "Erro ao salvar departamento",
          message: errorMessage,
        });
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Erro ao salvar departamento:", error);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Erro ao salvar departamento. Tente novamente.",
      });
      alert("Erro ao salvar departamento");
    }
  }

  async function handleTeamSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const url = editingTeam
        ? `/api/teams/${editingTeam.teamId}`
        : "/api/teams";
      const method = editingTeam ? "PUT" : "POST";

      const body = {
        ...teamFormData,
        departmentId: teamFormData.departmentId || null,
        description: teamFormData.description || null,
      };

      const response = await fetch(url, {
        method,
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        notificationCenter.add({
          type: "success",
          title: editingTeam ? "Time atualizado" : "Time criado",
          message: `${teamFormData.name} foi ${editingTeam ? "atualizado" : "criado"} com sucesso`,
        });
        setShowForm(false);
        setEditingTeam(null);
        resetTeamForm();
        await loadTeams();
      } else {
        const error = await response.json();
        const errorMessage = error.message || "Erro ao salvar time";
        notificationCenter.add({
          type: "error",
          title: "Erro ao salvar time",
          message: errorMessage,
        });
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Erro ao salvar time:", error);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Erro ao salvar time. Tente novamente.",
      });
      alert("Erro ao salvar time");
    }
  }

  async function handleDeleteUnit(unitId: string) {
    const unit = units.find((u) => u.unitId === unitId);
    const unitName = unit?.name || "esta unidade";

    if (
      !confirm(
        `Tem certeza que deseja deletar ${unitName}? Esta ação não pode ser desfeita. Se a unidade tiver unidades filhas, departamentos ou membros associados, a operação será cancelada.`,
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/organizational-units/${unitId}`, {
        method: "DELETE",
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        notificationCenter.add({
          type: "success",
          title: "Unidade deletada",
          message: `${unitName} foi deletada com sucesso`,
        });
        await loadUnits();
      } else {
        const error = await response.json();
        const errorMessage = error.message || "Erro ao deletar unidade";
        notificationCenter.add({
          type: "error",
          title: "Erro ao deletar unidade",
          message: errorMessage,
        });
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Erro ao deletar unidade:", error);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Erro ao deletar unidade. Tente novamente.",
      });
      alert("Erro ao deletar unidade");
    }
  }

  async function handleDeleteDepartment(departmentId: string) {
    const department = departments.find((d) => d.departmentId === departmentId);
    const departmentName = department?.name || "este departamento";

    if (
      !confirm(
        `Tem certeza que deseja deletar ${departmentName}? Esta ação não pode ser desfeita. Se o departamento tiver departamentos filhos, times ou membros associados, a operação será cancelada.`,
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/departments/${departmentId}`, {
        method: "DELETE",
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        notificationCenter.add({
          type: "success",
          title: "Departamento deletado",
          message: `${departmentName} foi deletado com sucesso`,
        });
        await loadDepartments();
      } else {
        const error = await response.json();
        const errorMessage = error.message || "Erro ao deletar departamento";
        notificationCenter.add({
          type: "error",
          title: "Erro ao deletar departamento",
          message: errorMessage,
        });
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Erro ao deletar departamento:", error);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Erro ao deletar departamento. Tente novamente.",
      });
      alert("Erro ao deletar departamento");
    }
  }

  async function handleDeleteTeam(teamId: string) {
    const team = teams.find((t) => t.teamId === teamId);
    const teamName = team?.name || "este time";

    if (
      !confirm(
        `Tem certeza que deseja deletar ${teamName}? Esta ação não pode ser desfeita. Se o time tiver membros associados, a operação será cancelada.`,
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: "DELETE",
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        notificationCenter.add({
          type: "success",
          title: "Time deletado",
          message: `${teamName} foi deletado com sucesso`,
        });
        await loadTeams();
      } else {
        const error = await response.json();
        const errorMessage = error.message || "Erro ao deletar time";
        notificationCenter.add({
          type: "error",
          title: "Erro ao deletar time",
          message: errorMessage,
        });
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Erro ao deletar time:", error);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Erro ao deletar time. Tente novamente.",
      });
      alert("Erro ao deletar time");
    }
  }

  function resetUnitForm() {
    setUnitFormData({
      name: "",
      code: "",
      description: "",
      parentId: "",
      status: "ativo",
      ordem: 0,
    });
  }

  function resetDepartmentForm() {
    setDepartmentFormData({
      name: "",
      code: "",
      description: "",
      unitId: "",
      parentId: "",
      status: "ativo",
      ordem: 0,
    });
  }

  function resetTeamForm() {
    setTeamFormData({
      name: "",
      code: "",
      description: "",
      departmentId: "",
      status: "ativo",
      ordem: 0,
    });
  }

  function handleEditUnit(unit: OrganizationalUnit) {
    setEditingUnit(unit);
    setUnitFormData({
      name: unit.name,
      code: unit.code,
      description: unit.description || "",
      parentId: unit.parentId || "",
      status: unit.status,
      ordem: unit.ordem,
    });
    setShowForm(true);
  }

  function handleEditDepartment(department: Department) {
    setEditingDepartment(department);
    setDepartmentFormData({
      name: department.name,
      code: department.code,
      description: department.description || "",
      unitId: department.unitId || "",
      parentId: department.parentId || "",
      status: department.status,
      ordem: department.ordem,
    });
    setShowForm(true);
  }

  function handleEditTeam(team: Team) {
    setEditingTeam(team);
    setTeamFormData({
      name: team.name,
      code: team.code,
      description: team.description || "",
      departmentId: team.departmentId || "",
      status: team.status,
      ordem: team.ordem,
    });
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingUnit(null);
    setEditingDepartment(null);
    setEditingTeam(null);
    resetUnitForm();
    resetDepartmentForm();
    resetTeamForm();
  }

  // Renderizar conteúdo baseado na aba ativa
  function renderContent() {
    if (activeTab === "units") {
      return (
        <>
          {showForm && (
            <GlassCard className="p-6">
              <h2 className="mb-4 text-lg font-semibold">
                {editingUnit ? "Editar Unidade" : "Nova Unidade"}
              </h2>
              <form onSubmit={handleUnitSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="unit-name">Nome</Label>
                    <Input
                      id="unit-name"
                      value={unitFormData.name}
                      onChange={(e) =>
                        setUnitFormData({ ...unitFormData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="unit-code">Código</Label>
                    <Input
                      id="unit-code"
                      value={unitFormData.code}
                      onChange={(e) =>
                        setUnitFormData({ ...unitFormData, code: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <Label htmlFor="unit-description">Descrição</Label>
                    <Input
                      id="unit-description"
                      value={unitFormData.description}
                      onChange={(e) =>
                        setUnitFormData({ ...unitFormData, description: e.target.value })
                      }
                    />
                  </div>
                  <FormSelect
                    label="Unidade Pai"
                    id="unit-parentId"
                    value={unitFormData.parentId}
                    onChange={(e) =>
                      setUnitFormData({ ...unitFormData, parentId: e.target.value })
                    }
                  >
                    <option value="">Nenhuma</option>
                    {units
                      .filter((u) => u.unitId !== editingUnit?.unitId)
                      .map((u) => (
                        <option key={u.unitId} value={u.unitId}>
                          {u.name}
                        </option>
                      ))}
                  </FormSelect>
                  <FormSelect
                    label="Status"
                    id="unit-status"
                    value={unitFormData.status}
                    onChange={(e) =>
                      setUnitFormData({
                        ...unitFormData,
                        status: e.target.value as "ativo" | "inativo" | "arquivado",
                      })
                    }
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                    <option value="arquivado">Arquivado</option>
                  </FormSelect>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Salvar</Button>
                  <Button type="button" variant="secondary" onClick={handleCancel}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </GlassCard>
          )}

          {!showForm && (
            <div className="grid gap-4">
              {units.length === 0 ? (
                <GlassCard className="p-8 text-center">
                  <p className="text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                    Nenhuma unidade organizacional encontrada.
                  </p>
                </GlassCard>
              ) : (
                units.map((unit) => (
                  <GlassCard key={unit.unitId} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Building2 className="h-5 w-5 text-[var(--primary)]" />
                          <div>
                            <h3 className="font-semibold">{unit.name}</h3>
                            <p className="text-sm text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                              {unit.code}
                            </p>
                            {unit.description && (
                              <p className="mt-1 text-sm text-[color-mix(in oklab,var(--muted-soft) 80%,var(--fg) 20%)]">
                                {unit.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "rounded-full px-2 py-1 text-xs font-semibold",
                            unit.status === "ativo"
                              ? "bg-green-500/20 text-green-500"
                              : unit.status === "inativo"
                                ? "bg-yellow-500/20 text-yellow-500"
                                : "bg-gray-500/20 text-gray-500",
                          )}
                        >
                          {unit.status}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setManagingMembers({
                              type: "unit",
                              id: unit.unitId,
                              name: unit.name,
                            })
                          }
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUnit(unit)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUnit(unit.unitId)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </GlassCard>
                ))
              )}
            </div>
          )}
        </>
      );
    }

    if (activeTab === "departments") {
      return (
        <>
          {showForm && (
            <GlassCard className="p-6">
              <h2 className="mb-4 text-lg font-semibold">
                {editingDepartment ? "Editar Departamento" : "Novo Departamento"}
              </h2>
              <form onSubmit={handleDepartmentSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="dept-name">Nome</Label>
                    <Input
                      id="dept-name"
                      value={departmentFormData.name}
                      onChange={(e) =>
                        setDepartmentFormData({ ...departmentFormData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="dept-code">Código</Label>
                    <Input
                      id="dept-code"
                      value={departmentFormData.code}
                      onChange={(e) =>
                        setDepartmentFormData({ ...departmentFormData, code: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <Label htmlFor="dept-description">Descrição</Label>
                    <Input
                      id="dept-description"
                      value={departmentFormData.description}
                      onChange={(e) =>
                        setDepartmentFormData({ ...departmentFormData, description: e.target.value })
                      }
                    />
                  </div>
                  <FormSelect
                    label="Unidade"
                    id="dept-unitId"
                    value={departmentFormData.unitId}
                    onChange={(e) =>
                      setDepartmentFormData({ ...departmentFormData, unitId: e.target.value })
                    }
                  >
                    <option value="">Nenhuma</option>
                    {units.map((u) => (
                      <option key={u.unitId} value={u.unitId}>
                        {u.name}
                      </option>
                    ))}
                  </FormSelect>
                  <FormSelect
                    label="Departamento Pai"
                    id="dept-parentId"
                    value={departmentFormData.parentId}
                    onChange={(e) =>
                      setDepartmentFormData({ ...departmentFormData, parentId: e.target.value })
                    }
                  >
                    <option value="">Nenhum</option>
                    {departments
                      .filter((d) => d.departmentId !== editingDepartment?.departmentId)
                      .map((d) => (
                        <option key={d.departmentId} value={d.departmentId}>
                          {d.name}
                        </option>
                      ))}
                  </FormSelect>
                  <FormSelect
                    label="Status"
                    id="dept-status"
                    value={departmentFormData.status}
                    onChange={(e) =>
                      setDepartmentFormData({
                        ...departmentFormData,
                        status: e.target.value as "ativo" | "inativo" | "arquivado",
                      })
                    }
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                    <option value="arquivado">Arquivado</option>
                  </FormSelect>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Salvar</Button>
                  <Button type="button" variant="secondary" onClick={handleCancel}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </GlassCard>
          )}

          {!showForm && (
            <div className="grid gap-4">
              {departments.length === 0 ? (
                <GlassCard className="p-8 text-center">
                  <p className="text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                    Nenhum departamento encontrado.
                  </p>
                </GlassCard>
              ) : (
                departments.map((department) => (
                  <GlassCard key={department.departmentId} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-[var(--primary)]" />
                          <div>
                            <h3 className="font-semibold">{department.name}</h3>
                            <p className="text-sm text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                              {department.code}
                            </p>
                            {department.description && (
                              <p className="mt-1 text-sm text-[color-mix(in oklab,var(--muted-soft) 80%,var(--fg) 20%)]">
                                {department.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "rounded-full px-2 py-1 text-xs font-semibold",
                            department.status === "ativo"
                              ? "bg-green-500/20 text-green-500"
                              : department.status === "inativo"
                                ? "bg-yellow-500/20 text-yellow-500"
                                : "bg-gray-500/20 text-gray-500",
                          )}
                        >
                          {department.status}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setManagingMembers({
                              type: "department",
                              id: department.departmentId,
                              name: department.name,
                            })
                          }
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditDepartment(department)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDepartment(department.departmentId)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </GlassCard>
                ))
              )}
            </div>
          )}
        </>
      );
    }

    if (activeTab === "teams") {
      return (
        <>
          {showForm && (
            <GlassCard className="p-6">
              <h2 className="mb-4 text-lg font-semibold">
                {editingTeam ? "Editar Time" : "Novo Time"}
              </h2>
              <form onSubmit={handleTeamSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="team-name">Nome</Label>
                    <Input
                      id="team-name"
                      value={teamFormData.name}
                      onChange={(e) =>
                        setTeamFormData({ ...teamFormData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="team-code">Código</Label>
                    <Input
                      id="team-code"
                      value={teamFormData.code}
                      onChange={(e) =>
                        setTeamFormData({ ...teamFormData, code: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <Label htmlFor="team-description">Descrição</Label>
                    <Input
                      id="team-description"
                      value={teamFormData.description}
                      onChange={(e) =>
                        setTeamFormData({ ...teamFormData, description: e.target.value })
                      }
                    />
                  </div>
                  <FormSelect
                    label="Departamento"
                    id="team-departmentId"
                    value={teamFormData.departmentId}
                    onChange={(e) =>
                      setTeamFormData({ ...teamFormData, departmentId: e.target.value })
                    }
                  >
                    <option value="">Nenhum</option>
                    {departments.map((d) => (
                      <option key={d.departmentId} value={d.departmentId}>
                        {d.name}
                      </option>
                    ))}
                  </FormSelect>
                  <FormSelect
                    label="Status"
                    id="team-status"
                    value={teamFormData.status}
                    onChange={(e) =>
                      setTeamFormData({
                        ...teamFormData,
                        status: e.target.value as "ativo" | "inativo" | "arquivado",
                      })
                    }
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                    <option value="arquivado">Arquivado</option>
                  </FormSelect>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Salvar</Button>
                  <Button type="button" variant="secondary" onClick={handleCancel}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </GlassCard>
          )}

          {!showForm && (
            <div className="grid gap-4">
              {teams.length === 0 ? (
                <GlassCard className="p-8 text-center">
                  <p className="text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                    Nenhum time encontrado.
                  </p>
                </GlassCard>
              ) : (
                teams.map((team) => (
                  <GlassCard key={team.teamId} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <UserCircle className="h-5 w-5 text-[var(--primary)]" />
                          <div>
                            <h3 className="font-semibold">{team.name}</h3>
                            <p className="text-sm text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
                              {team.code}
                            </p>
                            {team.description && (
                              <p className="mt-1 text-sm text-[color-mix(in oklab,var(--muted-soft) 80%,var(--fg) 20%)]">
                                {team.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "rounded-full px-2 py-1 text-xs font-semibold",
                            team.status === "ativo"
                              ? "bg-green-500/20 text-green-500"
                              : team.status === "inativo"
                                ? "bg-yellow-500/20 text-yellow-500"
                                : "bg-gray-500/20 text-gray-500",
                          )}
                        >
                          {team.status}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setManagingMembers({
                              type: "team",
                              id: team.teamId,
                              name: team.name,
                            })
                          }
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTeam(team)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTeam(team.teamId)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </GlassCard>
                ))
              )}
            </div>
          )}
        </>
      );
    }

    if (activeTab === "hierarchy") {
      return renderHierarchyView();
    }

    return null;
  }

  function renderHierarchyView() {
    // Construir árvore hierárquica
    const unitsMap = new Map(units.map((u) => [u.unitId, u]));
    const departmentsMap = new Map(departments.map((d) => [d.departmentId, d]));
    const teamsMap = new Map(teams.map((t) => [t.teamId, t]));

    // Organizar unidades por hierarquia
    const rootUnits = units.filter((u) => !u.parentId);
    const unitsByParent = new Map<string, OrganizationalUnit[]>();
    units.forEach((u) => {
      if (u.parentId) {
        const siblings = unitsByParent.get(u.parentId) || [];
        siblings.push(u);
        unitsByParent.set(u.parentId, siblings);
      }
    });

    // Organizar departamentos por unidade
    const departmentsByUnit = new Map<string, Department[]>();
    departments.forEach((d) => {
      const unitId = d.unitId || "root";
      const deptList = departmentsByUnit.get(unitId) || [];
      deptList.push(d);
      departmentsByUnit.set(unitId, deptList);
    });

    // Organizar departamentos por hierarquia
    const departmentsByParent = new Map<string, Department[]>();
    departments.forEach((d) => {
      if (d.parentId) {
        const siblings = departmentsByParent.get(d.parentId) || [];
        siblings.push(d);
        departmentsByParent.set(d.parentId, siblings);
      }
    });

    // Organizar times por departamento
    const teamsByDepartment = new Map<string, Team[]>();
    teams.forEach((t) => {
      const deptId = t.departmentId || "root";
      const teamList = teamsByDepartment.get(deptId) || [];
      teamList.push(t);
      teamsByDepartment.set(deptId, teamList);
    });

    // Componentes hierárquicos internos
    function UnitHierarchyItem({
      unit,
      level = 0,
      unitsByParent,
      departmentsByUnit,
      onEdit,
      onDelete,
      onManageMembers,
      renderDepartmentHierarchy,
    }: {
      unit: OrganizationalUnit;
      level?: number;
      unitsByParent: Map<string, OrganizationalUnit[]>;
      departmentsByUnit: Map<string, Department[]>;
      onEdit: (unit: OrganizationalUnit) => void;
      onDelete: (unitId: string) => void;
      onManageMembers: (type: "unit" | "department" | "team", id: string, name: string) => void;
      renderDepartmentHierarchy: (dept: Department, level: number) => JSX.Element;
    }) {
      const unitDepartments = departmentsByUnit.get(unit.unitId) || [];
      const childUnits = unitsByParent.get(unit.unitId) || [];
      const [expanded, setExpanded] = useState(true);
      const hasChildren = unitDepartments.length > 0 || childUnits.length > 0;

      return (
        <div className={level > 0 ? "ml-6" : ""}>
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                {hasChildren && (
                  <button
                    type="button"
                    onClick={() => setExpanded(!expanded)}
                    className="flex h-6 w-6 items-center justify-center rounded hover:bg-[color-mix(in_oklab,var(--surface)_80%,transparent)] transition-colors"
                  >
                    {expanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                )}
                <Building2 className="h-5 w-5 text-[var(--primary)]" />
                <div>
                  <h3 className="font-semibold">{unit.name}</h3>
                  <p className="text-sm text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                    {unit.code}
                  </p>
                </div>
                <span
                  className={cn(
                    "ml-auto rounded-full px-2 py-1 text-xs font-semibold",
                    unit.status === "ativo"
                      ? "bg-green-500/20 text-green-500"
                      : unit.status === "inativo"
                        ? "bg-yellow-500/20 text-yellow-500"
                        : "bg-gray-500/20 text-gray-500",
                  )}
                >
                  {unit.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onManageMembers("unit", unit.unitId, unit.name)}
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onEdit(unit)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(unit.unitId)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>

            {expanded && hasChildren && (
              <div className="mt-4 space-y-3 border-t border-[color-mix(in_oklab,var(--border)_90%,transparent)] pt-4">
                {unitDepartments
                  .filter((d) => !d.parentId)
                  .map((dept) => renderDepartmentHierarchy(dept, level + 1))}
                {childUnits.map((childUnit) => (
                  <UnitHierarchyItem
                    key={childUnit.unitId}
                    unit={childUnit}
                    level={level + 1}
                    unitsByParent={unitsByParent}
                    departmentsByUnit={departmentsByUnit}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onManageMembers={onManageMembers}
                    renderDepartmentHierarchy={renderDepartmentHierarchy}
                  />
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      );
    }

    function DepartmentHierarchyItem({
      department,
      level = 0,
      departmentsByParent,
      teamsByDepartment,
      onEdit,
      onDelete,
      onManageMembers,
    }: {
      department: Department;
      level?: number;
      departmentsByParent: Map<string, Department[]>;
      teamsByDepartment: Map<string, Team[]>;
      onEdit: (department: Department) => void;
      onDelete: (departmentId: string) => void;
      onManageMembers: (type: "unit" | "department" | "team", id: string, name: string) => void;
    }) {
      const departmentTeams = teamsByDepartment.get(department.departmentId) || [];
      const childDepartments = departmentsByParent.get(department.departmentId) || [];
      const [expanded, setExpanded] = useState(true);
      const hasChildren = departmentTeams.length > 0 || childDepartments.length > 0;

      return (
        <div className={level > 0 ? "ml-6" : ""}>
          <GlassCard className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                {hasChildren && (
                  <button
                    type="button"
                    onClick={() => setExpanded(!expanded)}
                    className="flex h-6 w-6 items-center justify-center rounded hover:bg-[color-mix(in_oklab,var(--surface)_80%,transparent)] transition-colors"
                  >
                    {expanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                )}
                <Users className="h-4 w-4 text-[var(--primary)]" />
                <div>
                  <h4 className="font-medium text-sm">{department.name}</h4>
                  <p className="text-xs text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                    {department.code}
                  </p>
                </div>
                <span
                  className={cn(
                    "ml-auto rounded-full px-2 py-1 text-xs font-semibold",
                    department.status === "ativo"
                      ? "bg-green-500/20 text-green-500"
                      : department.status === "inativo"
                        ? "bg-yellow-500/20 text-yellow-500"
                        : "bg-gray-500/20 text-gray-500",
                  )}
                >
                  {department.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onManageMembers("department", department.departmentId, department.name)}
                >
                  <UserPlus className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onEdit(department)}>
                  <Edit className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(department.departmentId)}>
                  <Trash2 className="h-3 w-3 text-red-500" />
                </Button>
              </div>
            </div>

            {expanded && hasChildren && (
              <div className="mt-3 space-y-2 border-t border-[color-mix(in_oklab,var(--border)_90%,transparent)] pt-3">
                {departmentTeams.map((team) => (
                  <TeamHierarchyItem
                    key={team.teamId}
                    team={team}
                    level={level + 1}
                    onEdit={(t) => handleEditTeam(t)}
                    onDelete={(id) => handleDeleteTeam(id)}
                    onManageMembers={onManageMembers}
                  />
                ))}
                {childDepartments.map((childDept) => (
                  <DepartmentHierarchyItem
                    key={childDept.departmentId}
                    department={childDept}
                    level={level + 1}
                    departmentsByParent={departmentsByParent}
                    teamsByDepartment={teamsByDepartment}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onManageMembers={onManageMembers}
                  />
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      );
    }

    function TeamHierarchyItem({
      team,
      level = 0,
      onEdit,
      onDelete,
      onManageMembers,
    }: {
      team: Team;
      level?: number;
      onEdit: (team: Team) => void;
      onDelete: (teamId: string) => void;
      onManageMembers: (type: "unit" | "department" | "team", id: string, name: string) => void;
    }) {
      return (
        <div className={level > 0 ? "ml-6" : ""}>
          <GlassCard className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <UserCircle className="h-4 w-4 text-[var(--primary)]" />
                <div>
                  <h5 className="font-medium text-sm">{team.name}</h5>
                  <p className="text-xs text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                    {team.code}
                  </p>
                </div>
                <span
                  className={cn(
                    "ml-auto rounded-full px-2 py-1 text-xs font-semibold",
                    team.status === "ativo"
                      ? "bg-green-500/20 text-green-500"
                      : team.status === "inativo"
                        ? "bg-yellow-500/20 text-yellow-500"
                        : "bg-gray-500/20 text-gray-500",
                  )}
                >
                  {team.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onManageMembers("team", team.teamId, team.name)}
                >
                  <UserPlus className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onEdit(team)}>
                  <Edit className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(team.teamId)}>
                  <Trash2 className="h-3 w-3 text-red-500" />
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>
      );
    }

    const renderDepartmentHierarchy = (dept: Department, level: number) => (
      <DepartmentHierarchyItem
        key={dept.departmentId}
        department={dept}
        level={level}
        departmentsByParent={departmentsByParent}
        teamsByDepartment={teamsByDepartment}
        onEdit={handleEditDepartment}
        onDelete={handleDeleteDepartment}
        onManageMembers={setManagingMembers}
      />
    );

    // Departamentos sem unidade (raiz)
    const rootDepartments = departments.filter((d) => !d.unitId && !d.parentId);
    // Times sem departamento (raiz)
    const rootTeams = teams.filter((t) => !t.departmentId);

    return (
      <div className="space-y-6">
        {/* Unidades raiz */}
        {rootUnits.length > 0 && (
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
              Unidades Organizacionais
            </h3>
            <div className="space-y-3">
              {rootUnits.map((unit) => (
                <UnitHierarchyItem
                  key={unit.unitId}
                  unit={unit}
                  unitsByParent={unitsByParent}
                  departmentsByUnit={departmentsByUnit}
                  onEdit={handleEditUnit}
                  onDelete={handleDeleteUnit}
                  onManageMembers={setManagingMembers}
                  renderDepartmentHierarchy={renderDepartmentHierarchy}
                />
              ))}
            </div>
          </div>
        )}

        {/* Departamentos sem unidade */}
        {rootDepartments.length > 0 && (
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
              Departamentos
            </h3>
            <div className="space-y-3">
              {rootDepartments.map((dept) => (
                <DepartmentHierarchyItem
                  key={dept.departmentId}
                  department={dept}
                  departmentsByParent={departmentsByParent}
                  teamsByDepartment={teamsByDepartment}
                  onEdit={handleEditDepartment}
                  onDelete={handleDeleteDepartment}
                  onManageMembers={setManagingMembers}
                />
              ))}
            </div>
          </div>
        )}

        {/* Times sem departamento */}
        {rootTeams.length > 0 && (
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
              Times
            </h3>
            <div className="space-y-3">
              {rootTeams.map((team) => (
                <TeamHierarchyItem
                  key={team.teamId}
                  team={team}
                  onEdit={handleEditTeam}
                  onDelete={handleDeleteTeam}
                  onManageMembers={setManagingMembers}
                />
              ))}
            </div>
          </div>
        )}

        {rootUnits.length === 0 && rootDepartments.length === 0 && rootTeams.length === 0 && (
          <GlassCard className="p-8 text-center">
            <Network className="mx-auto h-12 w-12 text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]" />
            <p className="mt-4 text-[color-mix(in_oklab,var(--muted-soft)_70%,var(--fg)_30%)]">
              Nenhuma estrutura organizacional encontrada. Crie unidades, departamentos ou times
              para visualizar a hierarquia.
            </p>
          </GlassCard>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
        <button
          type="button"
          onClick={() => setActiveTab("hierarchy")}
          className={cn(
            "px-4 py-2 font-semibold transition-colors",
            activeTab === "hierarchy"
              ? "border-b-2 border-[var(--primary)] text-[var(--primary)]"
              : "text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)] hover:text-[var(--fg)]",
          )}
        >
          <Network className="mr-2 inline h-4 w-4" />
          Hierarquia
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("units")}
          className={cn(
            "px-4 py-2 font-semibold transition-colors",
            activeTab === "units"
              ? "border-b-2 border-[var(--primary)] text-[var(--primary)]"
              : "text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)] hover:text-[var(--fg)]",
          )}
        >
          <Building2 className="mr-2 inline h-4 w-4" />
          Unidades
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("departments")}
          className={cn(
            "px-4 py-2 font-semibold transition-colors",
            activeTab === "departments"
              ? "border-b-2 border-[var(--primary)] text-[var(--primary)]"
              : "text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)] hover:text-[var(--fg)]",
          )}
        >
          <Users className="mr-2 inline h-4 w-4" />
          Departamentos
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("teams")}
          className={cn(
            "px-4 py-2 font-semibold transition-colors",
            activeTab === "teams"
              ? "border-b-2 border-[var(--primary)] text-[var(--primary)]"
              : "text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)] hover:text-[var(--fg)]",
          )}
        >
          <UserCircle className="mr-2 inline h-4 w-4" />
          Times
        </button>
      </div>

      {/* Filtros e busca */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]" />
            <Input
              type="search"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) {
              handleCancel();
            }
          }}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          {showForm ? "Cancelar" : activeTab === "units" ? "Nova Unidade" : activeTab === "departments" ? "Novo Departamento" : "Novo Time"}
        </Button>
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-[color-mix(in oklab,var(--muted-soft) 70%,var(--fg) 30%)]">
            Carregando...
          </p>
        </div>
      ) : managingMembers ? (
        <MembersManager
          entityType={managingMembers.type}
          entityId={managingMembers.id}
          entityName={managingMembers.name}
          onClose={() => setManagingMembers(null)}
        />
      ) : (
        renderContent()
      )}
    </div>
  );
}

