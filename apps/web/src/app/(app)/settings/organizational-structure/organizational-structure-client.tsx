"use client";

import { Button, cn, FormField, FormSelect, FormTextarea, GlassCard, Input } from "@morina/ui";
import {
  ArrowDown,
  ArrowUp,
  Briefcase,
  Building2,
  Edit,
  FolderTree,
  Network,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { notificationCenter } from "@/components/notifications/notification-center";
import {
  type DepartmentNode,
  OrganizationTree,
  type PositionNode,
  type SectorNode,
} from "@/components/organizational-structure/organization-tree";
import { getAuthHeadersWithTenant } from "@/lib/auth-client";

type Department = {
  departmentId: string;
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
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "code" | "createdAt">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showForm, setShowForm] = useState(false);
  const [selectedNode, setSelectedNode] = useState<{
    type: "department" | "sector" | "position";
    id: string;
  } | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form states
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);

  const [users, setUsers] = useState<
    Array<{ userId: string; email: string; displayName: string | null }>
  >([]);

  const [departmentFormData, setDepartmentFormData] = useState({
    name: "",
    code: "",
    sigla: "",
    description: "",
    finalidade: "",
    responsavelId: "",
    parentId: "",
    status: "ativo" as "ativo" | "inativo" | "arquivado",
    ordem: 0,
  });

  const [sectorFormData, setSectorFormData] = useState({
    name: "",
    code: "",
    description: "",
    departmentId: "",
    responsavelId: "",
    politicaInterna: "",
    atribuicoes: "",
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
    senioridade: "",
    acoesPermitidas: "",
    kpis: "",
    salarioMin: "",
    salarioMax: "",
    status: "ativo" as "ativo" | "inativo" | "arquivado",
    ordem: 0,
  });

  // Carregar usuários
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

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
  }, [activeTab, loadAllData, loadData]);

  // Carregar dados quando a busca ou filtro mudar (debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadData]);

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
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
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
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
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
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
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

  async function loadUsers() {
    try {
      const response = await fetch("/api/users", {
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: {
          itens: Array<{ userId: string; email: string; displayName: string | null }>;
        } = await response.json();
        setUsers(data.itens || []);
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    }
  }

  // Construir árvore hierárquica
  const hierarchyTree = useMemo((): DepartmentNode[] => {
    const deptMap = new Map<string, DepartmentNode>();

    // Criar nós de departamentos
    departments.forEach((dept) => {
      deptMap.set(dept.departmentId, {
        id: dept.departmentId,
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
        d.sectors?.some((s) => s.id === position.sectorId),
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
      const dept = departments.find((d) => d.departmentId === node.id);
      if (dept) {
        setEditingDepartment(dept);
        const metadata =
          (dept as unknown as { metadata?: Record<string, unknown> | null })?.metadata || {};
        setDepartmentFormData({
          name: dept.name,
          code: dept.code,
          sigla: (metadata.sigla as string) || "",
          description: dept.description || "",
          finalidade: (metadata.finalidade as string) || "",
          responsavelId: (metadata.responsavelId as string) || "",
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
        const metadata =
          (sector as unknown as { metadata?: Record<string, unknown> | null })?.metadata || {};
        setSectorFormData({
          name: sector.name,
          code: sector.code,
          description: sector.description || "",
          departmentId: sector.departmentId,
          responsavelId: (metadata.responsavelId as string) || "",
          politicaInterna: (metadata.politicaInterna as string) || "",
          atribuicoes: (metadata.atribuicoes as string) || "",
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
        const metadata =
          (position as unknown as { metadata?: Record<string, unknown> | null })?.metadata || {};
        setPositionFormData({
          name: position.name,
          code: position.code,
          description: position.description || "",
          sectorId: position.sectorId,
          responsabilidades: position.responsabilidades || "",
          requisitos: position.requisitos || "",
          senioridade: (metadata.senioridade as string) || "",
          acoesPermitidas: (metadata.acoesPermitidas as string) || "",
          kpis: (metadata.kpis as string) || "",
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

    setDeleting(node.id);
    try {
      let url = "";
      if (node.type === "department") {
        // node.id já contém o ID correto (departmentId, sectorId ou positionId)
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
    } finally {
      setDeleting(null);
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
      sigla: "",
      description: "",
      finalidade: "",
      responsavelId: "",
      parentId: "",
      status: "ativo",
      ordem: 0,
    });
    setEditingDepartment(null);
    setFormErrors({});
    setSubmitting(false);
  };

  const resetSectorForm = () => {
    setSectorFormData({
      name: "",
      code: "",
      description: "",
      departmentId: "",
      responsavelId: "",
      politicaInterna: "",
      atribuicoes: "",
      parentId: "",
      status: "ativo",
      ordem: 0,
    });
    setEditingSector(null);
    setFormErrors({});
    setSubmitting(false);
  };

  const resetPositionForm = () => {
    setPositionFormData({
      name: "",
      code: "",
      description: "",
      sectorId: "",
      responsabilidades: "",
      requisitos: "",
      senioridade: "",
      acoesPermitidas: "",
      kpis: "",
      salarioMin: "",
      salarioMax: "",
      status: "ativo",
      ordem: 0,
    });
    setEditingPosition(null);
    setFormErrors({});
    setSubmitting(false);
  };

  function validateDepartmentForm(): boolean {
    const errors: Record<string, string> = {};

    if (!departmentFormData.name.trim()) {
      errors.name = "Nome é obrigatório";
    } else if (departmentFormData.name.length < 2) {
      errors.name = "Nome deve ter no mínimo 2 caracteres";
    }

    if (!departmentFormData.code.trim()) {
      errors.code = "Código é obrigatório";
    } else if (departmentFormData.code.length < 2) {
      errors.code = "Código deve ter no mínimo 2 caracteres";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleDepartmentSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateDepartmentForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const url = editingDepartment
        ? `/api/departments/${editingDepartment.departmentId}`
        : "/api/departments";
      const method = editingDepartment ? "PUT" : "POST";

      const body = {
        ...departmentFormData,
        parentId: departmentFormData.parentId || null,
        description: departmentFormData.description || null,
        metadata: {
          ...(departmentFormData.responsavelId && {
            responsavelId: departmentFormData.responsavelId,
          }),
          ...(departmentFormData.finalidade && { finalidade: departmentFormData.finalidade }),
          ...(departmentFormData.sigla && { sigla: departmentFormData.sigla }),
        },
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
        setFormErrors({});
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
    } finally {
      setSubmitting(false);
    }
  }

  function validateSectorForm(): boolean {
    const errors: Record<string, string> = {};

    if (!sectorFormData.name.trim()) {
      errors.name = "Nome é obrigatório";
    } else if (sectorFormData.name.length < 2) {
      errors.name = "Nome deve ter no mínimo 2 caracteres";
    }

    if (!sectorFormData.code.trim()) {
      errors.code = "Código é obrigatório";
    } else if (sectorFormData.code.length < 2) {
      errors.code = "Código deve ter no mínimo 2 caracteres";
    }

    if (!sectorFormData.departmentId) {
      errors.departmentId = "Departamento é obrigatório";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSectorSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateSectorForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const url = editingSector ? `/api/sectors/${editingSector.id}` : "/api/sectors";
      const method = editingSector ? "PUT" : "POST";

      const body = {
        ...sectorFormData,
        departmentId: sectorFormData.departmentId,
        parentId: sectorFormData.parentId || null,
        description: sectorFormData.description || null,
        metadata: {
          ...(sectorFormData.responsavelId && { responsavelId: sectorFormData.responsavelId }),
          ...(sectorFormData.politicaInterna && {
            politicaInterna: sectorFormData.politicaInterna,
          }),
          ...(sectorFormData.atribuicoes && { atribuicoes: sectorFormData.atribuicoes }),
        },
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
        setFormErrors({});
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
    } finally {
      setSubmitting(false);
    }
  }

  function validatePositionForm(): boolean {
    const errors: Record<string, string> = {};

    if (!positionFormData.name.trim()) {
      errors.name = "Nome é obrigatório";
    } else if (positionFormData.name.length < 2) {
      errors.name = "Nome deve ter no mínimo 2 caracteres";
    }

    if (!positionFormData.code.trim()) {
      errors.code = "Código é obrigatório";
    } else if (positionFormData.code.length < 2) {
      errors.code = "Código deve ter no mínimo 2 caracteres";
    }

    if (!positionFormData.sectorId) {
      errors.sectorId = "Setor é obrigatório";
    }

    if (positionFormData.salarioMin && positionFormData.salarioMax) {
      const min = Number(positionFormData.salarioMin);
      const max = Number(positionFormData.salarioMax);
      if (min > max) {
        errors.salarioMax = "Salário máximo deve ser maior que o mínimo";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handlePositionSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validatePositionForm()) {
      return;
    }

    setSubmitting(true);
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
        metadata: {
          ...(positionFormData.senioridade && { senioridade: positionFormData.senioridade }),
          ...(positionFormData.acoesPermitidas && {
            acoesPermitidas: positionFormData.acoesPermitidas,
          }),
          ...(positionFormData.kpis && { kpis: positionFormData.kpis }),
        },
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
        setFormErrors({});
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
    } finally {
      setSubmitting(false);
    }
  }

  // Função de ordenação
  const sortItems = <T extends { name: string; code: string; createdAt: string }>(
    items: T[],
  ): T[] => {
    return [...items].sort((a, b) => {
      let comparison = 0;

      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" });
      } else if (sortBy === "code") {
        comparison = a.code.localeCompare(b.code, "pt-BR", { sensitivity: "base" });
      } else if (sortBy === "createdAt") {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
  };

  // Itens ordenados
  const sortedDepartments = useMemo(() => sortItems(departments), [departments, sortItems]);
  const sortedSectors = useMemo(() => sortItems(sectors), [sectors, sortItems]);
  const sortedPositions = useMemo(() => sortItems(positions), [positions, sortItems]);

  // Calcular estatísticas
  const stats = useMemo(() => {
    const totalDepartments = departments.length;
    const totalSectors = sectors.length;
    const totalPositions = positions.length;
    const activeDepartments = departments.filter((d) => d.status === "ativo").length;
    const activeSectors = sectors.filter((s) => s.status === "ativo").length;
    const activePositions = positions.filter((p) => p.status === "ativo").length;

    return {
      totalDepartments,
      totalSectors,
      totalPositions,
      activeDepartments,
      activeSectors,
      activePositions,
    };
  }, [departments, sectors, positions]);

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      {/* Cards de Estatísticas */}
      {activeTab === "hierarchy" && !loading && (
        <div className="grid gap-[var(--space-4)] md:grid-cols-3">
          <GlassCard>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-[var(--fs-sm)] text-[color-mix(in_oklab,var(--muted-soft)_70%,var(--fg)_30%)]">
                  Departamentos
                </p>
                <p className="mt-[var(--space-1)] text-[var(--fs-2xl)] font-bold text-[var(--fg)]">
                  {stats.totalDepartments}
                </p>
                <p className="mt-[var(--space-1)] text-[var(--fs-xs)] text-[var(--success)]">
                  {stats.activeDepartments} ativo{stats.activeDepartments !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="rounded-[var(--r-md)] bg-[color-mix(in_oklab,var(--primary)_15%,transparent)] p-[var(--space-3)]">
                <Building2 className="h-6 w-6 text-[var(--primary)]" />
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-[var(--fs-sm)] text-[color-mix(in_oklab,var(--muted-soft)_70%,var(--fg)_30%)]">
                  Setores
                </p>
                <p className="mt-[var(--space-1)] text-[var(--fs-2xl)] font-bold text-[var(--fg)]">
                  {stats.totalSectors}
                </p>
                <p className="mt-[var(--space-1)] text-[var(--fs-xs)] text-[var(--success)]">
                  {stats.activeSectors} ativo{stats.activeSectors !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="rounded-[var(--r-md)] bg-[color-mix(in_oklab,var(--primary)_15%,transparent)] p-[var(--space-3)]">
                <FolderTree className="h-6 w-6 text-[var(--primary)]" />
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-[var(--fs-sm)] text-[color-mix(in_oklab,var(--muted-soft)_70%,var(--fg)_30%)]">
                  Cargos
                </p>
                <p className="mt-[var(--space-1)] text-[var(--fs-2xl)] font-bold text-[var(--fg)]">
                  {stats.totalPositions}
                </p>
                <p className="mt-[var(--space-1)] text-[var(--fs-xs)] text-[var(--success)]">
                  {stats.activePositions} ativo{stats.activePositions !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="rounded-[var(--r-md)] bg-[color-mix(in_oklab,var(--primary)_15%,transparent)] p-[var(--space-3)]">
                <Briefcase className="h-6 w-6 text-[var(--primary)]" />
              </div>
            </div>
          </GlassCard>
        </div>
      )}

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
          <div className="flex flex-1 items-center gap-[var(--space-3)]">
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
            <FormSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-[180px]"
            >
              <option value="all">Todos os status</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
              <option value="arquivado">Arquivado</option>
            </FormSelect>
            <FormSelect
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "name" | "code" | "createdAt")}
              className="w-[160px]"
            >
              <option value="name">Ordenar por Nome</option>
              <option value="code">Ordenar por Código</option>
              <option value="createdAt">Ordenar por Data</option>
            </FormSelect>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="w-[40px]"
              title={sortOrder === "asc" ? "Ordenar decrescente" : "Ordenar crescente"}
            >
              {sortOrder === "asc" ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
            </Button>
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
        <div className="flex flex-col items-center justify-center gap-[var(--space-4)] py-[var(--space-12)]">
          <svg
            className="h-8 w-8 animate-spin text-[var(--primary)]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-[var(--fs-sm)] text-[color-mix(in_oklab,var(--muted-soft)_70%,var(--fg)_30%)]">
            Carregando...
          </p>
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
              <FormField label="Nome" required error={formErrors.name}>
                <Input
                  value={departmentFormData.name}
                  onChange={(e) => {
                    setDepartmentFormData({ ...departmentFormData, name: e.target.value });
                    if (formErrors.name) setFormErrors({ ...formErrors, name: "" });
                  }}
                  placeholder="Nome do departamento"
                  required
                />
              </FormField>
              <FormField label="Código" required error={formErrors.code}>
                <Input
                  value={departmentFormData.code}
                  onChange={(e) => {
                    setDepartmentFormData({ ...departmentFormData, code: e.target.value });
                    if (formErrors.code) setFormErrors({ ...formErrors, code: "" });
                  }}
                  placeholder="Código único (ex: DPT-001)"
                  required
                />
              </FormField>
              <FormField label="Sigla">
                <Input
                  value={departmentFormData.sigla}
                  onChange={(e) =>
                    setDepartmentFormData({ ...departmentFormData, sigla: e.target.value })
                  }
                  placeholder="Sigla do departamento (ex: RH, TI, FIN)"
                  maxLength={10}
                />
              </FormField>
              <FormField label="Descrição">
                <FormTextarea
                  value={departmentFormData.description}
                  onChange={(e) =>
                    setDepartmentFormData({ ...departmentFormData, description: e.target.value })
                  }
                  placeholder="Descrição do departamento"
                  rows={3}
                />
              </FormField>
              <FormField label="Finalidade">
                <FormTextarea
                  value={departmentFormData.finalidade}
                  onChange={(e) =>
                    setDepartmentFormData({ ...departmentFormData, finalidade: e.target.value })
                  }
                  placeholder="Finalidade do departamento"
                  rows={3}
                />
              </FormField>
              <FormField label="Responsável">
                <FormSelect
                  value={departmentFormData.responsavelId}
                  onChange={(e) =>
                    setDepartmentFormData({ ...departmentFormData, responsavelId: e.target.value })
                  }
                >
                  <option value="">Nenhum</option>
                  {users.map((user) => (
                    <option key={user.userId} value={user.userId}>
                      {user.displayName || user.email} ({user.email})
                    </option>
                  ))}
                </FormSelect>
              </FormField>
              <FormField label="Departamento Pai">
                <FormSelect
                  value={departmentFormData.parentId}
                  onChange={(e) =>
                    setDepartmentFormData({ ...departmentFormData, parentId: e.target.value })
                  }
                >
                  <option value="">Nenhum</option>
                  {departments
                    .filter((d) => d.departmentId !== editingDepartment?.departmentId)
                    .map((dept) => (
                      <option key={dept.departmentId} value={dept.departmentId}>
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
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? (
                    <>
                      <svg
                        className="h-4 w-4 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Salvando...
                    </>
                  ) : (
                    `${editingDepartment ? "Atualizar" : "Criar"} Departamento`
                  )}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowForm(false);
                    resetDepartmentForm();
                  }}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}

          {activeTab === "sectors" && (
            <form onSubmit={handleSectorSubmit} className="flex flex-col gap-[var(--space-4)]">
              <FormField label="Nome" required error={formErrors.name}>
                <Input
                  value={sectorFormData.name}
                  onChange={(e) => {
                    setSectorFormData({ ...sectorFormData, name: e.target.value });
                    if (formErrors.name) setFormErrors({ ...formErrors, name: "" });
                  }}
                  placeholder="Nome do setor"
                  required
                />
              </FormField>
              <FormField label="Código" required error={formErrors.code}>
                <Input
                  value={sectorFormData.code}
                  onChange={(e) => {
                    setSectorFormData({ ...sectorFormData, code: e.target.value });
                    if (formErrors.code) setFormErrors({ ...formErrors, code: "" });
                  }}
                  placeholder="Código único (ex: SEC-001)"
                  required
                />
              </FormField>
              <FormField label="Descrição">
                <FormTextarea
                  value={sectorFormData.description}
                  onChange={(e) =>
                    setSectorFormData({ ...sectorFormData, description: e.target.value })
                  }
                  placeholder="Descrição do setor"
                  rows={3}
                />
              </FormField>
              <FormField label="Departamento" required error={formErrors.departmentId}>
                <FormSelect
                  value={sectorFormData.departmentId}
                  onChange={(e) => {
                    setSectorFormData({ ...sectorFormData, departmentId: e.target.value });
                    if (formErrors.departmentId) setFormErrors({ ...formErrors, departmentId: "" });
                  }}
                  required
                >
                  <option value="">Selecione um departamento</option>
                  {departments.map((dept) => (
                    <option key={dept.departmentId} value={dept.departmentId}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </FormSelect>
              </FormField>
              <FormField label="Responsável">
                <FormSelect
                  value={sectorFormData.responsavelId}
                  onChange={(e) =>
                    setSectorFormData({ ...sectorFormData, responsavelId: e.target.value })
                  }
                >
                  <option value="">Nenhum</option>
                  {users.map((user) => (
                    <option key={user.userId} value={user.userId}>
                      {user.displayName || user.email} ({user.email})
                    </option>
                  ))}
                </FormSelect>
              </FormField>
              <FormField label="Política Interna">
                <FormTextarea
                  value={sectorFormData.politicaInterna}
                  onChange={(e) =>
                    setSectorFormData({ ...sectorFormData, politicaInterna: e.target.value })
                  }
                  placeholder="Políticas internas do setor"
                  rows={4}
                />
              </FormField>
              <FormField label="Atribuições">
                <FormTextarea
                  value={sectorFormData.atribuicoes}
                  onChange={(e) =>
                    setSectorFormData({ ...sectorFormData, atribuicoes: e.target.value })
                  }
                  placeholder="Atribuições do setor"
                  rows={4}
                />
              </FormField>
              <FormField label="Setor Pai">
                <FormSelect
                  value={sectorFormData.parentId}
                  onChange={(e) =>
                    setSectorFormData({ ...sectorFormData, parentId: e.target.value })
                  }
                >
                  <option value="">Nenhum</option>
                  {sectors
                    .filter(
                      (s) =>
                        s.departmentId === sectorFormData.departmentId &&
                        s.id !== editingSector?.id,
                    )
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
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? (
                    <>
                      <svg
                        className="h-4 w-4 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Salvando...
                    </>
                  ) : (
                    `${editingSector ? "Atualizar" : "Criar"} Setor`
                  )}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowForm(false);
                    resetSectorForm();
                  }}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}

          {activeTab === "positions" && (
            <form onSubmit={handlePositionSubmit} className="flex flex-col gap-[var(--space-4)]">
              <FormField label="Nome" required error={formErrors.name}>
                <Input
                  value={positionFormData.name}
                  onChange={(e) => {
                    setPositionFormData({ ...positionFormData, name: e.target.value });
                    if (formErrors.name) setFormErrors({ ...formErrors, name: "" });
                  }}
                  placeholder="Nome do cargo"
                  required
                />
              </FormField>
              <FormField label="Código" required error={formErrors.code}>
                <Input
                  value={positionFormData.code}
                  onChange={(e) => {
                    setPositionFormData({ ...positionFormData, code: e.target.value });
                    if (formErrors.code) setFormErrors({ ...formErrors, code: "" });
                  }}
                  placeholder="Código único (ex: POS-001)"
                  required
                />
              </FormField>
              <FormField label="Descrição">
                <FormTextarea
                  value={positionFormData.description}
                  onChange={(e) =>
                    setPositionFormData({ ...positionFormData, description: e.target.value })
                  }
                  placeholder="Descrição do cargo"
                  rows={3}
                />
              </FormField>
              <FormField label="Setor" required error={formErrors.sectorId}>
                <FormSelect
                  value={positionFormData.sectorId}
                  onChange={(e) => {
                    setPositionFormData({ ...positionFormData, sectorId: e.target.value });
                    if (formErrors.sectorId) setFormErrors({ ...formErrors, sectorId: "" });
                  }}
                  required
                >
                  <option value="">Selecione um setor</option>
                  {sectors.map((sector) => {
                    const dept = departments.find((d) => d.departmentId === sector.departmentId);
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
                  onChange={(e) =>
                    setPositionFormData({ ...positionFormData, responsabilidades: e.target.value })
                  }
                  placeholder="Responsabilidades do cargo"
                  rows={4}
                />
              </FormField>
              <FormField label="Requisitos">
                <FormTextarea
                  value={positionFormData.requisitos}
                  onChange={(e) =>
                    setPositionFormData({ ...positionFormData, requisitos: e.target.value })
                  }
                  placeholder="Requisitos para ocupar o cargo"
                  rows={4}
                />
              </FormField>
              <FormField label="Senioridade">
                <FormSelect
                  value={positionFormData.senioridade}
                  onChange={(e) =>
                    setPositionFormData({ ...positionFormData, senioridade: e.target.value })
                  }
                >
                  <option value="">Nenhuma</option>
                  <option value="estagiario">Estagiário</option>
                  <option value="junior">Júnior</option>
                  <option value="pleno">Pleno</option>
                  <option value="senior">Sênior</option>
                  <option value="especialista">Especialista</option>
                  <option value="coordenador">Coordenador</option>
                  <option value="gerente">Gerente</option>
                  <option value="diretor">Diretor</option>
                </FormSelect>
              </FormField>
              <FormField label="Ações Permitidas">
                <FormTextarea
                  value={positionFormData.acoesPermitidas}
                  onChange={(e) =>
                    setPositionFormData({ ...positionFormData, acoesPermitidas: e.target.value })
                  }
                  placeholder="Ações permitidas para este cargo (separadas por vírgula ou linha)"
                  rows={3}
                />
              </FormField>
              <FormField label="KPIs">
                <FormTextarea
                  value={positionFormData.kpis}
                  onChange={(e) =>
                    setPositionFormData({ ...positionFormData, kpis: e.target.value })
                  }
                  placeholder="Indicadores de performance (KPIs) para este cargo (separados por vírgula ou linha)"
                  rows={3}
                />
              </FormField>
              <div className="grid grid-cols-2 gap-[var(--space-4)]">
                <FormField label="Salário Mínimo">
                  <Input
                    type="number"
                    step="0.01"
                    value={positionFormData.salarioMin}
                    onChange={(e) => {
                      setPositionFormData({ ...positionFormData, salarioMin: e.target.value });
                      if (formErrors.salarioMax) setFormErrors({ ...formErrors, salarioMax: "" });
                    }}
                    placeholder="0.00"
                  />
                </FormField>
                <FormField label="Salário Máximo" error={formErrors.salarioMax}>
                  <Input
                    type="number"
                    step="0.01"
                    value={positionFormData.salarioMax}
                    onChange={(e) => {
                      setPositionFormData({ ...positionFormData, salarioMax: e.target.value });
                      if (formErrors.salarioMax) setFormErrors({ ...formErrors, salarioMax: "" });
                    }}
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
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? (
                    <>
                      <svg
                        className="h-4 w-4 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Salvando...
                    </>
                  ) : (
                    `${editingPosition ? "Atualizar" : "Criar"} Cargo`
                  )}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowForm(false);
                    resetPositionForm();
                  }}
                  disabled={submitting}
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
                sortedDepartments.map((dept) => {
                  const metadata =
                    (
                      dept as unknown as {
                        metadata?: { sigla?: string; responsavelId?: string } | null;
                      }
                    )?.metadata || {};
                  const responsavel = metadata.responsavelId
                    ? users.find((u) => u.userId === metadata.responsavelId)
                    : null;
                  return (
                    <div
                      key={dept.departmentId}
                      className="flex items-center justify-between rounded-[var(--r-md)] border border-[var(--border)] bg-[color-mix(in_oklab,var(--surface)_95%,transparent)] p-[var(--space-4)] transition-colors hover:border-[var(--primary)]"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-[var(--space-2)]">
                          <h3 className="font-semibold text-[var(--fg)]">{dept.name}</h3>
                          <span
                            className={cn(
                              "rounded-[var(--r-sm)] px-[var(--space-2)] py-0.5 text-[var(--fs-xs)] font-medium uppercase",
                              dept.status === "ativo"
                                ? "bg-[color-mix(in_oklab,var(--success)_20%,transparent)] text-[var(--success)]"
                                : dept.status === "inativo"
                                  ? "bg-[color-mix(in_oklab,var(--warning)_20%,transparent)] text-[var(--warning)]"
                                  : "bg-[color-mix(in_oklab,var(--muted-soft)_20%,transparent)] text-[color-mix(in_oklab,var(--muted-soft)_70%,var(--fg)_30%)]",
                            )}
                          >
                            {dept.status === "ativo"
                              ? "Ativo"
                              : dept.status === "inativo"
                                ? "Inativo"
                                : "Arquivado"}
                          </span>
                        </div>
                        <p className="mt-[var(--space-1)] text-[var(--fs-sm)] text-[color-mix(in_oklab,var(--muted-soft)_70%,var(--fg)_30%)]">
                          {dept.code} {metadata.sigla && `(${metadata.sigla})`}{" "}
                          {dept.description && `• ${dept.description}`}
                          {responsavel && (
                            <>
                              {" • "}
                              <span className="font-medium">
                                Responsável: {responsavel.displayName || responsavel.email}
                              </span>
                            </>
                          )}
                          {sectors.filter((s) => s.departmentId === dept.departmentId).length >
                            0 && (
                            <>
                              {" • "}
                              <span className="font-medium">
                                {sectors.filter((s) => s.departmentId === dept.departmentId).length}{" "}
                                {sectors.filter((s) => s.departmentId === dept.departmentId)
                                  .length === 1
                                  ? "setor"
                                  : "setores"}
                              </span>
                            </>
                          )}
                        </p>
                        {dept.createdAt && (
                          <p className="mt-[var(--space-1)] text-[var(--fs-xs)] text-[color-mix(in_oklab,var(--muted-soft)_60%,var(--fg)_40%)]">
                            Criado em{" "}
                            {new Date(dept.createdAt).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-[var(--space-2)]">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleEditNode({
                              type: "department",
                              id: dept.departmentId,
                              data: dept,
                            })
                          }
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleDeleteNode({
                              type: "department",
                              id: dept.departmentId,
                              data: dept,
                            })
                          }
                          className="text-[var(--danger)] hover:text-[var(--danger)]"
                          disabled={deleting === dept.departmentId}
                        >
                          {deleting === dept.departmentId ? (
                            <svg
                              className="h-4 w-4 animate-spin"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })
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
                sortedSectors.map((sector) => {
                  const dept = departments.find((d) => d.departmentId === sector.departmentId);
                  const metadata =
                    (sector as unknown as { metadata?: { responsavelId?: string } | null })
                      ?.metadata || {};
                  const responsavel = metadata.responsavelId
                    ? users.find((u) => u.userId === metadata.responsavelId)
                    : null;
                  return (
                    <div
                      key={sector.id}
                      className="flex items-center justify-between rounded-[var(--r-md)] border border-[var(--border)] bg-[color-mix(in_oklab,var(--surface)_95%,transparent)] p-[var(--space-4)] transition-colors hover:border-[var(--primary)]"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-[var(--space-2)]">
                          <h3 className="font-semibold text-[var(--fg)]">{sector.name}</h3>
                          <span
                            className={cn(
                              "rounded-[var(--r-sm)] px-[var(--space-2)] py-0.5 text-[var(--fs-xs)] font-medium uppercase",
                              sector.status === "ativo"
                                ? "bg-[color-mix(in_oklab,var(--success)_20%,transparent)] text-[var(--success)]"
                                : sector.status === "inativo"
                                  ? "bg-[color-mix(in_oklab,var(--warning)_20%,transparent)] text-[var(--warning)]"
                                  : "bg-[color-mix(in_oklab,var(--muted-soft)_20%,transparent)] text-[color-mix(in_oklab,var(--muted-soft)_70%,var(--fg)_30%)]",
                            )}
                          >
                            {sector.status === "ativo"
                              ? "Ativo"
                              : sector.status === "inativo"
                                ? "Inativo"
                                : "Arquivado"}
                          </span>
                        </div>
                        <p className="mt-[var(--space-1)] text-[var(--fs-sm)] text-[color-mix(in_oklab,var(--muted-soft)_70%,var(--fg)_30%)]">
                          {sector.code} {dept && `• ${dept.name}`}{" "}
                          {sector.description && `• ${sector.description}`}
                          {responsavel && (
                            <>
                              {" • "}
                              <span className="font-medium">
                                Responsável: {responsavel.displayName || responsavel.email}
                              </span>
                            </>
                          )}
                          {positions.filter((p) => p.sectorId === sector.id).length > 0 && (
                            <>
                              {" • "}
                              <span className="font-medium">
                                {positions.filter((p) => p.sectorId === sector.id).length}{" "}
                                {positions.filter((p) => p.sectorId === sector.id).length === 1
                                  ? "cargo"
                                  : "cargos"}
                              </span>
                            </>
                          )}
                        </p>
                        {sector.createdAt && (
                          <p className="mt-[var(--space-1)] text-[var(--fs-xs)] text-[color-mix(in_oklab,var(--muted-soft)_60%,var(--fg)_40%)]">
                            Criado em{" "}
                            {new Date(sector.createdAt).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-[var(--space-2)]">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleEditNode({ type: "sector", id: sector.id, data: sector })
                          }
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleDeleteNode({ type: "sector", id: sector.id, data: sector })
                          }
                          className="text-[var(--danger)] hover:text-[var(--danger)]"
                          disabled={deleting === sector.id}
                        >
                          {deleting === sector.id ? (
                            <svg
                              className="h-4 w-4 animate-spin"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
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
                sortedPositions.map((position) => {
                  const sector = sectors.find((s) => s.id === position.sectorId);
                  const dept = sector
                    ? departments.find((d) => d.departmentId === sector.departmentId)
                    : null;
                  return (
                    <div
                      key={position.id}
                      className="flex items-center justify-between rounded-[var(--r-md)] border border-[var(--border)] bg-[color-mix(in_oklab,var(--surface)_95%,transparent)] p-[var(--space-4)] transition-colors hover:border-[var(--primary)]"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-[var(--space-2)]">
                          <h3 className="font-semibold text-[var(--fg)]">{position.name}</h3>
                          <span
                            className={cn(
                              "rounded-[var(--r-sm)] px-[var(--space-2)] py-0.5 text-[var(--fs-xs)] font-medium uppercase",
                              position.status === "ativo"
                                ? "bg-[color-mix(in_oklab,var(--success)_20%,transparent)] text-[var(--success)]"
                                : position.status === "inativo"
                                  ? "bg-[color-mix(in_oklab,var(--warning)_20%,transparent)] text-[var(--warning)]"
                                  : "bg-[color-mix(in_oklab,var(--muted-soft)_20%,transparent)] text-[color-mix(in_oklab,var(--muted-soft)_70%,var(--fg)_30%)]",
                            )}
                          >
                            {position.status === "ativo"
                              ? "Ativo"
                              : position.status === "inativo"
                                ? "Inativo"
                                : "Arquivado"}
                          </span>
                          {(position as unknown as { metadata?: { senioridade?: string } }).metadata
                            ?.senioridade && (
                            <span className="rounded-[var(--r-sm)] bg-[color-mix(in_oklab,var(--primary)_15%,transparent)] px-[var(--space-2)] py-0.5 text-[var(--fs-xs)] font-medium capitalize text-[var(--primary)]">
                              {(
                                (position as unknown as { metadata?: { senioridade?: string } })
                                  .metadata?.senioridade || ""
                              )
                                .split("-")
                                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(" ")}
                            </span>
                          )}
                        </div>
                        <p className="mt-[var(--space-1)] text-[var(--fs-sm)] text-[color-mix(in_oklab,var(--muted-soft)_70%,var(--fg)_30%)]">
                          {position.code} {sector && `• ${sector.name}`} {dept && `• ${dept.name}`}
                          {position.salarioMin && position.salarioMax && (
                            <>
                              {" • "}
                              R${" "}
                              {Number(position.salarioMin).toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}{" "}
                              - R${" "}
                              {Number(position.salarioMax).toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </>
                          )}
                        </p>
                        {position.createdAt && (
                          <p className="mt-[var(--space-1)] text-[var(--fs-xs)] text-[color-mix(in_oklab,var(--muted-soft)_60%,var(--fg)_40%)]">
                            Criado em{" "}
                            {new Date(position.createdAt).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-[var(--space-2)]">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleEditNode({ type: "position", id: position.id, data: position })
                          }
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleDeleteNode({ type: "position", id: position.id, data: position })
                          }
                          className="text-[var(--danger)] hover:text-[var(--danger)]"
                          disabled={deleting === position.id}
                        >
                          {deleting === position.id ? (
                            <svg
                              className="h-4 w-4 animate-spin"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
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
