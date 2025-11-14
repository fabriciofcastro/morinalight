"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button, GlassCard, Input, Label, FormSelect, FormField, FormTextarea, cn } from "@morina/ui";
import {
  Building2,
  FolderTree,
  Briefcase,
  Plus,
  Search,
  Edit,
  Trash2,
  Network,
  ChevronRight,
  X,
} from "lucide-react";
import { getAuthHeadersWithTenant } from "@/lib/auth-client";
import { OrganizationTree, type DepartmentNode, type SectorNode, type PositionNode } from "@/components/organizational-structure/organization-tree";
import { notificationCenter } from "@/components/notifications/notification-center";

type Department = {
  id: string;
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

type Sector = {
  id: string;
  orgId: string;
  departmentId: string;
  name: string;
  code: string;
  description: string | null;
  parentId: string | null;
  status: "ativo" | "inativo" | "arquivado";
  ordem: number;
  createdAt: string;
  updatedAt: string;
};

type Position = {
  id: string;
  orgId: string;
  sectorId: string;
  name: string;
  code: string;
  description: string | null;
  responsabilidades: string | null;
  requisitos: string | null;
  salarioMin: number | null;
  salarioMax: number | null;
  status: "ativo" | "inativo" | "arquivado";
  ordem: number;
  createdAt: string;
  updatedAt: string;
};

type DepartmentsResponse = {
  itens: Department[];
  proximoCursor?: string | null;
};

type SectorsResponse = {
  itens: Sector[];
  proximoCursor?: string | null;
};

type PositionsResponse = {
  itens: Position[];
  proximoCursor?: string | null;
};

type Tab = "hierarchy" | "departments" | "sectors" | "positions";

export function OrganizationalStructureClient() {
  const [activeTab, setActiveTab] = useState<Tab>("hierarchy");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedNode, setSelectedNode] = useState<{ type: "department" | "sector" | "position"; id: string } | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Form states
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);

  const [departmentFormData, setDepartmentFormData] = useState({
    name: "",
    code: "",
    description: "",
    parentId: "",
    status: "ativo" as "ativo" | "inativo" | "arquivado",
    ordem: 0,
  });

  const [sectorFormData, setSectorFormData] = useState({
    name: "",
    code: "",
    description: "",
    departmentId: "",
    parentId: "",
    status: "ativo" as "ativo" | "inativo" | "arquivado",
    ordem: 0,
  });

  const [positionFormData, setPositionFormData] = useState({
    name: "",
    code: "",
    description: "",
    sectorId: "",
    responsabilidades: "",
    requisitos: "",
    salarioMin: "",
    salarioMax: "",
    status: "ativo" as "ativo" | "inativo" | "arquivado",
    ordem: 0,
  });

  // Carregar dados quando a aba mudar
  useEffect(() => {
    setShowForm(false);
    setSelectedNode(null);
    if (activeTab === "hierarchy") {
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
      await Promise.all([loadDepartments(), loadSectors(), loadPositions()]);
    } finally {
      setLoading(false);
    }
  }

  async function loadData() {
    setLoading(true);
    try {
      if (activeTab === "departments") {
        await loadDepartments();
      } else if (activeTab === "sectors") {
        await loadSectors();
        await loadDepartments(); // Precisa dos departamentos para o select
      } else if (activeTab === "positions") {
        await loadPositions();
        await loadSectors(); // Precisa dos setores para o select
        await loadDepartments(); // Precisa dos departamentos também
      }
    } finally {
      setLoading(false);
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

  async function loadSectors() {
    try {
      const params = new URLSearchParams();
      if (search.length >= 2) {
        params.append("busca", search);
      }

      const response = await fetch(`/api/sectors?${params.toString()}`, {
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: SectorsResponse = await response.json();
        setSectors(data.itens || []);
      }
    } catch (error) {
      console.error("Erro ao carregar setores:", error);
    }
  }

  async function loadPositions() {
    try {
      const params = new URLSearchParams();
      if (search.length >= 2) {
        params.append("busca", search);
      }

      const response = await fetch(`/api/positions?${params.toString()}`, {
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: PositionsResponse = await response.json();
        setPositions(data.itens || []);
      }
    } catch (error) {
      console.error("Erro ao carregar cargos:", error);
    }
  }

  // Construir árvore hierárquica
  const hierarchyTree = useMemo((): DepartmentNode[] => {
    const deptMap = new Map<string, DepartmentNode>();
    
    // Criar nós de departamentos
    departments.forEach((dept) => {
      deptMap.set(dept.id, {
        id: dept.id,
        name: dept.name,
        code: dept.code,
        status: dept.status,
        sectors: [],
      });
    });

    // Adicionar setores aos departamentos
    sectors.forEach((sector) => {
      const dept = deptMap.get(sector.departmentId);
      if (dept) {
        if (!dept.sectors) {
          dept.sectors = [];
        }
        dept.sectors.push({
          id: sector.id,
          name: sector.name,
          code: sector.code,
          status: sector.status,
          departmentId: sector.departmentId,
          positions: [],
        });
      }
    });

    // Adicionar cargos aos setores
    positions.forEach((position) => {
      const dept = Array.from(deptMap.values()).find((d) =>
        d.sectors?.some((s) => s.id === position.sectorId)
      );
      if (dept) {
        const sector = dept.sectors?.find((s) => s.id === position.sectorId);
        if (sector) {
          if (!sector.positions) {
            sector.positions = [];
          }
          sector.positions.push({
            id: position.id,
            name: position.name,
            code: position.code,
            status: position.status,
            sectorId: position.sectorId,
          });
        }
      }
    });

    return Array.from(deptMap.values());
  }, [departments, sectors, positions]);

  const handleToggleExpand = (id: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpanded(newExpanded);
  };

  const handleSelectNode = (node: {
    type: "department" | "sector" | "position";
    id: string;
    data: DepartmentNode | SectorNode | PositionNode;
  }) => {
    setSelectedNode({ type: node.type, id: node.id });
  };

  const handleEditNode = (node: {
    type: "department" | "sector" | "position";
    id: string;
    data: DepartmentNode | SectorNode | PositionNode;
  }) => {
    if (node.type === "department") {
      const dept = departments.find((d) => d.id === node.id);
      if (dept) {
        setEditingDepartment(dept);
        setDepartmentFormData({
          name: dept.name,
          code: dept.code,
          description: dept.description || "",
          parentId: dept.parentId || "",
          status: dept.status,
          ordem: dept.ordem,
        });
        setShowForm(true);
        setActiveTab("departments");
      }
    } else if (node.type === "sector") {
      const sector = sectors.find((s) => s.id === node.id);
      if (sector) {
        setEditingSector(sector);
        setSectorFormData({
          name: sector.name,
          code: sector.code,
          description: sector.description || "",
          departmentId: sector.departmentId,
          parentId: sector.parentId || "",
          status: sector.status,
          ordem: sector.ordem,
        });
        setShowForm(true);
        setActiveTab("sectors");
      }
    } else if (node.type === "position") {
      const position = positions.find((p) => p.id === node.id);
      if (position) {
        setEditingPosition(position);
        setPositionFormData({
          name: position.name,
          code: position.code,
          description: position.description || "",
          sectorId: position.sectorId,
          responsabilidades: position.responsabilidades || "",
          requisitos: position.requisitos || "",
          salarioMin: position.salarioMin?.toString() || "",
          salarioMax: position.salarioMax?.toString() || "",
          status: position.status,
          ordem: position.ordem,
        });
        setShowForm(true);
        setActiveTab("positions");
      }
    }
  };

  const handleDeleteNode = async (node: {
    type: "department" | "sector" | "position";
    id: string;
    data: DepartmentNode | SectorNode | PositionNode;
  }) => {
    const nodeName = (node.data as { name: string }).name;
    const confirmMessage = `Tem certeza que deseja deletar ${nodeName}? Esta ação não pode ser desfeita.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      let url = "";
      if (node.type === "department") {
        url = `/api/departments/${node.id}`;
      } else if (node.type === "sector") {
        url = `/api/sectors/${node.id}`;
      } else if (node.type === "position") {
        url = `/api/positions/${node.id}`;
      }

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        notificationCenter.add({
          type: "success",
          title: `${node.type === "department" ? "Departamento" : node.type === "sector" ? "Setor" : "Cargo"} deletado`,
          message: `${nodeName} foi deletado com sucesso`,
        });
        await loadAllData();
      } else {
        const error = await response.json();
        notificationCenter.add({
          type: "error",
          title: "Erro ao deletar",
          message: error.message || "Erro ao deletar item",
        });
      }
    } catch (error) {
      console.error("Erro ao deletar:", error);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Erro ao deletar item. Tente novamente.",
      });
    }
  };

  const handleAddChild = (parentType: "department" | "sector", parentId: string) => {
    if (parentType === "department") {
      setSectorFormData((prev) => ({ ...prev, departmentId: parentId }));
      setShowForm(true);
      setActiveTab("sectors");
    } else if (parentType === "sector") {
      setPositionFormData((prev) => ({ ...prev, sectorId: parentId }));
      setShowForm(true);
      setActiveTab("positions");
    }
  };

  const resetDepartmentForm = () => {
    setDepartmentFormData({
      name: "",
      code: "",
      description: "",
      parentId: "",
      status: "ativo",
      ordem: 0,
    });
    setEditingDepartment(null);
  };

  const resetSectorForm = () => {
    setSectorFormData({
      name: "",
      code: "",
      description: "",
      departmentId: "",
      parentId: "",
      status: "ativo",
      ordem: 0,
    });
    setEditingSector(null);
  };

  const resetPositionForm = () => {
    setPositionFormData({
      name: "",
      code: "",
      description: "",
      sectorId: "",
      responsabilidades: "",
      requisitos: "",
      salarioMin: "",
      salarioMax: "",
      status: "ativo",
      ordem: 0,
    });
    setEditingPosition(null);
  };

  async function handleDepartmentSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const url = editingDepartment ? `/api/departments/${editingDepartment.id}` : "/api/departments";
      const method = editingDepartment ? "PUT" : "POST";

      const body = {
        ...departmentFormData,
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
        resetDepartmentForm();
        await loadAllData();
      } else {
        const error = await response.json();
        notificationCenter.add({
          type: "error",
          title: "Erro ao salvar departamento",
          message: error.message || "Erro ao salvar departamento",
        });
      }
    } catch (error) {
      console.error("Erro ao salvar departamento:", error);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Erro ao salvar departamento. Tente novamente.",
      });
    }
  }

  async function handleSectorSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const url = editingSector ? `/api/sectors/${editingSector.id}` : "/api/sectors";
      const method = editingSector ? "PUT" : "POST";

      const body = {
        ...sectorFormData,
        departmentId: sectorFormData.departmentId,
        parentId: sectorFormData.parentId || null,
        description: sectorFormData.description || null,
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
          title: editingSector ? "Setor atualizado" : "Setor criado",
          message: `${sectorFormData.name} foi ${editingSector ? "atualizado" : "criado"} com sucesso`,
        });
        setShowForm(false);
        resetSectorForm();
        await loadAllData();
      } else {
        const error = await response.json();
        notificationCenter.add({
          type: "error",
          title: "Erro ao salvar setor",
          message: error.message || "Erro ao salvar setor",
        });
      }
    } catch (error) {
      console.error("Erro ao salvar setor:", error);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Erro ao salvar setor. Tente novamente.",
      });
    }
  }

  async function handlePositionSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const url = editingPosition ? `/api/positions/${editingPosition.id}` : "/api/positions";
      const method = editingPosition ? "PUT" : "POST";

      const body = {
        ...positionFormData,
        sectorId: positionFormData.sectorId,
        description: positionFormData.description || null,
        responsabilidades: positionFormData.responsabilidades || null,
        requisitos: positionFormData.requisitos || null,
        salarioMin: positionFormData.salarioMin ? Number(positionFormData.salarioMin) : null,
        salarioMax: positionFormData.salarioMax ? Number(positionFormData.salarioMax) : null,
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
          title: editingPosition ? "Cargo atualizado" : "Cargo criado",
          message: `${positionFormData.name} foi ${editingPosition ? "atualizado" : "criado"} com sucesso`,
        });
        setShowForm(false);
        resetPositionForm();
        await loadAllData();
      } else {
        const error = await response.json();
        notificationCenter.add({
          type: "error",
          title: "Erro ao salvar cargo",
          message: error.message || "Erro ao salvar cargo",
        });
      }
    } catch (error) {
      console.error("Erro ao salvar cargo:", error);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: "Erro ao salvar cargo. Tente novamente.",
      });
    }
  }

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      {/* Tabs */}
      <div className="flex gap-[var(--space-2)] border-b border-[var(--border)]">
        <button
          type="button"
          onClick={() => setActiveTab("hierarchy")}
          className={cn(
            "flex items-center gap-[var(--space-2)] px-[var(--space-4)] py-[var(--space-3)] font-semibold transition-colors",
            activeTab === "hierarchy"
              ? "border-b-2 border-[var(--primary)] text-[var(--primary)]"
              : "text-[color-mix(in_oklab,var(--muted-soft)_70%,var(--fg)_30%)] hover:text-[var(--fg)]",
          )}
        >
          <Network className="h-4 w-4" />
          Hierarquia
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("departments")}
          className={cn(
            "flex items-center gap-[var(--space-2)] px-[var(--space-4)] py-[var(--space-3)] font-semibold transition-colors",
            activeTab === "departments"
              ? "border-b-2 border-[var(--primary)] text-[var(--primary)]"
              : "text-[color-mix(in_oklab,var(--muted-soft)_70%,var(--fg)_30%)] hover:text-[var(--fg)]",
          )}
        >
          <Building2 className="h-4 w-4" />
          Departamentos
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("sectors")}
          className={cn(
            "flex items-center gap-[var(--space-2)] px-[var(--space-4)] py-[var(--space-3)] font-semibold transition-colors",
            activeTab === "sectors"
              ? "border-b-2 border-[var(--primary)] text-[var(--primary)]"
              : "text-[color-mix(in_oklab,var(--muted-soft)_70%,var(--fg)_30%)] hover:text-[var(--fg)]",
          )}
        >
          <FolderTree className="h-4 w-4" />
          Setores
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("positions")}
          className={cn(
            "flex items-center gap-[var(--space-2)] px-[var(--space-4)] py-[var(--space-3)] font-semibold transition-colors",
            activeTab === "positions"
              ? "border-b-2 border-[var(--primary)] text-[var(--primary)]"
              : "text-[color-mix(in_oklab,var(--muted-soft)_70%,var(--fg)_30%)] hover:text-[var(--fg)]",
          )}
        >
          <Briefcase className="h-4 w-4" />
          Cargos
        </button>
      </div>

      {/* Filtros e busca */}
      {activeTab !== "hierarchy" && (
        <div className="flex flex-col gap-[var(--space-4)] sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-[var(--space-3)] top-1/2 h-4 w-4 -translate-y-1/2 text-[color-mix(in_oklab,var(--muted-soft)_70%,var(--fg)_30%)]" />
            <Input
              type="search"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-[var(--space-10)]"
            />
          </div>
          <Button
            onClick={() => {
              if (activeTab === "departments") {
                resetDepartmentForm();
              } else if (activeTab === "sectors") {
                resetSectorForm();
              } else if (activeTab === "positions") {
                resetPositionForm();
              }
              setShowForm(!showForm);
            }}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            {showForm
              ? "Cancelar"
              : activeTab === "departments"
                ? "Novo Departamento"
                : activeTab === "sectors"
                  ? "Novo Setor"
                  : "Novo Cargo"}
          </Button>
        </div>
      )}

      {/* Conteúdo */}
      {loading ? (
        <div className="flex items-center justify-center py-[var(--space-12)]">
          <p className="text-[color-mix(in_oklab,var(--muted-soft)_70%,var(--fg)_30%)]">Carregando...</p>
        </div>
      ) : activeTab === "hierarchy" ? (
        <OrganizationTree
          departments={hierarchyTree}
          selectedId={selectedNode ? `${selectedNode.type}-${selectedNode.id}` : undefined}
          onSelect={handleSelectNode}
          onEdit={handleEditNode}
          onDelete={handleDeleteNode}
          onAddChild={handleAddChild}
          expanded={expanded}
          onToggleExpand={handleToggleExpand}
        />
      ) : showForm ? (
        <GlassCard>
          <div className="flex items-center justify-between mb-[var(--space-6)]">
            <h2 className="text-[var(--fs-xl)] font-semibold">
              {editingDepartment || editingSector || editingPosition
                ? `Editar ${activeTab === "departments" ? "Departamento" : activeTab === "sectors" ? "Setor" : "Cargo"}`
                : `Novo ${activeTab === "departments" ? "Departamento" : activeTab === "sectors" ? "Setor" : "Cargo"}`}
            </h2>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                if (activeTab === "departments") resetDepartmentForm();
                else if (activeTab === "sectors") resetSectorForm();
                else resetPositionForm();
              }}
              className="rounded-[var(--r-sm)] p-[var(--space-2)] hover:bg-[color-mix(in_oklab,var(--surface-muted)_90%,var(--primary)_10%)] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {activeTab === "departments" && (
            <form onSubmit={handleDepartmentSubmit} className="flex flex-col gap-[var(--space-4)]">
              <FormField label="Nome" required>
                <Input
                  value={departmentFormData.name}
                  onChange={(e) => setDepartmentFormData({ ...departmentFormData, name: e.target.value })}
                  placeholder="Nome do departamento"
                  required
                />
              </FormField>
              <FormField label="Código" required>
                <Input
                  value={departmentFormData.code}
                  onChange={(e) => setDepartmentFormData({ ...departmentFormData, code: e.target.value })}
                  placeholder="Código único (ex: DPT-001)"
                  required
                />
              </FormField>
              <FormField label="Descrição">
                <FormTextarea
                  value={departmentFormData.description}
                  onChange={(e) => setDepartmentFormData({ ...departmentFormData, description: e.target.value })}
                  placeholder="Descrição do departamento"
                  rows={3}
                />
              </FormField>
              <FormField label="Departamento Pai">
                <FormSelect
                  value={departmentFormData.parentId}
                  onChange={(e) => setDepartmentFormData({ ...departmentFormData, parentId: e.target.value })}
                >
                  <option value="">Nenhum</option>
                  {departments
                    .filter((d) => d.id !== editingDepartment?.id)
                    .map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                </FormSelect>
              </FormField>
              <FormField label="Status">
                <FormSelect
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
              </FormField>
              <div className="flex gap-[var(--space-3)] pt-[var(--space-4)]">
                <Button type="submit" className="flex-1">
                  {editingDepartment ? "Atualizar" : "Criar"} Departamento
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowForm(false);
                    resetDepartmentForm();
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}

          {activeTab === "sectors" && (
            <form onSubmit={handleSectorSubmit} className="flex flex-col gap-[var(--space-4)]">
              <FormField label="Nome" required>
                <Input
                  value={sectorFormData.name}
                  onChange={(e) => setSectorFormData({ ...sectorFormData, name: e.target.value })}
                  placeholder="Nome do setor"
                  required
                />
              </FormField>
              <FormField label="Código" required>
                <Input
                  value={sectorFormData.code}
                  onChange={(e) => setSectorFormData({ ...sectorFormData, code: e.target.value })}
                  placeholder="Código único (ex: SEC-001)"
                  required
                />
              </FormField>
              <FormField label="Descrição">
                <FormTextarea
                  value={sectorFormData.description}
                  onChange={(e) => setSectorFormData({ ...sectorFormData, description: e.target.value })}
                  placeholder="Descrição do setor"
                  rows={3}
                />
              </FormField>
              <FormField label="Departamento" required>
                <FormSelect
                  value={sectorFormData.departmentId}
                  onChange={(e) => setSectorFormData({ ...sectorFormData, departmentId: e.target.value })}
                  required
                >
                  <option value="">Selecione um departamento</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </FormSelect>
              </FormField>
              <FormField label="Setor Pai">
                <FormSelect
                  value={sectorFormData.parentId}
                  onChange={(e) => setSectorFormData({ ...sectorFormData, parentId: e.target.value })}
                >
                  <option value="">Nenhum</option>
                  {sectors
                    .filter((s) => s.departmentId === sectorFormData.departmentId && s.id !== editingSector?.id)
                    .map((sector) => (
                      <option key={sector.id} value={sector.id}>
                        {sector.name} ({sector.code})
                      </option>
                    ))}
                </FormSelect>
              </FormField>
              <FormField label="Status">
                <FormSelect
                  value={sectorFormData.status}
                  onChange={(e) =>
                    setSectorFormData({
                      ...sectorFormData,
                      status: e.target.value as "ativo" | "inativo" | "arquivado",
                    })
                  }
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="arquivado">Arquivado</option>
                </FormSelect>
              </FormField>
              <div className="flex gap-[var(--space-3)] pt-[var(--space-4)]">
                <Button type="submit" className="flex-1">
                  {editingSector ? "Atualizar" : "Criar"} Setor
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowForm(false);
                    resetSectorForm();
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}

          {activeTab === "positions" && (
            <form onSubmit={handlePositionSubmit} className="flex flex-col gap-[var(--space-4)]">
              <FormField label="Nome" required>
                <Input
                  value={positionFormData.name}
                  onChange={(e) => setPositionFormData({ ...positionFormData, name: e.target.value })}
                  placeholder="Nome do cargo"
                  required
                />
              </FormField>
              <FormField label="Código" required>
                <Input
                  value={positionFormData.code}
                  onChange={(e) => setPositionFormData({ ...positionFormData, code: e.target.value })}
                  placeholder="Código único (ex: POS-001)"
                  required
                />
              </FormField>
              <FormField label="Descrição">
                <FormTextarea
                  value={positionFormData.description}
                  onChange={(e) => setPositionFormData({ ...positionFormData, description: e.target.value })}
                  placeholder="Descrição do cargo"
                  rows={3}
                />
              </FormField>
              <FormField label="Setor" required>
                <FormSelect
                  value={positionFormData.sectorId}
                  onChange={(e) => setPositionFormData({ ...positionFormData, sectorId: e.target.value })}
                  required
                >
                  <option value="">Selecione um setor</option>
                  {sectors.map((sector) => {
                    const dept = departments.find((d) => d.id === sector.departmentId);
                    return (
                      <option key={sector.id} value={sector.id}>
                        {sector.name} ({sector.code}) - {dept?.name}
                      </option>
                    );
                  })}
                </FormSelect>
              </FormField>
              <FormField label="Responsabilidades">
                <FormTextarea
                  value={positionFormData.responsabilidades}
                  onChange={(e) => setPositionFormData({ ...positionFormData, responsabilidades: e.target.value })}
                  placeholder="Responsabilidades do cargo"
                  rows={4}
                />
              </FormField>
              <FormField label="Requisitos">
                <FormTextarea
                  value={positionFormData.requisitos}
                  onChange={(e) => setPositionFormData({ ...positionFormData, requisitos: e.target.value })}
                  placeholder="Requisitos para ocupar o cargo"
                  rows={4}
                />
              </FormField>
              <div className="grid grid-cols-2 gap-[var(--space-4)]">
                <FormField label="Salário Mínimo">
                  <Input
                    type="number"
                    step="0.01"
                    value={positionFormData.salarioMin}
                    onChange={(e) => setPositionFormData({ ...positionFormData, salarioMin: e.target.value })}
                    placeholder="0.00"
                  />
                </FormField>
                <FormField label="Salário Máximo">
                  <Input
                    type="number"
                    step="0.01"
                    value={positionFormData.salarioMax}
                    onChange={(e) => setPositionFormData({ ...positionFormData, salarioMax: e.target.value })}
                    placeholder="0.00"
                  />
                </FormField>
              </div>
              <FormField label="Status">
                <FormSelect
                  value={positionFormData.status}
                  onChange={(e) =>
                    setPositionFormData({
                      ...positionFormData,
                      status: e.target.value as "ativo" | "inativo" | "arquivado",
                    })
                  }
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="arquivado">Arquivado</option>
                </FormSelect>
              </FormField>
              <div className="flex gap-[var(--space-3)] pt-[var(--space-4)]">
                <Button type="submit" className="flex-1">
                  {editingPosition ? "Atualizar" : "Criar"} Cargo
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowForm(false);
                    resetPositionForm();
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}
        </GlassCard>
      ) : (
        <GlassCard>
          {activeTab === "departments" && (
            <div className="flex flex-col gap-[var(--space-3)]">
              {departments.length === 0 ? (
                <div className="py-[var(--space-8)] text-center text-[color-mix(in_oklab,var(--muted-soft)_70%,var(--fg)_30%)]">
                  Nenhum departamento encontrado. Comece criando um departamento.
                </div>
              ) : (
                departments.map((dept) => (
                  <div
                    key={dept.id}
                    className="flex items-center justify-between rounded-[var(--r-md)] border border-[var(--border)] bg-[color-mix(in_oklab,var(--surface)_95%,transparent)] p-[var(--space-4)] transition-colors hover:border-[var(--primary)]"
                  >
                    <div>
                      <h3 className="font-semibold text-[var(--fg)]">{dept.name}</h3>
                      <p className="text-[var(--fs-sm)] text-[color-mix(in_oklab,var(--muted-soft)_70%,var(--fg)_30%)]">
                        {dept.code} {dept.description && `• ${dept.description}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-[var(--space-2)]">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditNode({ type: "department", id: dept.id, data: dept })}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNode({ type: "department", id: dept.id, data: dept })}
                        className="text-[var(--danger)] hover:text-[var(--danger)]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "sectors" && (
            <div className="flex flex-col gap-[var(--space-3)]">
              {sectors.length === 0 ? (
                <div className="py-[var(--space-8)] text-center text-[color-mix(in_oklab,var(--muted-soft)_70%,var(--fg)_30%)]">
                  Nenhum setor encontrado. Comece criando um setor.
                </div>
              ) : (
                sectors.map((sector) => {
                  const dept = departments.find((d) => d.id === sector.departmentId);
                  return (
                    <div
                      key={sector.id}
                      className="flex items-center justify-between rounded-[var(--r-md)] border border-[var(--border)] bg-[color-mix(in_oklab,var(--surface)_95%,transparent)] p-[var(--space-4)] transition-colors hover:border-[var(--primary)]"
                    >
                      <div>
                        <h3 className="font-semibold text-[var(--fg)]">{sector.name}</h3>
                        <p className="text-[var(--fs-sm)] text-[color-mix(in_oklab,var(--muted-soft)_70%,var(--fg)_30%)]">
                          {sector.code} {dept && `• ${dept.name}`} {sector.description && `• ${sector.description}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-[var(--space-2)]">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditNode({ type: "sector", id: sector.id, data: sector })}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNode({ type: "sector", id: sector.id, data: sector })}
                          className="text-[var(--danger)] hover:text-[var(--danger)]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === "positions" && (
            <div className="flex flex-col gap-[var(--space-3)]">
              {positions.length === 0 ? (
                <div className="py-[var(--space-8)] text-center text-[color-mix(in_oklab,var(--muted-soft)_70%,var(--fg)_30%)]">
                  Nenhum cargo encontrado. Comece criando um cargo.
                </div>
              ) : (
                positions.map((position) => {
                  const sector = sectors.find((s) => s.id === position.sectorId);
                  const dept = sector ? departments.find((d) => d.id === sector.departmentId) : null;
                  return (
                    <div
                      key={position.id}
                      className="flex items-center justify-between rounded-[var(--r-md)] border border-[var(--border)] bg-[color-mix(in_oklab,var(--surface)_95%,transparent)] p-[var(--space-4)] transition-colors hover:border-[var(--primary)]"
                    >
                      <div>
                        <h3 className="font-semibold text-[var(--fg)]">{position.name}</h3>
                        <p className="text-[var(--fs-sm)] text-[color-mix(in_oklab,var(--muted-soft)_70%,var(--fg)_30%)]">
                          {position.code} {sector && `• ${sector.name}`} {dept && `• ${dept.name}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-[var(--space-2)]">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditNode({ type: "position", id: position.id, data: position })}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNode({ type: "position", id: position.id, data: position })}
                          className="text-[var(--danger)] hover:text-[var(--danger)]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
}

