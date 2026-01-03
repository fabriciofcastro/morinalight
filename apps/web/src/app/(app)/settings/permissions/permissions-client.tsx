"use client";

import { Button, cn, GlassCard, Input } from "@morina/ui";
import {
  Briefcase,
  Building2,
  Check,
  FileText,
  History,
  Layers,
  Plus,
  Save,
  Search,
  Shield,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AuditLogPanel } from "./AuditLogPanel";

const getAuthHeadersWithTenant = () => ({});

type Permission = {
  id: string;
  name: string;
  description: string;
  module: string;
  category: string;
};

type AppUser = {
  userId: string;
  email: string;
  displayName: string | null;
  role: string;
  permissions: string[];
};

type Role = {
  id: string;
  name: string;
  description: string;
  permissions: string[];
};

type Position = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  sectorId: string;
  status: "ativo" | "inativo" | "arquivado";
};

type PositionPermission = {
  id: string;
  positionId: string;
  permissionId: string;
  permissionKey: string;
  permissionName: string;
  granted: boolean;
};

type Tab = "users" | "positions" | "sectors" | "departments" | "templates" | "audit-log";

type PermissionTemplate = {
  id: string;
  name: string;
  description: string | null;
  entityType: "position" | "sector" | "department" | "all";
  permissions: Array<{ permissionId: string; granted: boolean }>;
  isDefault: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
};

// Mock de permissões - substituir por API real
const allPermissions: Permission[] = [
  // Dashboard
  {
    id: "dashboard:view",
    name: "Ver Dashboard",
    description: "Acessar a página inicial",
    module: "Dashboard",
    category: "Visualização",
  },

  // Produtos
  {
    id: "products:view",
    name: "Ver Produtos",
    description: "Visualizar lista de produtos",
    module: "Produtos",
    category: "Visualização",
  },
  {
    id: "products:create",
    name: "Criar Produtos",
    description: "Criar novos produtos",
    module: "Produtos",
    category: "Criação",
  },
  {
    id: "products:edit",
    name: "Editar Produtos",
    description: "Editar produtos existentes",
    module: "Produtos",
    category: "Edição",
  },
  {
    id: "products:delete",
    name: "Excluir Produtos",
    description: "Excluir produtos",
    module: "Produtos",
    category: "Exclusão",
  },

  // Catálogo
  {
    id: "catalog:view",
    name: "Ver Catálogo",
    description: "Acessar catálogo e auditoria",
    module: "Catálogo",
    category: "Visualização",
  },

  // Clientes
  {
    id: "clients:view",
    name: "Ver Clientes",
    description: "Visualizar lista de clientes",
    module: "Clientes",
    category: "Visualização",
  },
  {
    id: "clients:create",
    name: "Criar Clientes",
    description: "Criar novos clientes",
    module: "Clientes",
    category: "Criação",
  },
  {
    id: "clients:edit",
    name: "Editar Clientes",
    description: "Editar clientes existentes",
    module: "Clientes",
    category: "Edição",
  },
  {
    id: "clients:delete",
    name: "Excluir Clientes",
    description: "Excluir clientes",
    module: "Clientes",
    category: "Exclusão",
  },

  // Representantes
  {
    id: "representatives:view",
    name: "Ver Representantes",
    description: "Visualizar representantes",
    module: "Representantes",
    category: "Visualização",
  },
  {
    id: "representatives:create",
    name: "Criar Representantes",
    description: "Criar representantes",
    module: "Representantes",
    category: "Criação",
  },

  // Comissões
  {
    id: "commissions:view",
    name: "Ver Comissões",
    description: "Visualizar comissões",
    module: "Comissões",
    category: "Visualização",
  },
  {
    id: "commissions:pay",
    name: "Pagar Comissões",
    description: "Pagar comissões",
    module: "Comissões",
    category: "Operações",
  },

  // Fornecedores
  {
    id: "suppliers:view",
    name: "Ver Fornecedores",
    description: "Visualizar fornecedores",
    module: "Fornecedores",
    category: "Visualização",
  },

  // Vendas
  {
    id: "sales:view",
    name: "Ver Vendas",
    description: "Visualizar vendas",
    module: "Vendas",
    category: "Visualização",
  },

  // Relatórios
  {
    id: "reports:view",
    name: "Ver Relatórios",
    description: "Acessar relatórios",
    module: "Relatórios",
    category: "Visualização",
  },

  // Configurações
  {
    id: "settings:view",
    name: "Ver Configurações",
    description: "Acessar configurações",
    module: "Configurações",
    category: "Visualização",
  },
  {
    id: "settings:company:view",
    name: "Config. Empresa",
    description: "Editar configurações da empresa",
    module: "Configurações",
    category: "Edição",
  },
  {
    id: "settings:team:view",
    name: "Config. Equipe",
    description: "Gerenciar equipe",
    module: "Configurações",
    category: "Edição",
  },
  {
    id: "settings:permissions:view",
    name: "Config. Permissões",
    description: "Gerenciar permissões",
    module: "Configurações",
    category: "Edição",
  },
];

// Mock de roles - substituir por API real
const roles: Role[] = [
  {
    id: "admin",
    name: "Administrador",
    description: "Acesso total ao sistema",
    permissions: allPermissions.map((p) => p.id),
  },
  {
    id: "manager",
    name: "Gerente",
    description: "Acesso a gestão e relatórios",
    permissions: [
      "dashboard:view",
      "products:view",
      "products:create",
      "products:edit",
      "catalog:view",
      "clients:view",
      "clients:create",
      "clients:edit",
      "representatives:view",
      "commissions:view",
      "sales:view",
      "reports:view",
    ],
  },
  {
    id: "user",
    name: "Usuário",
    description: "Acesso básico de visualização",
    permissions: [
      "dashboard:view",
      "products:view",
      "clients:view",
      "representatives:view",
      "commissions:view",
    ],
  },
];

export function PermissionsClient() {
  const [activeTab, setActiveTab] = useState<Tab>("users");

  // Estados para usuários
  const [users, setUsers] = useState<AppUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [userPermissions, setUserPermissions] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Estados para cargos
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [positionPermissions, setPositionPermissions] = useState<PositionPermission[]>([]);
  const [positionPermissionsSet, setPositionPermissionsSet] = useState<Set<string>>(new Set());
  const [positionSearch, setPositionSearch] = useState("");
  const [positionLoading, setPositionLoading] = useState(false);

  // Estados para setores
  const [sectors, setSectors] = useState<
    Array<{ id: string; name: string; code: string; departmentId: string }>
  >([]);
  const [selectedSector, setSelectedSector] = useState<{
    id: string;
    name: string;
    code: string;
    departmentId: string;
  } | null>(null);
  const [sectorPermissions, setSectorPermissions] = useState<
    Array<{ permissionKey: string; granted: boolean; sectorId?: string; permissionId: string }>
  >([]);
  const [sectorPermissionsSet, setSectorPermissionsSet] = useState<Set<string>>(new Set());
  const [sectorSearch, setSectorSearch] = useState("");
  const [sectorLoading, setSectorLoading] = useState(false);

  // Estados para departamentos
  const [departments, setDepartments] = useState<Array<{ id: string; name: string; code: string }>>(
    [],
  );
  const [selectedDepartment, setSelectedDepartment] = useState<{
    id: string;
    name: string;
    code: string;
  } | null>(null);
  const [departmentPermissions, setDepartmentPermissions] = useState<
    Array<{ permissionKey: string; granted: boolean; departmentId?: string; permissionId: string }>
  >([]);
  const [departmentPermissionsSet, setDepartmentPermissionsSet] = useState<Set<string>>(new Set());
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [departmentLoading, setDepartmentLoading] = useState(false);

  // Estados para templates
  const [templates, setTemplates] = useState<PermissionTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showApplyTemplateModal, setShowApplyTemplateModal] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Substituir por API real
      const mockUsers: AppUser[] = [
        {
          userId: "user-123",
          email: "admin@example.com",
          displayName: "Administrador",
          role: "admin",
          permissions: allPermissions.map((p) => p.id),
        },
        {
          userId: "user-456",
          email: "gerente@example.com",
          displayName: "Gerente",
          role: "manager",
          permissions: roles.find((r) => r.id === "manager")?.permissions || [],
        },
        {
          userId: "user-789",
          email: "usuario@example.com",
          displayName: "Usuário",
          role: "user",
          permissions: roles.find((r) => r.id === "user")?.permissions || [],
        },
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  function togglePermission(permissionId: string) {
    const newPermissions = new Set(userPermissions);
    if (newPermissions.has(permissionId)) {
      newPermissions.delete(permissionId);
    } else {
      newPermissions.add(permissionId);
    }
    setUserPermissions(newPermissions);
  }

  async function savePermissions() {
    if (!selectedUser) return;

    try {
      // TODO: Substituir por API real
      console.log("Salvando permissões:", {
        userId: selectedUser.userId,
        permissions: Array.from(userPermissions),
      });

      // Atualizar usuário local
      setUsers(
        users.map((u) =>
          u.userId === selectedUser.userId ? { ...u, permissions: Array.from(userPermissions) } : u,
        ),
      );

      alert("Permissões salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar permissões:", error);
      alert("Erro ao salvar permissões");
    }
  }

  function applyRole(role: Role) {
    setUserPermissions(new Set(role.permissions));
    setShowRoleModal(false);
  }

  function getPermissionsByModule() {
    const grouped: Record<string, Permission[]> = {};
    allPermissions.forEach((permission) => {
      if (!grouped[permission.module]) {
        grouped[permission.module] = [];
      }
      grouped[permission.module].push(permission);
    });
    return grouped;
  }

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.displayName?.toLowerCase().includes(search.toLowerCase()),
  );

  const permissionsByModule = getPermissionsByModule();

  // Funções para cargos
  const loadPositions = useCallback(async () => {
    setPositionLoading(true);
    try {
      const params = new URLSearchParams();
      if (positionSearch.length >= 2) {
        params.append("busca", positionSearch);
      }
      params.append("status", "ativo");

      const response = await fetch(`/api/positions?${params.toString()}`, {
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: { itens: Position[] } = await response.json();
        setPositions(data.itens || []);
      }
    } catch (error) {
      console.error("Erro ao carregar cargos:", error);
      console.error("Erro ao carregar cargos");
    } finally {
      setPositionLoading(false);
    }
  }, [positionSearch]);

  const loadSectorsForReference = useCallback(async () => {
    try {
      const response = await fetch("/api/sectors?status=ativo", {
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: {
          itens: Array<{ id: string; name: string; code: string; departmentId: string }>;
        } = await response.json();
        setSectors(data.itens || []);
      }
    } catch (error) {
      console.error("Erro ao carregar setores:", error);
    }
  }, []);

  const loadSectors = useCallback(async () => {
    setSectorLoading(true);
    try {
      const params = new URLSearchParams();
      if (sectorSearch.length >= 2) {
        params.append("busca", sectorSearch);
      }
      params.append("status", "ativo");

      const response = await fetch(`/api/sectors?${params.toString()}`, {
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: {
          itens: Array<{ id: string; name: string; code: string; departmentId: string }>;
        } = await response.json();
        setSectors(data.itens || []);
      }
    } catch (error) {
      console.error("Erro ao carregar setores:", error);
      console.error("Erro ao carregar setores");
    } finally {
      setSectorLoading(false);
    }
  }, [sectorSearch]);

  const loadDepartmentsForReference = useCallback(async () => {
    try {
      const response = await fetch("/api/departments?status=ativo", {
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: {
          itens: Array<{ departmentId?: string; id?: string; name: string; code: string }>;
        } = await response.json();
        const mapped = (data.itens || []).map((item) => ({
          id: item.departmentId || item.id || "",
          name: item.name,
          code: item.code,
        }));
        setDepartments(mapped);
      }
    } catch (error) {
      console.error("Erro ao carregar departamentos:", error);
    }
  }, []);

  const loadDepartments = useCallback(async () => {
    setDepartmentLoading(true);
    try {
      const params = new URLSearchParams();
      if (departmentSearch.length >= 2) {
        params.append("busca", departmentSearch);
      }
      params.append("status", "ativo");

      const response = await fetch(`/api/departments?${params.toString()}`, {
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: { itens: Array<{ departmentId: string; name: string; code: string }> } =
          await response.json();
        setDepartments(
          data.itens.map((d) => ({ id: d.departmentId, name: d.name, code: d.code })) || [],
        );
      }
    } catch (error) {
      console.error("Erro ao carregar departamentos:", error);
      console.error("Erro ao carregar departamentos");
    } finally {
      setDepartmentLoading(false);
    }
  }, [departmentSearch]);

  const loadPositionPermissions = useCallback(async (positionId: string) => {
    setPositionLoading(true);
    try {
      const response = await fetch(`/api/positions/${positionId}/permissions`, {
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: { itens: PositionPermission[] } = await response.json();
        setPositionPermissions(data.itens || []);
        const grantedPermissions = new Set(
          data.itens.filter((p) => p.granted).map((p) => p.permissionKey),
        );
        setPositionPermissionsSet(grantedPermissions);
      }
    } catch (error) {
      console.error("Erro ao carregar permissões do cargo:", error);
      console.error("Erro ao carregar permissões do cargo");
    } finally {
      setPositionLoading(false);
    }
  }, []);

  async function togglePositionPermission(permissionId: string, granted: boolean) {
    if (!selectedPosition) return;

    try {
      const response = await fetch(`/api/positions/${selectedPosition.id}/permissions`, {
        method: "POST",
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          permissionId,
          granted,
        }),
      });

      if (response.ok) {
        // Atualizar estado local
        const newSet = new Set(positionPermissionsSet);
        if (granted) {
          newSet.add(permissionId);
        } else {
          newSet.delete(permissionId);
        }
        setPositionPermissionsSet(newSet);

        // Recarregar permissões para garantir sincronização
        await loadPositionPermissions(selectedPosition.id);
        console.info("Permissão atualizada com sucesso!");
      } else {
        console.error("Erro ao atualizar permissão");
      }
    } catch (error) {
      console.error("Erro ao atualizar permissão:", error);
      console.error("Erro ao atualizar permissão");
    }
  }

  // Funções para setores
  const loadSectorPermissions = useCallback(async (sectorId: string) => {
    setSectorLoading(true);
    try {
      const response = await fetch(`/api/sectors/${sectorId}/permissions`, {
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: {
          itens: Array<{
            permissionKey: string;
            granted: boolean;
            sectorId?: string;
            permissionId: string;
          }>;
        } = await response.json();
        setSectorPermissions(data.itens || []);
        const grantedPermissions = new Set(
          data.itens.filter((p) => p.granted).map((p) => p.permissionKey),
        );
        setSectorPermissionsSet(grantedPermissions);
      }
    } catch (error) {
      console.error("Erro ao carregar permissões do setor:", error);
      console.error("Erro ao carregar permissões do setor");
    } finally {
      setSectorLoading(false);
    }
  }, []);

  async function toggleSectorPermission(permissionId: string, granted: boolean) {
    if (!selectedSector) return;

    try {
      const response = await fetch(`/api/sectors/${selectedSector.id}/permissions`, {
        method: "POST",
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          permissionId,
          granted,
        }),
      });

      if (response.ok) {
        const newSet = new Set(sectorPermissionsSet);
        if (granted) {
          newSet.add(permissionId);
        } else {
          newSet.delete(permissionId);
        }
        setSectorPermissionsSet(newSet);
        await loadSectorPermissions(selectedSector.id);
        console.info("Permissão atualizada com sucesso!");
      } else {
        console.error("Erro ao atualizar permissão");
      }
    } catch (error) {
      console.error("Erro ao atualizar permissão:", error);
      console.error("Erro ao atualizar permissão");
    }
  }

  // Funções para departamentos
  const loadDepartmentPermissions = useCallback(async (departmentId: string) => {
    setDepartmentLoading(true);
    try {
      const response = await fetch(`/api/departments/${departmentId}/permissions`, {
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: {
          itens: Array<{
            permissionKey: string;
            granted: boolean;
            departmentId?: string;
            permissionId: string;
          }>;
        } = await response.json();
        setDepartmentPermissions(data.itens || []);
        const grantedPermissions = new Set(
          data.itens.filter((p) => p.granted).map((p) => p.permissionKey),
        );
        setDepartmentPermissionsSet(grantedPermissions);
      }
    } catch (error) {
      console.error("Erro ao carregar permissões do departamento:", error);
      console.error("Erro ao carregar permissões do departamento");
    } finally {
      setDepartmentLoading(false);
    }
  }, []);

  async function toggleDepartmentPermission(permissionId: string, granted: boolean) {
    if (!selectedDepartment) return;

    try {
      const response = await fetch(`/api/departments/${selectedDepartment.id}/permissions`, {
        method: "POST",
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          permissionId,
          granted,
        }),
      });

      if (response.ok) {
        const newSet = new Set(departmentPermissionsSet);
        if (granted) {
          newSet.add(permissionId);
        } else {
          newSet.delete(permissionId);
        }
        setDepartmentPermissionsSet(newSet);
        await loadDepartmentPermissions(selectedDepartment.id);
        console.info("Permissão atualizada com sucesso!");
      } else {
        console.error("Erro ao atualizar permissão");
      }
    } catch (error) {
      console.error("Erro ao atualizar permissão:", error);
      console.error("Erro ao atualizar permissão");
    }
  }

  const filteredPositions = positions.filter(
    (position) =>
      position.name.toLowerCase().includes(positionSearch.toLowerCase()) ||
      position.code.toLowerCase().includes(positionSearch.toLowerCase()),
  );

  const filteredSectors = sectors.filter(
    (sector) =>
      sector.name.toLowerCase().includes(sectorSearch.toLowerCase()) ||
      sector.code.toLowerCase().includes(sectorSearch.toLowerCase()),
  );

  const filteredDepartments = departments.filter(
    (department) =>
      department.name.toLowerCase().includes(departmentSearch.toLowerCase()) ||
      department.code.toLowerCase().includes(departmentSearch.toLowerCase()),
  );

  // Funções para templates
  const loadTemplates = useCallback(async () => {
    setTemplatesLoading(true);
    try {
      const response = await fetch("/api/permissions/templates", {
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: { itens: PermissionTemplate[] } = await response.json();
        setTemplates(data.itens || []);
      }
    } catch (error) {
      console.error("Erro ao carregar templates:", error);
      console.error("Erro ao carregar templates de permissões");
    } finally {
      setTemplatesLoading(false);
    }
  }, []);

  async function aplicarTemplate(
    templateId: string,
    entityType: "position" | "sector" | "department",
    entityId: string,
  ) {
    try {
      const response = await fetch(`/api/permissions/templates/${templateId}/apply`, {
        method: "POST",
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entityType,
          entityId,
        }),
      });

      if (response.ok) {
        console.info("Template aplicado com sucesso!");
        setShowApplyTemplateModal(false);

        // Recarregar permissões da entidade
        if (entityType === "position" && selectedPosition) {
          await loadPositionPermissions(selectedPosition.id);
        } else if (entityType === "sector" && selectedSector) {
          await loadSectorPermissions(selectedSector.id);
        } else if (entityType === "department" && selectedDepartment) {
          await loadDepartmentPermissions(selectedDepartment.id);
        }
      } else {
        const error = await response.json().catch(() => ({ message: "Erro ao aplicar template" }));
        console.error(error.message || "Erro ao aplicar template");
      }
    } catch (error) {
      console.error("Erro ao aplicar template:", error);
      console.error("Erro ao aplicar template");
    }
  }

  function getTemplatesForEntityType(
    entityType: "position" | "sector" | "department",
  ): PermissionTemplate[] {
    return templates.filter(
      (template) => template.entityType === entityType || template.entityType === "all",
    );
  }

  // Effects (após declarações para evitar uso antes da definição)
  useEffect(() => {
    if (activeTab === "users") {
      loadUsers();
    } else if (activeTab === "positions") {
      loadPositions();
      loadSectorsForReference();
      loadDepartmentsForReference();
    } else if (activeTab === "sectors") {
      loadSectors();
      loadDepartmentsForReference();
    } else if (activeTab === "departments") {
      loadDepartments();
    } else if (activeTab === "templates") {
      loadTemplates();
    }
  }, [
    activeTab,
    loadUsers,
    loadPositions,
    loadSectorsForReference,
    loadDepartmentsForReference,
    loadSectors,
    loadDepartments,
    loadTemplates,
  ]);

  useEffect(() => {
    if (selectedUser) {
      setUserPermissions(new Set(selectedUser.permissions));
    }
  }, [selectedUser]);

  useEffect(() => {
    if (selectedPosition) {
      loadPositionPermissions(selectedPosition.id);
    }
  }, [selectedPosition, loadPositionPermissions]);

  useEffect(() => {
    if (selectedSector) {
      loadSectorPermissions(selectedSector.id);
    }
  }, [selectedSector, loadSectorPermissions]);

  useEffect(() => {
    if (selectedDepartment) {
      loadDepartmentPermissions(selectedDepartment.id);
    }
  }, [selectedDepartment, loadDepartmentPermissions]);

  return (
    <div className="relative flex flex-col gap-6 rounded-(--r-lg) p-(--space-2) overflow-hidden">
      {/* Overlays futuristas */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 holo-grid opacity-25" />
        <div className="beam-line absolute left-[8%] top-0 h-full w-px opacity-35" />
        <div className="beam-line absolute right-[12%] top-0 h-full w-px opacity-25" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(109,213,255,0.08),transparent_38%)]" />
      </div>
      {/* Tabs */}
      <GlassCard className="p-6 border-[color-mix(in_oklab,var(--border)_80%,transparent_20%)] shadow-[0_18px_80px_-28px_rgba(109,213,255,0.28)] bg-[color-mix(in_oklab,var(--surface)_90%,transparent_10%)]">
        <div className="flex gap-4 border-b border-[color-mix(in_oklab,var(--border)_80%,transparent)]">
          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-all rounded-(--r-md)",
              activeTab === "users"
                ? "bg-[color-mix(in_oklab,var(--primary)_14%,transparent_86%)] text-(--primary) shadow-[0_0_24px_rgba(109,213,255,0.35)]"
                : "text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)] hover:text-(--fg) hover:bg-white/5",
            )}
          >
            <User className="mr-2 inline h-4 w-4" />
            Usuários
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("positions")}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-all rounded-(--r-md)",
              activeTab === "positions"
                ? "bg-[color-mix(in_oklab,var(--primary)_14%,transparent_86%)] text-(--primary) shadow-[0_0_24px_rgba(109,213,255,0.35)]"
                : "text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)] hover:text-(--fg) hover:bg-white/5",
            )}
          >
            <Briefcase className="mr-2 inline h-4 w-4" />
            Cargos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("sectors")}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-all rounded-(--r-md)",
              activeTab === "sectors"
                ? "bg-[color-mix(in_oklab,var(--primary)_14%,transparent_86%)] text-(--primary) shadow-[0_0_24px_rgba(109,213,255,0.35)]"
                : "text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)] hover:text-(--fg) hover:bg-white/5",
            )}
          >
            <Layers className="mr-2 inline h-4 w-4" />
            Setores
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("departments")}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-all rounded-(--r-md)",
              activeTab === "departments"
                ? "bg-[color-mix(in_oklab,var(--primary)_14%,transparent_86%)] text-(--primary) shadow-[0_0_24px_rgba(109,213,255,0.35)]"
                : "text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)] hover:text-(--fg) hover:bg-white/5",
            )}
          >
            <Building2 className="mr-2 inline h-4 w-4" />
            Departamentos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("templates")}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-all rounded-(--r-md)",
              activeTab === "templates"
                ? "bg-[color-mix(in_oklab,var(--primary)_14%,transparent_86%)] text-(--primary) shadow-[0_0_24px_rgba(109,213,255,0.35)]"
                : "text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)] hover:text-(--fg) hover:bg-white/5",
            )}
          >
            <FileText className="mr-2 inline h-4 w-4" />
            Templates
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("audit-log")}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-all rounded-(--r-md)",
              activeTab === "audit-log"
                ? "bg-[color-mix(in_oklab,var(--primary)_14%,transparent_86%)] text-(--primary) shadow-[0_0_24px_rgba(109,213,255,0.35)]"
                : "text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)] hover:text-(--fg) hover:bg-white/5",
            )}
          >
            <History className="mr-2 inline h-4 w-4" />
            Histórico
          </button>
        </div>
      </GlassCard>

      {activeTab === "users" && (
        <>
          {/* Lista de usuários */}
          <GlassCard className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-(--fg)">Usuários</h2>
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]" />
                <Input
                  type="search"
                  placeholder="Buscar usuários..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              {loading ? (
                <p className="py-8 text-center text-sm text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                  Carregando usuários...
                </p>
              ) : filteredUsers.length === 0 ? (
                <p className="py-8 text-center text-sm text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                  Nenhum usuário encontrado
                </p>
              ) : (
                filteredUsers.map((user) => {
                  const role = roles.find((r) => r.id === user.role);
                  return (
                    <button
                      type="button"
                      key={user.userId}
                      onClick={() => setSelectedUser(user)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg border p-4 text-left transition-all",
                        selectedUser?.userId === user.userId
                          ? "border-(--primary) bg-[color-mix(in_oklab,var(--primary)_10%,transparent)]"
                          : "border-[color-mix(in_oklab,var(--border)_90%,transparent)] hover:border-(--primary) hover:bg-[color-mix(in_oklab,var(--surface)_80%,transparent)]",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-(--primary) to-(--secondary) text-white">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-(--fg)">
                            {user.displayName || user.email}
                          </p>
                          <p className="text-xs text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                            {user.email} · {role?.name || user.role}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                          {user.permissions.length} permissões
                        </span>
                        <Shield className="h-4 w-4 text-(--primary)" />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </GlassCard>

          {/* Permissões do usuário selecionado */}
          {selectedUser && (
            <GlassCard className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-(--fg)">
                    Permissões de {selectedUser.displayName || selectedUser.email}
                  </h2>
                  <p className="mt-1 text-sm text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                    {userPermissions.size} de {allPermissions.length} permissões selecionadas
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowRoleModal(true)}>
                    <Shield className="h-4 w-4" />
                    Aplicar Role
                  </Button>
                  <Button size="sm" onClick={savePermissions}>
                    <Save className="h-4 w-4" />
                    Salvar
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                {Object.entries(permissionsByModule).map(([module, permissions]) => (
                  <div key={module}>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                      {module}
                    </h3>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {permissions.map((permission) => {
                        const hasPermission = userPermissions.has(permission.id);
                        return (
                          <label
                            key={permission.id}
                            className={cn(
                              "flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all",
                              hasPermission
                                ? "border-(--primary) bg-[color-mix(in_oklab,var(--primary)_10%,transparent)]"
                                : "border-[color-mix(in_oklab,var(--border)_90%,transparent)] hover:border-(--primary) hover:bg-[color-mix(in_oklab,var(--surface)_80%,transparent)]",
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={hasPermission}
                              onChange={() => togglePermission(permission.id)}
                              className="h-4 w-4 rounded border-[color-mix(in_oklab,var(--border)_90%,transparent)] text-(--primary) focus:ring-(--primary)"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-(--fg)">{permission.name}</p>
                              <p className="text-xs text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                                {permission.description}
                              </p>
                            </div>
                            {hasPermission ? (
                              <Check className="h-4 w-4 text-(--primary)" />
                            ) : (
                              <X className="h-4 w-4 text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]" />
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Modal de roles */}
          {showRoleModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <GlassCard className="relative max-w-md p-6">
                <h3 className="mb-4 text-lg font-semibold text-(--fg)">Aplicar Role</h3>
                <p className="mb-4 text-sm text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                  Selecione uma role para aplicar todas as permissões de uma vez
                </p>
                <div className="space-y-2">
                  {roles.map((role) => (
                    <button
                      type="button"
                      key={role.id}
                      onClick={() => {
                        setSelectedRole(role);
                        applyRole(role);
                      }}
                      className={cn(
                        "w-full rounded-lg border p-4 text-left transition-all",
                        selectedRole?.id === role.id
                          ? "border-(--primary) bg-[color-mix(in_oklab,var(--primary)_10%,transparent)]"
                          : "border-[color-mix(in_oklab,var(--border)_90%,transparent)] hover:border-(--primary) hover:bg-[color-mix(in_oklab,var(--surface)_80%,transparent)]",
                      )}
                    >
                      <p className="font-medium text-(--fg)">{role.name}</p>
                      <p className="text-xs text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                        {role.description}
                      </p>
                      <p className="mt-1 text-xs text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                        {role.permissions.length} permissões
                      </p>
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowRoleModal(false)}>
                    Cancelar
                  </Button>
                </div>
              </GlassCard>
            </div>
          )}
        </>
      )}

      {activeTab === "positions" && (
        <>
          {/* Lista de cargos */}
          <GlassCard className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-(--fg)">Cargos</h2>
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]" />
                <Input
                  type="search"
                  placeholder="Buscar cargos..."
                  value={positionSearch}
                  onChange={(e) => {
                    setPositionSearch(e.target.value);
                    // Debounce para buscar
                    setTimeout(() => {
                      if (e.target.value.length >= 2 || e.target.value.length === 0) {
                        loadPositions();
                      }
                    }, 500);
                  }}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              {positionLoading ? (
                <p className="py-8 text-center text-sm text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                  Carregando cargos...
                </p>
              ) : filteredPositions.length === 0 ? (
                <p className="py-8 text-center text-sm text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                  Nenhum cargo encontrado
                </p>
              ) : (
                filteredPositions.map((position) => {
                  const sector = sectors.find((s) => s.id === position.sectorId);
                  const department = sector
                    ? departments.find((d) => d.id === sector.departmentId)
                    : null;
                  const permissionCount = positionPermissions.filter(
                    (p) => p.positionId === position.id && p.granted,
                  ).length;

                  return (
                    <button
                      type="button"
                      key={position.id}
                      onClick={() => setSelectedPosition(position)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg border p-4 text-left transition-all",
                        selectedPosition?.id === position.id
                          ? "border-(--primary) bg-[color-mix(in_oklab,var(--primary)_10%,transparent)]"
                          : "border-[color-mix(in_oklab,var(--border)_90%,transparent)] hover:border-(--primary) hover:bg-[color-mix(in_oklab,var(--surface)_80%,transparent)]",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-(--primary) to-(--secondary) text-white">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-(--fg)">{position.name}</p>
                          <p className="text-xs text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                            {position.code}{" "}
                            {department && sector && `• ${department.name} → ${sector.name}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                          {permissionCount} permissões
                        </span>
                        <Shield className="h-4 w-4 text-(--primary)" />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </GlassCard>

          {/* Permissões do cargo selecionado */}
          {selectedPosition && (
            <GlassCard className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-(--fg)">
                    Permissões do Cargo: {selectedPosition.name}
                  </h2>
                  <p className="mt-1 text-sm text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                    {positionPermissionsSet.size} de {allPermissions.length} permissões concedidas
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowApplyTemplateModal(true);
                    }}
                  >
                    <Sparkles className="h-4 w-4" />
                    Aplicar Template
                  </Button>
                  <Button size="sm" onClick={() => loadPositionPermissions(selectedPosition.id)}>
                    <Save className="h-4 w-4" />
                    Atualizar
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                {Object.entries(permissionsByModule).map(([module, permissions]) => (
                  <div key={module}>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                      {module}
                    </h3>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {permissions.map((permission) => {
                        const hasPermission = positionPermissionsSet.has(permission.id);
                        const positionPermission = positionPermissions.find(
                          (p) => p.permissionKey === permission.id,
                        );
                        const isDenied = positionPermission && !positionPermission.granted;

                        return (
                          <label
                            key={permission.id}
                            className={cn(
                              "flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all",
                              hasPermission
                                ? "border-(--primary) bg-[color-mix(in_oklab,var(--primary)_10%,transparent)]"
                                : isDenied
                                  ? "border-[color-mix(in_oklab,var(--danger)_50%,transparent)] bg-[color-mix(in_oklab,var(--danger)_5%,transparent)]"
                                  : "border-[color-mix(in_oklab,var(--border)_90%,transparent)] hover:border-(--primary) hover:bg-[color-mix(in_oklab,var(--surface)_80%,transparent)]",
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={hasPermission}
                              onChange={() =>
                                togglePositionPermission(permission.id, !hasPermission)
                              }
                              className="h-4 w-4 rounded border-[color-mix(in_oklab,var(--border)_90%,transparent)] text-(--primary) focus:ring-(--primary)"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-(--fg)">{permission.name}</p>
                              <p className="text-xs text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                                {permission.description}
                              </p>
                            </div>
                            {hasPermission ? (
                              <Check className="h-4 w-4 text-(--primary)" />
                            ) : (
                              <X className="h-4 w-4 text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]" />
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </>
      )}
      {activeTab === "sectors" && (
        <>
          {/* Lista de setores */}
          <GlassCard className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-(--fg)">Setores</h2>
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]" />
                <Input
                  type="search"
                  placeholder="Buscar setores..."
                  value={sectorSearch}
                  onChange={(e) => {
                    setSectorSearch(e.target.value);
                    setTimeout(() => {
                      if (e.target.value.length >= 2 || e.target.value.length === 0) {
                        loadSectors();
                      }
                    }, 500);
                  }}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              {sectorLoading ? (
                <p className="py-8 text-center text-sm text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                  Carregando setores...
                </p>
              ) : filteredSectors.length === 0 ? (
                <p className="py-8 text-center text-sm text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                  Nenhum setor encontrado
                </p>
              ) : (
                filteredSectors.map((sector) => {
                  const department = departments.find((d) => d.id === sector.departmentId);
                  const permissionCount = sectorPermissions.filter(
                    (p) => p.sectorId === sector.id && p.granted,
                  ).length;

                  return (
                    <button
                      type="button"
                      key={sector.id}
                      onClick={() => setSelectedSector(sector)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg border p-4 text-left transition-all",
                        selectedSector?.id === sector.id
                          ? "border-(--primary) bg-[color-mix(in_oklab,var(--primary)_10%,transparent)]"
                          : "border-[color-mix(in_oklab,var(--border)_90%,transparent)] hover:border-(--primary) hover:bg-[color-mix(in_oklab,var(--surface)_80%,transparent)]",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-(--primary) to-(--secondary) text-white">
                          <Layers className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-(--fg)">{sector.name}</p>
                          <p className="text-xs text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                            {sector.code} {department && `• ${department.name}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                          {permissionCount} permissões
                        </span>
                        <Shield className="h-4 w-4 text-(--primary)" />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </GlassCard>

          {/* Permissões do setor selecionado */}
          {selectedSector && (
            <GlassCard className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-(--fg)">
                    Permissões do Setor: {selectedSector.name}
                  </h2>
                  <p className="mt-1 text-sm text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                    {sectorPermissionsSet.size} de {allPermissions.length} permissões concedidas
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowApplyTemplateModal(true);
                    }}
                  >
                    <Sparkles className="h-4 w-4" />
                    Aplicar Template
                  </Button>
                  <Button size="sm" onClick={() => loadSectorPermissions(selectedSector.id)}>
                    <Save className="h-4 w-4" />
                    Atualizar
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                {Object.entries(permissionsByModule).map(([module, permissions]) => (
                  <div key={module}>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                      {module}
                    </h3>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {permissions.map((permission) => {
                        const hasPermission = sectorPermissionsSet.has(permission.id);
                        const sectorPermission = sectorPermissions.find(
                          (p) => p.permissionKey === permission.id,
                        );
                        const isDenied = sectorPermission && !sectorPermission.granted;

                        return (
                          <label
                            key={permission.id}
                            className={cn(
                              "flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all",
                              hasPermission
                                ? "border-(--primary) bg-[color-mix(in_oklab,var(--primary)_10%,transparent)]"
                                : isDenied
                                  ? "border-[color-mix(in_oklab,var(--danger)_50%,transparent)] bg-[color-mix(in_oklab,var(--danger)_5%,transparent)]"
                                  : "border-[color-mix(in_oklab,var(--border)_90%,transparent)] hover:border-(--primary) hover:bg-[color-mix(in_oklab,var(--surface)_80%,transparent)]",
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={hasPermission}
                              onChange={() => toggleSectorPermission(permission.id, !hasPermission)}
                              className="h-4 w-4 rounded border-[color-mix(in_oklab,var(--border)_90%,transparent)] text-(--primary) focus:ring-(--primary)"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-(--fg)">{permission.name}</p>
                              <p className="text-xs text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                                {permission.description}
                              </p>
                            </div>
                            {hasPermission ? (
                              <Check className="h-4 w-4 text-(--primary)" />
                            ) : (
                              <X className="h-4 w-4 text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]" />
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </>
      )}

      {activeTab === "departments" && (
        <>
          {/* Lista de departamentos */}
          <GlassCard className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-(--fg)">Departamentos</h2>
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]" />
                <Input
                  type="search"
                  placeholder="Buscar departamentos..."
                  value={departmentSearch}
                  onChange={(e) => {
                    setDepartmentSearch(e.target.value);
                    setTimeout(() => {
                      if (e.target.value.length >= 2 || e.target.value.length === 0) {
                        loadDepartments();
                      }
                    }, 500);
                  }}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              {departmentLoading ? (
                <p className="py-8 text-center text-sm text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                  Carregando departamentos...
                </p>
              ) : filteredDepartments.length === 0 ? (
                <p className="py-8 text-center text-sm text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                  Nenhum departamento encontrado
                </p>
              ) : (
                filteredDepartments.map((department) => {
                  const permissionCount = departmentPermissions.filter(
                    (p) => p.departmentId === department.id && p.granted,
                  ).length;

                  return (
                    <button
                      type="button"
                      key={department.id}
                      onClick={() => setSelectedDepartment(department)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg border p-4 text-left transition-all",
                        selectedDepartment?.id === department.id
                          ? "border-(--primary) bg-[color-mix(in_oklab,var(--primary)_10%,transparent)]"
                          : "border-[color-mix(in_oklab,var(--border)_90%,transparent)] hover:border-(--primary) hover:bg-[color-mix(in_oklab,var(--surface)_80%,transparent)]",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-(--primary) to-(--secondary) text-white">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-(--fg)">{department.name}</p>
                          <p className="text-xs text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                            {department.code}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                          {permissionCount} permissões
                        </span>
                        <Shield className="h-4 w-4 text-(--primary)" />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </GlassCard>

          {/* Permissões do departamento selecionado */}
          {selectedDepartment && (
            <GlassCard className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-(--fg)">
                    Permissões do Departamento: {selectedDepartment.name}
                  </h2>
                  <p className="mt-1 text-sm text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                    {departmentPermissionsSet.size} de {allPermissions.length} permissões concedidas
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowApplyTemplateModal(true);
                    }}
                  >
                    <Sparkles className="h-4 w-4" />
                    Aplicar Template
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => loadDepartmentPermissions(selectedDepartment.id)}
                  >
                    <Save className="h-4 w-4" />
                    Atualizar
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                {Object.entries(permissionsByModule).map(([module, permissions]) => (
                  <div key={module}>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                      {module}
                    </h3>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {permissions.map((permission) => {
                        const hasPermission = departmentPermissionsSet.has(permission.id);
                        const departmentPermission = departmentPermissions.find(
                          (p) => p.permissionKey === permission.id,
                        );
                        const isDenied = departmentPermission && !departmentPermission.granted;

                        return (
                          <label
                            key={permission.id}
                            className={cn(
                              "flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all",
                              hasPermission
                                ? "border-(--primary) bg-[color-mix(in_oklab,var(--primary)_10%,transparent)]"
                                : isDenied
                                  ? "border-[color-mix(in_oklab,var(--danger)_50%,transparent)] bg-[color-mix(in_oklab,var(--danger)_5%,transparent)]"
                                  : "border-[color-mix(in_oklab,var(--border)_90%,transparent)] hover:border-(--primary) hover:bg-[color-mix(in_oklab,var(--surface)_80%,transparent)]",
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={hasPermission}
                              onChange={() =>
                                toggleDepartmentPermission(permission.id, !hasPermission)
                              }
                              className="h-4 w-4 rounded border-[color-mix(in_oklab,var(--border)_90%,transparent)] text-(--primary) focus:ring-(--primary)"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-(--fg)">{permission.name}</p>
                              <p className="text-xs text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                                {permission.description}
                              </p>
                            </div>
                            {hasPermission ? (
                              <Check className="h-4 w-4 text-(--primary)" />
                            ) : (
                              <X className="h-4 w-4 text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]" />
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </>
      )}

      {activeTab === "templates" && (
        <GlassCard className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-(--fg)">Templates de Permissões</h2>
              <p className="mt-1 text-sm text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                Conjuntos predefinidos de permissões para aplicar rapidamente
              </p>
            </div>
            <Button size="sm" onClick={() => setShowTemplateModal(true)}>
              <Plus className="h-4 w-4" />
              Novo Template
            </Button>
          </div>

          <div className="space-y-2">
            {templatesLoading ? (
              <p className="py-8 text-center text-sm text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                Carregando templates...
              </p>
            ) : templates.length === 0 ? (
              <p className="py-8 text-center text-sm text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                Nenhum template encontrado
              </p>
            ) : (
              templates.map((template) => (
                <div
                  key={template.id}
                  className={cn(
                    "flex items-center justify-between rounded-lg border p-4 transition-all",
                    "border-[color-mix(in_oklab,var(--border)_90%,transparent)] hover:border-(--primary) hover:bg-[color-mix(in_oklab,var(--surface)_80%,transparent)]",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-(--primary) to-(--secondary) text-white">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-(--fg)">{template.name}</p>
                        {template.isDefault && (
                          <span className="rounded-full bg-(--primary) px-2 py-0.5 text-xs text-white">
                            Padrão
                          </span>
                        )}
                        {template.isSystem && (
                          <span className="rounded-full bg-[color-mix(in_oklab,var(--muted)_70%,transparent)] px-2 py-0.5 text-xs text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                            Sistema
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                        {template.description || "Sem descrição"}
                      </p>
                      <p className="mt-1 text-xs text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                        Tipo: {template.entityType === "all" ? "Todos" : template.entityType} •{" "}
                        {template.permissions.length} permissões
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      )}

      {/* Modal para aplicar template */}
      {showApplyTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <GlassCard className="relative max-w-md p-6">
            <h3 className="mb-4 text-lg font-semibold text-(--fg)">
              Aplicar Template de Permissões
            </h3>
            <p className="mb-4 text-sm text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
              Selecione um template para aplicar às permissões
            </p>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {(() => {
                let entityType: "position" | "sector" | "department" | null = null;
                let entityId: string | null = null;

                if (selectedPosition) {
                  entityType = "position";
                  entityId = selectedPosition.id;
                } else if (selectedSector) {
                  entityType = "sector";
                  entityId = selectedSector.id;
                } else if (selectedDepartment) {
                  entityType = "department";
                  entityId = selectedDepartment.id;
                }

                if (!entityType || !entityId) {
                  return (
                    <p className="text-sm text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                      Selecione uma entidade primeiro
                    </p>
                  );
                }

                if (!entityType || !entityId) {
                  return (
                    <p className="text-sm text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                      Selecione uma entidade primeiro
                    </p>
                  );
                }

                const safeEntityType = entityType as "position" | "sector" | "department";
                const availableTemplates = getTemplatesForEntityType(safeEntityType);

                if (availableTemplates.length === 0) {
                  return (
                    <p className="text-sm text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                      Nenhum template disponível para{" "}
                      {entityType === "position"
                        ? "cargos"
                        : entityType === "sector"
                          ? "setores"
                          : "departamentos"}
                    </p>
                  );
                }

                return availableTemplates.map((template) => (
                  <button
                    type="button"
                    key={template.id}
                    onClick={() => {
                      if (!entityId) return;
                      aplicarTemplate(template.id, safeEntityType, entityId);
                    }}
                    className={cn(
                      "w-full rounded-lg border p-4 text-left transition-all",
                      "border-[color-mix(in_oklab,var(--border)_90%,transparent)] hover:border-(--primary) hover:bg-[color-mix(in_oklab,var(--surface)_80%,transparent)]",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-(--fg)">{template.name}</p>
                      {template.isDefault && (
                        <span className="rounded-full bg-(--primary) px-2 py-0.5 text-xs text-white">
                          Padrão
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                      {template.description || "Sem descrição"}
                    </p>
                    <p className="mt-1 text-xs text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
                      {template.permissions.length} permissões
                    </p>
                  </button>
                ));
              })()}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowApplyTemplateModal(false)}>
                Cancelar
              </Button>
            </div>
          </GlassCard>
        </div>
      )}

      {activeTab === "audit-log" && <AuditLogPanel getAuthHeaders={getAuthHeadersWithTenant} />}

      {/* Modal para criar template */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <GlassCard className="relative max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="mb-4 text-lg font-semibold text-(--fg)">Criar Template de Permissões</h3>
            <p className="mb-4 text-sm text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
              Criar um template a partir das permissões selecionadas
            </p>
            <p className="mb-4 text-xs text-[color-mix(in_oklab,var(--muted)_70%,var(--fg)_30%)]">
              Esta funcionalidade será implementada em breve. Por enquanto, use a API diretamente ou
              crie templates manualmente no banco de dados.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowTemplateModal(false)}>
                Fechar
              </Button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
