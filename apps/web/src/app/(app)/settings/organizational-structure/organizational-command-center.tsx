"use client";

import { Button, GlassCard, Input, Popover, PopoverContent, PopoverTrigger, cn } from "@morina/ui";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronRight,
  Download,
  Edit,
  FolderTree,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  Upload,
  Users,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";

import { notificationCenter } from "@/components/notifications/notification-center";
import {
  OrganizationTree,
  type DepartmentNode,
  type PositionNode,
  type SectorNode,
} from "@/components/organizational-structure/organization-tree";
import { OrganizationalToolbar } from "@/components/organizational-structure/OrganizationalToolbar";
import { OrganizationalAuditPanel } from "@/components/organizational-structure/OrganizationalAuditPanel";
import { ImportExportPanel } from "@/components/organizational-structure/ImportExportPanel";
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

type Subdepartment = {
  subdepartmentId: string;
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

type Sector = {
  id: string;
  orgId: string;
  departmentId: string;
  subdepartmentId?: string | null; // Setor pode pertencer a um subdepartamento
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

type ListResponse<T> = {
  itens: T[];
  proximoCursor?: string | null;
};

type SelectedNode =
  | { type: "department"; id: string; data: DepartmentNode }
  | { type: "sector"; id: string; data: SectorNode }
  | { type: "position"; id: string; data: PositionNode };

type DetailsTab = "overview" | "members" | "permissions" | "audit" | "move" | "import-export";

type DrawerMode = "create" | "edit";
type DrawerEntityType = "department" | "sector" | "position";

type MemberInfo = {
  membershipId: string;
  userId: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  user: {
    email: string;
    displayName: string | null;
    avatarUrl: string | null;
    status: string;
  };
};

type UserData = {
  userId: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  status: "pending" | "active" | "suspended";
};

const ROLE_OPTIONS = [
  { value: "owner", label: "Proprietário(a)" },
  { value: "admin", label: "Administrador(a)" },
  { value: "manager", label: "Gestor(a)" },
  { value: "member", label: "Colaborador(a)" },
  { value: "viewer", label: "Visitante" },
] as const;

type PermissionGrant = {
  id: string;
  permissionId: string;
  permissionKey?: string;
  granted: boolean;
  createdAt?: string;
};

type PermissionCatalogItem = {
  permissionId: string;
  name: string;
  description: string | null;
  module: string;
  resource: string;
  action: string;
};

type PendingApproval = {
  requestId: string;
  permissionId: string;
  permissionKey?: string;
  entityType: SelectedNode["type"];
  entityId: string;
};

type PendingApprovalInfo = {
  requestId: string;
  status: string;
  slaDueAt?: string | Date | null;
  createdAt?: string | Date | null;
};

function entityLabel(node: SelectedNode | null) {
  if (!node) return "—";
  if (node.type === "department") return `DEPARTAMENTO • ${node.data.code}`;
  if (node.type === "sector") return `SETOR • ${node.data.code}`;
  return `CARGO • ${node.data.code}`;
}

export function OrganizationalCommandCenter() {
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subdepartments, setSubdepartments] = useState<Subdepartment[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<SelectedNode | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const [armedMode, setArmedMode] = useState(false);
  const [reason, setReason] = useState("");

  // Advanced filters
  const [filters, setFilters] = useState<{
    type: "all" | "department" | "sector" | "position";
    status: "all" | "ativo" | "inativo" | "arquivado";
    responsavel?: string;
  }>({
    type: "all",
    status: "all",
  });

  const [organogramView, setOrganogramView] = useState(false);

  const [tab, setTab] = useState<DetailsTab>("overview");

  // Drawer CRUD
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [drawerType, setDrawerType] = useState<DrawerEntityType>("department");
  const [drawerBusy, setDrawerBusy] = useState(false);
  const [drawerErrors, setDrawerErrors] = useState<Record<string, string>>({});

  const [deptDraft, setDeptDraft] = useState<{
    departmentId?: string;
    name: string;
    code: string;
    description: string;
    parentId: string;
    status: Department["status"];
  }>({
    name: "",
    code: "",
    description: "",
    parentId: "",
    status: "ativo",
  });

  const [sectorDraft, setSectorDraft] = useState<{
    id?: string;
    name: string;
    code: string;
    description: string;
    departmentId: string;
    parentId: string;
    status: Sector["status"];
  }>({
    name: "",
    code: "",
    description: "",
    departmentId: "",
    parentId: "",
    status: "ativo",
  });

  const [positionDraft, setPositionDraft] = useState<{
    id?: string;
    name: string;
    code: string;
    description: string;
    sectorId: string;
    status: Position["status"];
  }>({
    name: "",
    code: "",
    description: "",
    sectorId: "",
    status: "ativo",
  });

  // members
  const [membersLoading, setMembersLoading] = useState(false);
  const [members, setMembers] = useState<MemberInfo[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [addUserId, setAddUserId] = useState("");
  const [addRole, setAddRole] = useState<(typeof ROLE_OPTIONS)[number]["value"]>("member");
  const [membersBusy, setMembersBusy] = useState(false);

  // permissions
  const [permLoading, setPermLoading] = useState(false);
  const [permGrants, setPermGrants] = useState<PermissionGrant[]>([]);
  const [permPermissionId, setPermPermissionId] = useState("");
  const [permGranted, setPermGranted] = useState(true);
  const [permBusy, setPermBusy] = useState(false);

  const [permCatalogOpen, setPermCatalogOpen] = useState(false);
  const [permCatalogLoading, setPermCatalogLoading] = useState(false);
  const [permCatalogQuery, setPermCatalogQuery] = useState("");
  const [permCatalogItems, setPermCatalogItems] = useState<PermissionCatalogItem[]>([]);
  const [permSelected, setPermSelected] = useState<PermissionCatalogItem | null>(null);
  const [pendingApproval, setPendingApproval] = useState<PendingApproval | null>(null);
  const [pendingApprovalInfo, setPendingApprovalInfo] = useState<PendingApprovalInfo | null>(null);

  const tree = useMemo<DepartmentNode[]>(() => {
    // Organizar setores por departamento e subdepartamento
    const sectorsByDepartment = new Map<string, Sector[]>();
    const sectorsBySubdepartment = new Map<string, Sector[]>();
    
    for (const s of sectors) {
      if (s.subdepartmentId) {
        // Setor pertence a um subdepartamento
        const list = sectorsBySubdepartment.get(s.subdepartmentId) ?? [];
        list.push(s);
        sectorsBySubdepartment.set(s.subdepartmentId, list);
      } else {
        // Setor pertence diretamente ao departamento
        const list = sectorsByDepartment.get(s.departmentId) ?? [];
        list.push(s);
        sectorsByDepartment.set(s.departmentId, list);
      }
    }

    // Organizar subdepartamentos por departamento
    const subdepartmentsByDepartment = new Map<string, Subdepartment[]>();
    for (const sd of subdepartments) {
      const list = subdepartmentsByDepartment.get(sd.departmentId) ?? [];
      list.push(sd);
      subdepartmentsByDepartment.set(sd.departmentId, list);
    }

    const positionsBySector = new Map<string, Position[]>();
    for (const p of positions) {
      const list = positionsBySector.get(p.sectorId) ?? [];
      list.push(p);
      positionsBySector.set(p.sectorId, list);
    }

    const depts = departments
      .map((d) => {
        // Subdepartamentos do departamento
        const subdepts = (subdepartmentsByDepartment.get(d.departmentId) ?? []).map((sd) => ({
          id: sd.subdepartmentId,
          name: sd.name,
          code: sd.code,
          status: sd.status,
          sectors: (sectorsBySubdepartment.get(sd.subdepartmentId) ?? [])
            .map((s) => {
              const secNode: SectorNode = {
                id: s.id,
                departmentId: s.departmentId,
                name: s.name,
                code: s.code,
                status: s.status,
                positions: (positionsBySector.get(s.id) ?? []).map((p) => {
                  const posNode: PositionNode = {
                    id: p.id,
                    sectorId: p.sectorId,
                    name: p.name,
                    code: p.code,
                    status: p.status,
                  };
                  return posNode;
                }),
              };
              return secNode;
            })
            .sort((a, b) => a.name.localeCompare(b.name)),
        }));

        // Setores diretos do departamento (quando não há subdepartamentos)
        const directSectors = (sectorsByDepartment.get(d.departmentId) ?? [])
          .map((s) => {
            const secNode: SectorNode = {
              id: s.id,
              departmentId: s.departmentId,
              name: s.name,
              code: s.code,
              status: s.status,
              positions: (positionsBySector.get(s.id) ?? []).map((p) => {
                const posNode: PositionNode = {
                  id: p.id,
                  sectorId: p.sectorId,
                  name: p.name,
                  code: p.code,
                  status: p.status,
                };
                return posNode;
              }),
            };
            return secNode;
          })
          .sort((a, b) => a.name.localeCompare(b.name));

        const deptNode: DepartmentNode = {
          id: d.departmentId,
          name: d.name,
          code: d.code,
          status: d.status,
          subdepartments: subdepts.length > 0 ? subdepts : undefined,
          sectors: subdepts.length === 0 ? directSectors : undefined, // Só mostra setores diretos se não houver subdepartamentos
        };
        return deptNode;
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    const searchQuery = search.trim().toLowerCase();
    const match = (s: string) => !searchQuery || s.toLowerCase().includes(searchQuery);

    // Apply filters
    let filteredDepts = depts;

    // Filter by type
    if (filters.type !== "all") {
      if (filters.type === "department") {
        filteredDepts = filteredDepts.map((d) => ({
          ...d,
          sectors: [],
        }));
      } else if (filters.type === "sector") {
        filteredDepts = filteredDepts.map((d) => ({
          ...d,
          sectors: d.sectors.map((s) => ({ ...s, positions: [] })),
        }));
      } else if (filters.type === "position") {
        // Keep all but only show positions
        filteredDepts = filteredDepts.map((d) => ({
          ...d,
          sectors: d.sectors.map((s) => ({ ...s, positions: s.positions })),
        }));
      }
    }

    // Filter by status
    if (filters.status !== "all") {
      filteredDepts = filteredDepts
        .filter((d) => d.status === filters.status)
        .map((d) => ({
          ...d,
          subdepartments: d.subdepartments
            ?.filter((sd) => sd.status === filters.status)
            .map((sd) => ({
              ...sd,
              sectors: sd.sectors
                ?.filter((s) => s.status === filters.status)
                .map((s) => ({
                  ...s,
                  positions: s.positions?.filter((p) => p.status === filters.status) ?? [],
                })),
            })),
          sectors: d.sectors
            ?.filter((s) => s.status === filters.status)
            .map((s) => ({
              ...s,
              positions: s.positions?.filter((p) => p.status === filters.status) ?? [],
            })),
        }));
    }

    // Apply search
    if (!searchQuery) return filteredDepts;

    return filteredDepts
      .map((d) => {
        // Filtrar subdepartamentos
        const subdeptsFiltered = (d.subdepartments ?? [])
          .map((sd) => {
            const sectorsFiltered = (sd.sectors ?? [])
              .map((s) => {
                const positionsFiltered = (s.positions ?? []).filter((p) => match(p.name) || match(p.code));
                const keepSector = match(s.name) || match(s.code) || positionsFiltered.length > 0;
                if (!keepSector) return null;
                return { ...s, positions: positionsFiltered };
              })
              .filter((s): s is SectorNode => Boolean(s));
            
            const keepSubdept = match(sd.name) || match(sd.code) || sectorsFiltered.length > 0;
            if (!keepSubdept) return null;
            return { ...sd, sectors: sectorsFiltered };
          })
          .filter((sd): sd is SubdepartmentNode => Boolean(sd));

        // Filtrar setores diretos
        const sectorsFiltered = (d.sectors ?? [])
          .map((s) => {
            const positionsFiltered = (s.positions ?? []).filter((p) => match(p.name) || match(p.code));
            const keepSector = match(s.name) || match(s.code) || positionsFiltered.length > 0;
            if (!keepSector) return null;
            return { ...s, positions: positionsFiltered };
          })
          .filter((s): s is SectorNode => Boolean(s));

        const keepDept = match(d.name) || match(d.code) || subdeptsFiltered.length > 0 || sectorsFiltered.length > 0;
        if (!keepDept) return null;
        return { 
          ...d, 
          subdepartments: subdeptsFiltered.length > 0 ? subdeptsFiltered : undefined,
          sectors: subdeptsFiltered.length === 0 ? sectorsFiltered : undefined,
        };
      })
      .filter((d): d is DepartmentNode => Boolean(d));
  }, [departments, subdepartments, positions, search, sectors, filters]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const headers = {
        ...getAuthHeadersWithTenant(),
        "Content-Type": "application/json",
      };

      // Obter orgId do tenant
      const orgId = localStorage.getItem("selected_org_id") || "";
      
      const [dRes, sdRes, sRes, pRes] = await Promise.all([
        fetch("/api/departments", { headers, cache: "no-store" }),
        orgId ? fetch(`/api/subdepartments?orgId=${orgId}&status=ativo&limite=1000`, { headers, cache: "no-store" }) : Promise.resolve({ ok: false }),
        fetch("/api/sectors", { headers, cache: "no-store" }),
        fetch("/api/positions", { headers, cache: "no-store" }),
      ]);

      if (dRes.ok) {
        const data = (await dRes.json()) as ListResponse<Department>;
        setDepartments(data.itens ?? []);
      }
      if (sdRes.ok) {
        const data = (await sdRes.json()) as ListResponse<Subdepartment>;
        setSubdepartments(data.itens ?? []);
      }
      if (sRes.ok) {
        const data = (await sRes.json()) as ListResponse<Sector>;
        setSectors(data.itens ?? []);
      }
      if (pRes.ok) {
        const data = (await pRes.json()) as ListResponse<Position>;
        setPositions(data.itens ?? []);
      }
    } catch (e) {
      console.error(e);
      notificationCenter.add({
        type: "error",
        title: "Falha ao carregar estrutura",
        message: "Não foi possível carregar departamentos/setores/cargos.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const resetDrawer = useCallback(() => {
    setDrawerErrors({});
    setDrawerBusy(false);
  }, []);

  const openCreateDepartment = useCallback(() => {
    resetDrawer();
    setDrawerMode("create");
    setDrawerType("department");
    setDeptDraft({
      name: "",
      code: "",
      description: "",
      parentId: "",
      status: "ativo",
    });
    setDrawerOpen(true);
  }, [resetDrawer]);

  const openCreateSector = useCallback(
    (departmentId: string) => {
      resetDrawer();
      setDrawerMode("create");
      setDrawerType("sector");
      setSectorDraft({
        name: "",
        code: "",
        description: "",
        departmentId,
        parentId: "",
        status: "ativo",
      });
      setDrawerOpen(true);
    },
    [resetDrawer],
  );

  const openCreatePosition = useCallback(
    (sectorId: string) => {
      resetDrawer();
      setDrawerMode("create");
      setDrawerType("position");
      setPositionDraft({
        name: "",
        code: "",
        description: "",
        sectorId,
        status: "ativo",
      });
      setDrawerOpen(true);
    },
    [resetDrawer],
  );

  const openEditNode = useCallback(
    (node: SelectedNode) => {
      resetDrawer();
      setDrawerMode("edit");
      setDrawerType(node.type);

      if (node.type === "department") {
        const d = departments.find((x) => x.departmentId === node.id);
        setDeptDraft({
          departmentId: node.id,
          name: d?.name ?? node.data.name,
          code: d?.code ?? node.data.code,
          description: d?.description ?? "",
          parentId: d?.parentId ?? "",
          status: d?.status ?? node.data.status,
        });
      } else if (node.type === "sector") {
        const s = sectors.find((x) => x.id === node.id);
        setSectorDraft({
          id: node.id,
          name: s?.name ?? node.data.name,
          code: s?.code ?? node.data.code,
          description: s?.description ?? "",
          departmentId: s?.departmentId ?? node.data.departmentId,
          parentId: s?.parentId ?? "",
          status: s?.status ?? node.data.status,
        });
      } else {
        const p = positions.find((x) => x.id === node.id);
        setPositionDraft({
          id: node.id,
          name: p?.name ?? node.data.name,
          code: p?.code ?? node.data.code,
          description: p?.description ?? "",
          sectorId: p?.sectorId ?? node.data.sectorId,
          status: p?.status ?? node.data.status,
        });
      }

      setDrawerOpen(true);
    },
    [departments, positions, resetDrawer, sectors],
  );

  const validateDrawer = useCallback(() => {
    const errors: Record<string, string> = {};

    if (drawerType === "department") {
      if (deptDraft.name.trim().length < 2) errors.name = "Nome mínimo: 2 caracteres";
      if (deptDraft.code.trim().length < 1) errors.code = "Código obrigatório";
    }

    if (drawerType === "sector") {
      if (!sectorDraft.departmentId) errors.departmentId = "Departamento obrigatório";
      if (sectorDraft.name.trim().length < 3) errors.name = "Nome mínimo: 3 caracteres";
      if (sectorDraft.code.trim().length < 2) errors.code = "Código mínimo: 2 caracteres";
    }

    if (drawerType === "position") {
      if (!positionDraft.sectorId) errors.sectorId = "Setor obrigatório";
      if (positionDraft.name.trim().length < 3) errors.name = "Nome mínimo: 3 caracteres";
      if (positionDraft.code.trim().length < 2) errors.code = "Código mínimo: 2 caracteres";
    }

    setDrawerErrors(errors);
    return Object.keys(errors).length === 0;
  }, [deptDraft, drawerType, positionDraft, sectorDraft]);

  const saveDrawer = useCallback(async () => {
    if (!validateDrawer()) return;

    // reforço: ações “sensíveis” (create/edit) em ARMED pedem motivo
    if (armedMode && !reason.trim()) {
      notificationCenter.add({
        type: "error",
        title: "ARMED MODE",
        message: "Informe um motivo para executar create/edit (ação auditável).",
      });
      return;
    }

    setDrawerBusy(true);
    try {
      if (drawerType === "department") {
        const body =
          drawerMode === "create"
            ? {
                name: deptDraft.name.trim(),
                code: deptDraft.code.trim(),
                description: deptDraft.description.trim() || null,
                parentId: deptDraft.parentId || null,
                status: deptDraft.status,
                metadata: {
                  ui: "orgcc",
                  reason: reason.trim() || undefined,
                },
              }
            : {
                name: deptDraft.name.trim(),
                code: deptDraft.code.trim(),
                description: deptDraft.description.trim() || null,
                parentId: deptDraft.parentId || null,
                status: deptDraft.status,
                metadata: {
                  ui: "orgcc",
                  reason: reason.trim() || undefined,
                },
              };

        const url =
          drawerMode === "create"
            ? "/api/departments"
            : `/api/departments/${deptDraft.departmentId}`;
        const method = drawerMode === "create" ? "POST" : "PUT";

        const res = await fetch(url, {
          method,
          headers: { ...getAuthHeadersWithTenant(), "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const msg = await res.json().catch(() => ({ message: "Erro ao salvar departamento" }));
          notificationCenter.add({
            type: "error",
            title: "Falha ao salvar departamento",
            message: String(msg.message ?? "Erro"),
          });
          return;
        }
      } else if (drawerType === "sector") {
        const body =
          drawerMode === "create"
            ? {
                name: sectorDraft.name.trim(),
                code: sectorDraft.code.trim(),
                description: sectorDraft.description.trim() || null,
                departmentId: sectorDraft.departmentId,
                parentId: sectorDraft.parentId || null,
                metadata: {
                  ui: "orgcc",
                  reason: reason.trim() || undefined,
                },
              }
            : {
                name: sectorDraft.name.trim(),
                code: sectorDraft.code.trim(),
                description: sectorDraft.description.trim() || null,
                parentId: sectorDraft.parentId || null,
                status: sectorDraft.status,
                metadata: {
                  ui: "orgcc",
                  reason: reason.trim() || undefined,
                },
              };

        const url =
          drawerMode === "create" ? "/api/sectors" : `/api/sectors/${sectorDraft.id}`;
        const method = drawerMode === "create" ? "POST" : "PUT";

        const res = await fetch(url, {
          method,
          headers: { ...getAuthHeadersWithTenant(), "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const msg = await res.json().catch(() => ({ message: "Erro ao salvar setor" }));
          notificationCenter.add({
            type: "error",
            title: "Falha ao salvar setor",
            message: String(msg.message ?? "Erro"),
          });
          return;
        }
      } else {
        const body =
          drawerMode === "create"
            ? {
                name: positionDraft.name.trim(),
                code: positionDraft.code.trim(),
                description: positionDraft.description.trim() || null,
                sectorId: positionDraft.sectorId,
                metadata: {
                  ui: "orgcc",
                  reason: reason.trim() || undefined,
                },
              }
            : {
                name: positionDraft.name.trim(),
                code: positionDraft.code.trim(),
                description: positionDraft.description.trim() || null,
                status: positionDraft.status,
                metadata: {
                  ui: "orgcc",
                  reason: reason.trim() || undefined,
                },
              };

        const url =
          drawerMode === "create"
            ? "/api/positions"
            : `/api/positions/${positionDraft.id}`;
        const method = drawerMode === "create" ? "POST" : "PUT";

        const res = await fetch(url, {
          method,
          headers: { ...getAuthHeadersWithTenant(), "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const msg = await res.json().catch(() => ({ message: "Erro ao salvar cargo" }));
          notificationCenter.add({
            type: "error",
            title: "Falha ao salvar cargo",
            message: String(msg.message ?? "Erro"),
          });
          return;
        }
      }

      notificationCenter.add({
        type: "success",
        title: "Alteração aplicada",
        message: "Estrutura atualizada e auditável.",
      });

      setDrawerOpen(false);
      await loadAll();
    } finally {
      setDrawerBusy(false);
    }
  }, [
    armedMode,
    deptDraft,
    drawerMode,
    drawerType,
    loadAll,
    positionDraft,
    reason,
    sectorDraft,
    validateDrawer,
  ]);

  const deleteNode = useCallback(
    async (node: SelectedNode) => {
      if (armedMode && !reason.trim()) {
        notificationCenter.add({
          type: "error",
          title: "ARMED MODE",
          message: "Informe um motivo para executar delete (ação auditável).",
        });
        return;
      }

      const ok = confirm(`Confirma exclusão de ${entityLabel(node)}? Esta ação pode ser irreversível.`);
      if (!ok) return;

      setDrawerBusy(true);
      try {
        const url =
          node.type === "department"
            ? `/api/departments/${node.id}`
            : node.type === "sector"
              ? `/api/sectors/${node.id}`
              : `/api/positions/${node.id}`;

        const res = await fetch(url, {
          method: "DELETE",
          headers: { ...getAuthHeadersWithTenant(), "Content-Type": "application/json" },
        });

        if (!res.ok && res.status !== 204) {
          const msg = await res.json().catch(() => ({ message: "Erro ao deletar" }));
          notificationCenter.add({
            type: "error",
            title: "Falha ao deletar",
            message: String(msg.message ?? "Erro"),
          });
          return;
        }

        notificationCenter.add({
          type: "success",
          title: "Removido",
          message: "Estrutura atualizada.",
        });

        setSelected(null);
        setTab("overview");
        await loadAll();
      } finally {
        setDrawerBusy(false);
      }
    },
    [armedMode, loadAll, reason],
  );

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const handleExport = useCallback(async (format: "pdf" | "excel" | "json") => {
    try {
      // Coletar todos os dados da estrutura organizacional
      const exportData: Array<{
        Tipo: string;
        ID: string;
        Nome: string;
        Código: string;
        Descrição: string | null;
        Status: string;
        "Departamento Pai"?: string;
        "Setor Pai"?: string;
        "Setor Vinculado"?: string;
        "Criado Em": string;
        "Atualizado Em": string;
      }> = [];

      // Adicionar departamentos
      for (const dept of departments) {
        const parentDept = departments.find((d) => d.departmentId === dept.parentId);
        exportData.push({
          Tipo: "Departamento",
          ID: dept.departmentId,
          Nome: dept.name,
          Código: dept.code,
          Descrição: dept.description,
          Status: dept.status,
          "Departamento Pai": parentDept ? `${parentDept.name} (${parentDept.code})` : undefined,
          "Criado Em": new Date(dept.createdAt).toLocaleString("pt-BR"),
          "Atualizado Em": new Date(dept.updatedAt).toLocaleString("pt-BR"),
        });
      }

      // Adicionar setores
      for (const sector of sectors) {
        const dept = departments.find((d) => d.departmentId === sector.departmentId);
        const parentSector = sectors.find((s) => s.id === sector.parentId);
        exportData.push({
          Tipo: "Setor",
          ID: sector.id,
          Nome: sector.name,
          Código: sector.code,
          Descrição: sector.description,
          Status: sector.status,
          "Setor Vinculado": dept ? `${dept.name} (${dept.code})` : undefined,
          "Setor Pai": parentSector ? `${parentSector.name} (${parentSector.code})` : undefined,
          "Criado Em": new Date(sector.createdAt).toLocaleString("pt-BR"),
          "Atualizado Em": new Date(sector.updatedAt).toLocaleString("pt-BR"),
        });
      }

      // Adicionar cargos
      for (const position of positions) {
        const sector = sectors.find((s) => s.id === position.sectorId);
        exportData.push({
          Tipo: "Cargo",
          ID: position.id,
          Nome: position.name,
          Código: position.code,
          Descrição: position.description,
          Status: position.status,
          "Setor Vinculado": sector ? `${sector.name} (${sector.code})` : undefined,
          "Criado Em": new Date(position.createdAt).toLocaleString("pt-BR"),
          "Atualizado Em": new Date(position.updatedAt).toLocaleString("pt-BR"),
        });
      }

      if (exportData.length === 0) {
        notificationCenter.add({
          type: "warning",
          title: "Nenhum dado para exportar",
          message: "Não há dados na estrutura organizacional para exportar.",
        });
        return;
      }

      if (format === "json") {
        const jsonContent = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `estrutura_organizacional_${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else if (format === "excel") {
        // Excel format (tab-separated with UTF-8 BOM)
        const headers = Object.keys(exportData[0] || {});
        const csvRows = [
          headers.join("\t"),
          ...exportData.map((row) =>
            headers
              .map((header) => {
                const value = row[header as keyof typeof row];
                return value ?? "";
              })
              .join("\t"),
          ),
        ];
        const csvContent = "\uFEFF" + csvRows.join("\n"); // BOM UTF-8 for Excel
        const blob = new Blob([csvContent], { type: "text/tab-separated-values;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `estrutura_organizacional_${new Date().toISOString().split("T")[0]}.xls`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else if (format === "pdf") {
        // Para PDF, vamos criar um HTML simples que pode ser impresso
        // Em produção, poderia usar jsPDF ou similar
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Estrutura Organizacional - ${new Date().toLocaleDateString("pt-BR")}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; font-weight: bold; }
    tr:nth-child(even) { background-color: #f9f9f9; }
  </style>
</head>
<body>
  <h1>Estrutura Organizacional</h1>
  <p>Exportado em: ${new Date().toLocaleString("pt-BR")}</p>
  <table>
    <thead>
      <tr>
        ${Object.keys(exportData[0] || {}).map((h) => `<th>${h}</th>`).join("")}
      </tr>
    </thead>
    <tbody>
      ${exportData.map((row) => `<tr>${Object.values(row).map((v) => `<td>${v ?? ""}</td>`).join("")}</tr>`).join("")}
    </tbody>
  </table>
</body>
</html>
        `;
        const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `estrutura_organizacional_${new Date().toISOString().split("T")[0]}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        notificationCenter.add({
          type: "info",
          title: "Exportação PDF",
          message: "Arquivo HTML gerado. Use 'Imprimir' no navegador e salve como PDF.",
        });
        return;
      }

      notificationCenter.add({
        type: "success",
        title: "Exportação concluída",
        message: `${exportData.length} registro(s) exportado(s) em ${format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error("Erro ao exportar:", error);
      notificationCenter.add({
        type: "error",
        title: "Erro na exportação",
        message: "Não foi possível exportar a estrutura organizacional.",
      });
    }
  }, [departments, sectors, positions]);

  // ===== Members =====
  const membersApiBase = useMemo(() => {
    if (!selected) return null;
    if (selected.type === "department") return `/api/departments/${selected.id}/members`;
    if (selected.type === "sector") return `/api/sectors/${selected.id}/members`;
    return `/api/positions/${selected.id}/members`;
  }, [selected]);

  const loadUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users", {
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = (await res.json()) as { itens?: UserData[] };
      setUsers(data.itens ?? []);
    } catch {
      // ignore
    }
  }, []);

  const loadMembers = useCallback(async () => {
    if (!membersApiBase) return;
    setMembersLoading(true);
    try {
      const res = await fetch(membersApiBase, {
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });
      if (!res.ok) {
        setMembers([]);
        return;
      }
      const data = (await res.json()) as { itens?: MemberInfo[] };
      setMembers(data.itens ?? []);
      await loadUsers();
    } catch {
      setMembers([]);
    } finally {
      setMembersLoading(false);
    }
  }, [loadUsers, membersApiBase]);

  useEffect(() => {
    if (!selected) return;
    if (tab !== "members") return;
    void loadMembers();
  }, [loadMembers, selected, tab]);

  const availableUsers = useMemo(() => {
    const memberIds = new Set(members.map((m) => m.userId));
    return users.filter((u) => !memberIds.has(u.userId));
  }, [members, users]);

  const filteredMembers = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => {
      const name = m.user.displayName ?? "";
      return `${name} ${m.user.email}`.toLowerCase().includes(q);
    });
  }, [memberSearch, members]);

  const addMember = useCallback(async () => {
    if (!membersApiBase) return;
    if (!selected) return;
    if (!addUserId) return;

    if (armedMode && !reason.trim()) {
      notificationCenter.add({
        type: "error",
        title: "ARMED MODE",
        message: "Informe um motivo para executar ações sensíveis.",
      });
      return;
    }

    setMembersBusy(true);
    try {
      const res = await fetch(membersApiBase, {
        method: "POST",
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: addUserId, role: addRole, reason: reason.trim() || undefined }),
      });

      if (!res.ok) {
        const msg = await res.json().catch(() => ({ message: "Erro ao adicionar membro" }));
        notificationCenter.add({
          type: "error",
          title: "Falha ao adicionar membro",
          message: String(msg.message ?? "Erro"),
        });
        return;
      }

      notificationCenter.add({
        type: "success",
        title: "Membro adicionado",
        message: `${entityLabel(selected)} atualizado.`,
      });
      setAddUserId("");
      await loadMembers();
    } finally {
      setMembersBusy(false);
    }
  }, [addRole, addUserId, armedMode, loadMembers, membersApiBase, reason, selected]);

  const removeMember = useCallback(
    async (userId: string) => {
      if (!membersApiBase) return;
      if (!selected) return;

      if (armedMode && !reason.trim()) {
        notificationCenter.add({
          type: "error",
          title: "ARMED MODE",
          message: "Informe um motivo para executar ações sensíveis.",
        });
        return;
      }

      setMembersBusy(true);
      try {
        const res = await fetch(`${membersApiBase}/${userId}`, {
          method: "DELETE",
          headers: {
            ...getAuthHeadersWithTenant(),
            "Content-Type": "application/json",
          },
        });

        if (!res.ok && res.status !== 204) {
          const msg = await res.json().catch(() => ({ message: "Erro ao remover membro" }));
          notificationCenter.add({
            type: "error",
            title: "Falha ao remover membro",
            message: String(msg.message ?? "Erro"),
          });
          return;
        }

        notificationCenter.add({
          type: "success",
          title: "Membro removido",
          message: `${entityLabel(selected)} atualizado.`,
        });
        await loadMembers();
      } finally {
        setMembersBusy(false);
      }
    },
    [armedMode, loadMembers, membersApiBase, reason, selected],
  );

  // ===== Permissions =====
  const permissionsApiBase = useMemo(() => {
    if (!selected) return null;
    if (selected.type === "department") return `/api/departments/${selected.id}/permissions`;
    if (selected.type === "sector") return `/api/sectors/${selected.id}/permissions`;
    return `/api/positions/${selected.id}/permissions`;
  }, [selected]);

  const isPendingForCurrent = useMemo(() => {
    if (!selected || !pendingApproval) return false;
    if (pendingApproval.entityType !== selected.type) return false;
    if (pendingApproval.entityId !== selected.id) return false;
    if (!permPermissionId) return true; // sem perm selecionada, ainda consideramos lock geral do painel
    return pendingApproval.permissionId === permPermissionId;
  }, [pendingApproval, permPermissionId, selected]);

  const loadPermissions = useCallback(async () => {
    if (!permissionsApiBase) return;
    setPermLoading(true);
    try {
      const res = await fetch(permissionsApiBase, { cache: "no-store" });
      if (!res.ok) {
        setPermGrants([]);
        return;
      }
      const data = (await res.json()) as { itens?: PermissionGrant[] };
      setPermGrants(data.itens ?? []);
    } catch {
      setPermGrants([]);
    } finally {
      setPermLoading(false);
    }
  }, [permissionsApiBase]);

  const loadPendingApprovalInfo = useCallback(async () => {
    if (!pendingApproval) {
      setPendingApprovalInfo(null);
      return;
    }

    try {
      const params = new URLSearchParams();
      params.set("status", "pending");
      params.set("entityType", pendingApproval.entityType);
      params.set("entityId", pendingApproval.entityId);
      params.set("permissionId", pendingApproval.permissionId);
      params.set("limite", "20");

      const res = await fetch(`/api/permissions/change-requests?${params.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) return;

      const data = (await res.json()) as { itens?: Array<Record<string, unknown>> };
      const itens = Array.isArray(data?.itens) ? data.itens : [];
      const hit = itens.find((r) => r && typeof r === "object" && r.id === pendingApproval.requestId) as
        | Record<string, unknown>
        | undefined;

      if (!hit) return;

      setPendingApprovalInfo({
        requestId: pendingApproval.requestId,
        status: typeof hit.status === "string" ? hit.status : "pending",
        slaDueAt:
          typeof hit.slaDueAt === "string" || hit.slaDueAt instanceof Date
            ? (hit.slaDueAt as string | Date)
            : null,
        createdAt:
          typeof hit.createdAt === "string" || hit.createdAt instanceof Date
            ? (hit.createdAt as string | Date)
            : null,
      });
    } catch {
      // ignore
    }
  }, [pendingApproval]);

  const loadPermissionCatalog = useCallback(async () => {
    const q = permCatalogQuery.trim();
    if (q.length > 0 && q.length < 2) {
      setPermCatalogItems([]);
      return;
    }

    setPermCatalogLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.length >= 2) params.set("busca", q);

      const res = await fetch(`/api/permissions${params.toString() ? `?${params.toString()}` : ""}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        setPermCatalogItems([]);
        return;
      }
      const data = (await res.json()) as { itens?: PermissionCatalogItem[] };
      setPermCatalogItems(data.itens ?? []);
    } catch {
      setPermCatalogItems([]);
    } finally {
      setPermCatalogLoading(false);
    }
  }, [permCatalogQuery]);

  useEffect(() => {
    if (!permCatalogOpen) return;
    const t = setTimeout(() => {
      void loadPermissionCatalog();
    }, 250);
    return () => clearTimeout(t);
  }, [loadPermissionCatalog, permCatalogOpen]);

  useEffect(() => {
    if (!selected) return;
    if (tab !== "permissions") return;
    void loadPermissions();
  }, [loadPermissions, selected, tab]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset state when selected changes (efeito intencional)
  useEffect(() => {
    // Ao trocar o nó, limpa pendência para não “vazar” lock entre entidades.
    setPendingApproval(null);
    setPendingApprovalInfo(null);
    setPermPermissionId("");
    setPermSelected(null);
  }, [selected?.id, selected?.type]);

  useEffect(() => {
    if (!pendingApproval) return;
    if (tab !== "permissions") return;
    void loadPendingApprovalInfo();
    const t = setInterval(() => {
      void loadPendingApprovalInfo();
    }, 15_000);
    return () => clearInterval(t);
  }, [loadPendingApprovalInfo, pendingApproval, tab]);

  const applyPermission = useCallback(async () => {
    if (!permissionsApiBase) return;
    if (!selected) return;
    if (!permPermissionId) return;

    if (isPendingForCurrent) {
      notificationCenter.add({
        type: "warning",
        title: "Request pendente",
        message: "Já existe uma solicitação pendente para esta mudança. Abra as aprovações para decidir.",
      });
      return;
    }

    if (armedMode && !reason.trim()) {
      notificationCenter.add({
        type: "error",
        title: "ARMED MODE",
        message: "Informe um motivo para executar ações sensíveis.",
      });
      return;
    }

    setPermBusy(true);
    try {
      const res = await fetch(permissionsApiBase, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          permissionId: permPermissionId,
          granted: permGranted,
          reason: reason.trim() || undefined,
        }),
      });

      // 202 = mudança sensível → fila de aprovação
      if (res.status === 202) {
        const data = (await res.json().catch(() => null)) as
          | null
          | {
              pending?: boolean;
              requestId?: string;
              permissionId?: string;
              permissionKey?: string;
              status?: string;
            };

        if (data?.pending && typeof data.requestId === "string") {
          setPendingApproval({
            requestId: data.requestId,
            permissionId: String(data.permissionId ?? permPermissionId),
            permissionKey: typeof data.permissionKey === "string" ? data.permissionKey : undefined,
            entityType: selected.type,
            entityId: selected.id,
          });
          setPendingApprovalInfo(null);
          void loadPendingApprovalInfo();

          notificationCenter.add({
            type: "warning",
            title: "Mudança enviada para aprovação",
            message: `Request ${data.requestId} está pendente. Abra /admin/permissions/approvals para decidir.`,
          });

          return;
        }
      }

      if (!res.ok && res.status !== 204) {
        const msg = await res.json().catch(() => ({ message: "Erro ao aplicar permissão" }));
        notificationCenter.add({
          type: "error",
          title: "Falha ao aplicar permissão",
          message: String(msg.message ?? "Erro"),
        });
        return;
      }

      notificationCenter.add({
        type: "success",
        title: "Permissão aplicada",
        message: `${entityLabel(selected)} atualizado.`,
      });

      setPermPermissionId("");
      setPendingApproval(null);
      setPendingApprovalInfo(null);
      await loadPermissions();
    } finally {
      setPermBusy(false);
    }
  }, [
    armedMode,
    isPendingForCurrent,
    loadPermissions,
    loadPendingApprovalInfo,
    permGranted,
    permPermissionId,
    permissionsApiBase,
    reason,
    selected,
  ]);

  const handleSelectNode = useCallback(
    (node: { type: "department" | "sector" | "position"; id: string; data: DepartmentNode | SectorNode | PositionNode }) => {
      setSelected(node as SelectedNode);
      setTab("overview");
    },
    [],
  );

  const crumbs = useMemo(() => {
    if (!selected) return [] as Array<{ label: string; code?: string }>;

    if (selected.type === "department") {
      return [{ label: selected.data.name, code: selected.data.code }];
    }

    if (selected.type === "sector") {
      const dept = departments.find((d) => d.departmentId === selected.data.departmentId);
      return [
        { label: dept?.name ?? "Departamento", code: dept?.code },
        { label: selected.data.name, code: selected.data.code },
      ];
    }

    // position
    const sector = sectors.find((s) => s.id === selected.data.sectorId);
    const dept = sector ? departments.find((d) => d.departmentId === sector.departmentId) : null;

    return [
      { label: dept?.name ?? "Departamento", code: dept?.code },
      { label: sector?.name ?? "Setor", code: sector?.code },
      { label: selected.data.name, code: selected.data.code },
    ];
  }, [departments, sectors, selected]);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 holo-grid opacity-[0.07]" />
      <div className="pointer-events-none absolute inset-0 beam-line opacity-[0.08]" />

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.32em] text-[hsl(var(--primary))]">
              <Shield className="h-3.5 w-3.5" />
              ORG_COMMAND_CENTER
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
              Estrutura Organizacional
            </h2>
            <p className="mt-1 max-w-[80ch] text-sm text-white/55">
              Controle hierárquico corporativo: Empresa → Departamento → Subdepartamento → Setor → Cargo.
              (Subdepartamento: em implantação)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" type="button" onClick={() => void loadAll()} disabled={loading}>
              <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
              Recarregar
            </Button>
          </div>
        </div>

        {/* Advanced Toolbar */}
        <OrganizationalToolbar
          search={search}
          onSearchChange={setSearch}
          filters={filters}
          onFiltersChange={setFilters}
          onExport={(format) => {
            void handleExport(format);
          }}
          onViewOrganogram={() => {
            setOrganogramView(true);
          }}
          armedMode={armedMode}
          onToggleArmedMode={() => setArmedMode((prev) => !prev)}
        />

        {armedMode ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-2 border-red-500/50 bg-[linear-gradient(135deg,rgba(239,68,68,0.15)_0%,rgba(239,68,68,0.05)_100%)] p-4 shadow-[0_0_30px_rgba(239,68,68,0.3)]"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-red-500/50 bg-red-500/20">
                <AlertTriangle className="h-5 w-5 text-red-400 animate-pulse" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="text-xs font-mono tracking-[0.32em] text-red-400 uppercase">
                    ⚡ ARMED MODE ATIVO
                  </div>
                  <div className="h-2 w-2 animate-pulse bg-red-500" />
                </div>
                <div className="mt-2 text-sm font-medium text-white/90">
                  Ações sensíveis exigem motivo obrigatório. Todas as alterações serão registradas em auditoria e podem acionar workflows de aprovação.
                </div>
                <div className="mt-4">
                  <Input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Digite o motivo da ação sensível (obrigatório)"
                    className="font-mono border-red-500/30 bg-red-500/10 focus:border-red-400"
                  />
                  {!reason && (
                    <p className="mt-1 text-xs text-red-400">
                      ⚠️ Motivo é obrigatório para ações sensíveis
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setArmedMode(false);
                  setReason("");
                }}
                className="flex h-8 w-8 shrink-0 items-center justify-center border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                title="Desativar ARMED MODE"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
          {/* Left: Tree */}
          <GlassCard className="relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,hsl(var(--primary))/0.10,transparent_55%)]" />
            <div className="relative space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                  <FolderTree className="h-4 w-4 text-[hsl(var(--primary))]" />
                  Hierarquia
                </div>
                <div className="text-[11px] text-white/40 font-mono">
                  {loading ? "sync…" : `${departments.length} dep / ${sectors.length} set / ${positions.length} cargo`}
                </div>
              </div>

              {/* Search moved to toolbar */}

              <OrganizationTree
                departments={tree}
                selectedId={selected ? `${selected.type}-${selected.id}` : undefined}
                onSelect={(n) => handleSelectNode(n)}
                onEdit={(n) => openEditNode(n as SelectedNode)}
                onDelete={(n) => void deleteNode(n as SelectedNode)}
                onAddChild={(parentType, parentId) => {
                  if (parentType === "department") openCreateSector(parentId);
                  else openCreatePosition(parentId);
                }}
                expanded={expanded}
                onToggleExpand={(id) => {
                  setExpanded((prev) => {
                    const next = new Set(prev);
                    if (next.has(id)) next.delete(id);
                    else next.add(id);
                    return next;
                  });
                }}
              />

              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  type="button"
                  onClick={() => {
                    openCreateDepartment();
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Departamento
                </Button>
              </div>
            </div>
          </GlassCard>

          {/* Right: Details */}
          <GlassCard className="relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,hsl(var(--accent))/0.10,transparent_55%)]" />
            <div className="relative space-y-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="text-[10px] font-mono tracking-[0.28em] text-white/40">
                    {entityLabel(selected)}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {crumbs.length === 0 ? (
                      <span className="text-sm text-white/50">Selecione um nó na árvore.</span>
                    ) : (
                      crumbs.map((c, idx) => (
                        <div key={`${c.label}-${idx}`} className="inline-flex items-center gap-2">
                          <span className="text-sm font-semibold text-white/80 truncate max-w-[24ch]">
                            {c.label}
                          </span>
                          {c.code ? (
                            <span className="border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-mono text-white/60">
                              {c.code}
                            </span>
                          ) : null}
                          {idx < crumbs.length - 1 ? (
                            <ChevronRight className="h-4 w-4 text-white/20" />
                          ) : null}
                        </div>
                      ))
                    )}
                  </div>
                  <div className="mt-2 text-xs text-white/45">
                    Subdepartamento: <span className="text-white/60 font-mono">RESERVED_LAYER</span>
                  </div>
                </div>

                {selected ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => openEditNode(selected)}
                      disabled={drawerBusy}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => void deleteNode(selected)}
                      disabled={drawerBusy}
                      className="text-[hsl(var(--danger))]"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Deletar
                    </Button>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {(
                  [
                    { id: "overview", label: "Visão", icon: Building2 },
                    { id: "members", label: "Members", icon: Users },
                    { id: "permissions", label: "Permissões", icon: Shield },
                    { id: "audit", label: "Auditoria", icon: CheckCircle2 },
                    { id: "move", label: "Movimentações", icon: XCircle },
                    { id: "import-export", label: "Import/Export", icon: Download },
                  ] as const
                ).map((t) => {
                  const Icon = t.icon;
                  const active = tab === t.id;
                  const disabled = !selected;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => setTab(t.id)}
                      className={cn(
                        "inline-flex items-center gap-2 border px-3 py-2 text-xs font-mono tracking-[0.18em] transition",
                        disabled && "opacity-40 cursor-not-allowed",
                        active
                          ? "border-[hsl(var(--primary)/0.35)] bg-[hsl(var(--primary)/0.12)] text-white"
                          : "border-white/10 bg-white/5 text-white/60 hover:bg-white/8 hover:text-white",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {!selected ? (
                <div className="border border-white/10 bg-black/20 p-6 text-sm text-white/50">
                  Selecione um nó para abrir o painel operacional.
                </div>
              ) : tab === "overview" ? (
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="border border-white/10 bg-black/20 p-3">
                    <div className="text-xs text-white/50">Tipo</div>
                    <div className="mt-1 text-sm text-white/80 font-mono">{selected.type}</div>
                  </div>
                  <div className="border border-white/10 bg-black/20 p-3">
                    <div className="text-xs text-white/50">Código</div>
                    <div className="mt-1 text-sm text-white/80 font-mono">{selected.data.code}</div>
                  </div>
                  <div className="border border-white/10 bg-black/20 p-3">
                    <div className="text-xs text-white/50">Status</div>
                    <div className="mt-1 text-sm text-white/80 font-mono">{selected.data.status}</div>
                  </div>

                  <div className="md:col-span-3 border border-white/10 bg-black/20 p-3">
                    <div className="text-xs text-white/50">Camada Subdepartamento</div>
                    <div className="mt-2 text-sm text-white/60">
                      Esta camada será inserida entre Departamento e Setor. O Command Center já está
                      preparado para a migração sem retrabalho.
                    </div>
                  </div>
                </div>
              ) : tab === "members" ? (
                <div className="space-y-3">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="text-sm font-medium text-white/80">Members</div>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => void loadMembers()}
                      disabled={membersLoading || membersBusy}
                    >
                      <RefreshCw className={cn("mr-2 h-4 w-4", (membersLoading || membersBusy) && "animate-spin")} />
                      Recarregar
                    </Button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="border border-white/10 bg-black/20 p-3">
                      <div className="text-xs text-white/50">Adicionar</div>
                      <div className="mt-2 grid gap-2">
                        <select
                          value={addUserId}
                          onChange={(e) => setAddUserId(e.target.value)}
                          className="h-12 w-full border border-white/10 bg-black/30 px-3 text-sm text-white/80 outline-none font-mono"
                        >
                          <option value="">Selecionar usuário…</option>
                          {availableUsers.map((u) => (
                            <option key={u.userId} value={u.userId}>
                              {(u.displayName ?? u.email) + " • " + u.email}
                            </option>
                          ))}
                        </select>

                        <select
                          value={addRole}
                          onChange={(e) => setAddRole(e.target.value as (typeof ROLE_OPTIONS)[number]["value"])}
                          className="h-12 w-full border border-white/10 bg-black/30 px-3 text-sm text-white/80 outline-none font-mono"
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>

                        <Button
                          type="button"
                          onClick={() => void addMember()}
                          disabled={!addUserId || membersBusy}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Adicionar
                        </Button>
                      </div>
                    </div>

                    <div className="border border-white/10 bg-black/20 p-3">
                      <div className="text-xs text-white/50">Buscar</div>
                      <div className="mt-2">
                        <Input
                          value={memberSearch}
                          onChange={(e) => setMemberSearch(e.target.value)}
                          placeholder="Filtrar por nome/email…"
                          className="font-mono"
                        />
                      </div>
                      <div className="mt-2 text-[11px] text-white/40">
                        {membersLoading ? "carregando…" : `${members.length} membro(s)`}
                      </div>
                    </div>
                  </div>

                  <div className="max-h-[420px] overflow-auto space-y-2">
                    {membersLoading ? (
                      <div className="border border-white/10 bg-black/20 p-4 text-sm text-white/50">
                        Carregando membros…
                      </div>
                    ) : filteredMembers.length === 0 ? (
                      <div className="border border-white/10 bg-black/20 p-4 text-sm text-white/50">
                        Nenhum membro.
                      </div>
                    ) : (
                      filteredMembers.map((m) => (
                        <div key={m.membershipId} className="border border-white/10 bg-white/5 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-sm text-white/80 truncate">
                                {m.user.displayName ?? m.user.email}
                              </div>
                              <div className="text-[11px] text-white/40 font-mono truncate">{m.user.email}</div>
                              <div className="mt-1 text-[11px] text-white/50 font-mono">role: {m.role}</div>
                            </div>
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => void removeMember(m.userId)}
                              disabled={membersBusy}
                            >
                              Remover
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : tab === "permissions" ? (
                <div className="space-y-3">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="text-sm font-medium text-white/80">Permissões (grant/deny)</div>
                    <Button type="button" variant="secondary" onClick={() => void loadPermissions()} disabled={permLoading || permBusy}>
                      <RefreshCw className={cn("mr-2 h-4 w-4", (permLoading || permBusy) && "animate-spin")} />
                      Recarregar
                    </Button>
                  </div>

                  <div className="border border-white/10 bg-black/20 p-3">
                    <div className="text-xs text-white/50">Aplicar (catálogo)</div>
                    <div className="mt-2 grid gap-2 md:grid-cols-[1fr_180px_180px]">
                      <Popover
                        open={permCatalogOpen}
                        onOpenChange={(open) => {
                          if (isPendingForCurrent) return;
                          setPermCatalogOpen(open);
                        }}
                      >
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            disabled={isPendingForCurrent}
                            className={cn(
                              "h-12 w-full border border-white/10 bg-black/30 px-3 text-left text-sm text-white/80 outline-none font-mono transition",
                              isPendingForCurrent
                                ? "opacity-60 cursor-not-allowed"
                                : "hover:bg-black/25",
                            )}
                            title="Selecionar permissão"
                          >
                            {permSelected
                              ? `${permSelected.module} • ${permSelected.resource}:${permSelected.action} • ${permSelected.name}`
                              : permPermissionId
                                ? permPermissionId
                                : "Selecionar permissão…"}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[520px] max-w-[calc(100vw-2rem)] p-3">
                          <div className="space-y-2">
                            <div className="relative">
                              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                              <Input
                                value={permCatalogQuery}
                                onChange={(e) => setPermCatalogQuery(e.target.value)}
                                placeholder="Buscar permissão (mín 2 chars)…"
                                className="pl-9 font-mono"
                              />
                            </div>
                            <div className="max-h-[320px] overflow-auto space-y-1">
                              {permCatalogLoading ? (
                                <div className="border border-white/10 bg-black/20 p-3 text-sm text-white/50">
                                  Carregando…
                                </div>
                              ) : permCatalogQuery.trim().length > 0 && permCatalogQuery.trim().length < 2 ? (
                                <div className="border border-white/10 bg-black/20 p-3 text-sm text-white/50">
                                  Digite 2+ caracteres para pesquisar.
                                </div>
                              ) : permCatalogItems.length === 0 ? (
                                <div className="border border-white/10 bg-black/20 p-3 text-sm text-white/50">
                                  Nenhuma permissão encontrada.
                                </div>
                              ) : (
                                permCatalogItems.slice(0, 200).map((p) => (
                                  <button
                                    key={p.permissionId}
                                    type="button"
                                    className="w-full border border-white/10 bg-white/5 px-3 py-2 text-left hover:bg-white/8 transition"
                                    onClick={() => {
                                      setPermSelected(p);
                                      setPermPermissionId(p.permissionId);
                                      setPermCatalogOpen(false);
                                    }}
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="min-w-0">
                                        <div className="text-[11px] font-mono text-white/70 truncate">
                                          {p.module} • {p.resource}:{p.action}
                                        </div>
                                        <div className="mt-1 text-sm text-white/85 truncate">{p.name}</div>
                                        {p.description ? (
                                          <div className="mt-1 text-[11px] text-white/45 line-clamp-2">{p.description}</div>
                                        ) : null}
                                      </div>
                                      <div className="text-[10px] font-mono text-white/35">{p.permissionId.slice(0, 8)}</div>
                                    </div>
                                  </button>
                                ))
                              )}
                            </div>
                            <div className="text-[11px] text-white/40">
                              Selecionado:{" "}
                              <span className="font-mono text-white/60">
                                {permPermissionId ? permPermissionId : "—"}
                              </span>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <select
                        value={permGranted ? "grant" : "deny"}
                        onChange={(e) => setPermGranted(e.target.value === "grant")}
                        disabled={isPendingForCurrent}
                        className={cn(
                          "h-12 w-full border border-white/10 bg-black/30 px-3 text-sm text-white/80 outline-none font-mono",
                          isPendingForCurrent && "opacity-60 cursor-not-allowed",
                        )}
                      >
                        <option value="grant">grant</option>
                        <option value="deny">deny</option>
                      </select>
                      <Button
                        type="button"
                        onClick={() => void applyPermission()}
                        disabled={!permPermissionId || permBusy || isPendingForCurrent}
                      >
                        Aplicar
                      </Button>
                    </div>
                    {pendingApproval ? (
                      <div className="mt-3 border border-[hsl(var(--warning)/0.30)] bg-[hsl(var(--warning)/0.08)] p-3">
                        <div className="text-xs font-mono tracking-[0.22em] text-[hsl(var(--warning))]">
                          APPROVAL_REQUIRED
                        </div>
                        <div className="mt-1 text-sm text-white/70">
                          Request <span className="font-mono text-white/80">{pendingApproval.requestId}</span> pendente
                          para {pendingApproval.entityType}:{pendingApproval.entityId}.
                        </div>
                        {pendingApprovalInfo?.slaDueAt ? (
                          <div className="mt-2 text-[11px] text-white/60 font-mono">
                            SLA:{" "}
                            {(() => {
                              const due =
                                pendingApprovalInfo.slaDueAt instanceof Date
                                  ? pendingApprovalInfo.slaDueAt
                                  : new Date(pendingApprovalInfo.slaDueAt);
                              const msLeft = due.getTime() - Date.now();
                              if (Number.isNaN(msLeft)) return "—";
                              const mins = Math.ceil(msLeft / 60_000);
                              return mins <= 0 ? `estourado (${Math.abs(mins)} min)` : `em ${mins} min`;
                            })()}
                          </div>
                        ) : null}
                        <div className="mt-2 text-[11px] text-white/55 font-mono">
                          permissionId: {pendingApproval.permissionId}
                          {pendingApproval.permissionKey ? ` • key: ${pendingApproval.permissionKey}` : ""}
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Link
                            href="/admin/permissions/approvals"
                            className="inline-flex items-center border border-white/10 bg-white/5 px-3 py-2 text-xs font-mono tracking-[0.2em] text-white/80 hover:bg-white/8 transition"
                          >
                            ABRIR_APROVAÇÕES
                          </Link>
                          <button
                            type="button"
                            className="inline-flex items-center border border-white/10 bg-white/5 px-3 py-2 text-xs font-mono tracking-[0.2em] text-white/70 hover:bg-white/8 hover:text-white transition"
                            onClick={() => setPendingApproval(null)}
                          >
                            DISPENSAR
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 text-[11px] text-white/40">
                        Se houver política RBAC ativa, mudanças sensíveis entram em approvals automaticamente.
                      </div>
                    )}
                  </div>

                  <div className="max-h-[420px] overflow-auto space-y-2">
                    {permLoading ? (
                      <div className="border border-white/10 bg-black/20 p-4 text-sm text-white/50">Carregando…</div>
                    ) : permGrants.length === 0 ? (
                      <div className="border border-white/10 bg-black/20 p-4 text-sm text-white/50">Sem permissões registradas.</div>
                    ) : (
                      permGrants.map((g) => (
                        <div key={g.id} className="border border-white/10 bg-white/5 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-sm text-white/80 font-mono truncate">{g.permissionKey ?? g.permissionId}</div>
                              <div className="mt-1 text-[11px] text-white/45 font-mono">permissionId: {g.permissionId}</div>
                            </div>
                            <div
                              className={cn(
                                "border px-2 py-1 text-[10px] font-mono tracking-[0.2em]",
                                g.granted
                                  ? "border-[hsl(var(--success)/0.30)] bg-[hsl(var(--success)/0.08)] text-[hsl(var(--success))]"
                                  : "border-[hsl(var(--danger)/0.30)] bg-[hsl(var(--danger)/0.08)] text-[hsl(var(--danger))]",
                              )}
                            >
                              {g.granted ? "GRANT" : "DENY"}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : tab === "audit" ? (
                <OrganizationalAuditPanel
                  entityType={selected?.type}
                  entityId={selected?.id}
                />
              ) : tab === "import-export" ? (
                <ImportExportPanel
                  departments={departments.map((d) => ({
                    id: d.departmentId,
                    departmentId: d.departmentId,
                    orgId: d.orgId,
                    name: d.name,
                    code: d.code,
                    description: d.description,
                    type: "CORE" as const,
                    filialId: null,
                    parentId: d.parentId,
                    active: d.status === "ativo",
                    createdAt: d.createdAt,
                    updatedAt: d.updatedAt,
                  }))}
                  subdepartments={subdepartments.map((sd) => ({
                    id: sd.subdepartmentId,
                    subdepartmentId: sd.subdepartmentId,
                    orgId: sd.orgId,
                    departmentId: sd.departmentId,
                    name: sd.name,
                    code: sd.code,
                    description: sd.description,
                    status: sd.status,
                    createdAt: sd.createdAt,
                    updatedAt: sd.updatedAt,
                  }))}
                  sectors={sectors.map((s) => ({
                    id: s.id,
                    orgId: s.orgId,
                    departmentId: s.departmentId,
                    subdepartmentId: s.subdepartmentId,
                    name: s.name,
                    code: s.code,
                    description: s.description,
                    status: s.status,
                    createdAt: s.createdAt,
                    updatedAt: s.updatedAt,
                  }))}
                  positions={positions.map((p) => ({
                    id: p.id,
                    orgId: p.orgId,
                    sectorId: p.sectorId,
                    name: p.name,
                    code: p.code,
                    description: p.description,
                    responsabilidades: p.responsabilidades,
                    requisitos: p.requisitos,
                    salarioMin: p.salarioMin,
                    salarioMax: p.salarioMax,
                    status: p.status,
                    createdAt: p.createdAt,
                    updatedAt: p.updatedAt,
                  }))}
                  orgId={departments[0]?.orgId || ""}
                  onImportComplete={async () => {
                    await loadAll();
                  }}
                />
              ) : (
                <MovePanel
                  selected={selected}
                  departments={departments}
                  sectors={sectors}
                  armedMode={armedMode}
                  reason={reason}
                  onApplied={async () => {
                    await loadAll();
                  }}
                />
              )}
            </div>
          </GlassCard>
        </div>

        {/* Drawer */}
        {drawerOpen ? (
          <div className="fixed inset-0 z-40">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              aria-hidden="true"
              onClick={() => {
                if (!drawerBusy) setDrawerOpen(false);
              }}
            />
            <div className="absolute right-0 top-0 h-full w-full max-w-[520px] border-l border-white/10 bg-[color-mix(in_oklab,hsl(var(--surface))_78%,black_22%)] shadow-[0_28px_140px_-45px_rgba(0,0,0,0.95)]">
              <div className="pointer-events-none absolute inset-0 holo-grid opacity-10" />
              <div className="relative flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                  <div>
                    <div className="text-[10px] font-mono tracking-[0.28em] text-white/40">
                      {drawerMode === "create" ? "CREATE" : "EDIT"} • {drawerType.toUpperCase()}
                    </div>
                    <div className="mt-1 text-lg font-semibold text-white/85">
                      {drawerMode === "create" ? "Nova entidade" : "Editar entidade"}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="border border-white/10 bg-white/5 px-3 py-2 text-xs font-mono tracking-[0.2em] text-white/70 hover:bg-white/8 hover:text-white transition"
                    onClick={() => {
                      if (!drawerBusy) setDrawerOpen(false);
                    }}
                  >
                    FECHAR
                  </button>
                </div>

                <div className="flex-1 overflow-auto px-6 py-5 space-y-4">
                  {drawerType === "department" ? (
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-white/50">Nome</div>
                        <Input
                          value={deptDraft.name}
                          onChange={(e) => setDeptDraft((p) => ({ ...p, name: e.target.value }))}
                          className="font-mono"
                        />
                        {drawerErrors.name ? <div className="mt-1 text-[11px] text-[hsl(var(--danger))]">{drawerErrors.name}</div> : null}
                      </div>
                      <div>
                        <div className="text-xs text-white/50">Código</div>
                        <Input
                          value={deptDraft.code}
                          onChange={(e) => setDeptDraft((p) => ({ ...p, code: e.target.value }))}
                          className="font-mono"
                        />
                        {drawerErrors.code ? <div className="mt-1 text-[11px] text-[hsl(var(--danger))]">{drawerErrors.code}</div> : null}
                      </div>
                      <div>
                        <div className="text-xs text-white/50">Descrição</div>
                        <Input
                          value={deptDraft.description}
                          onChange={(e) => setDeptDraft((p) => ({ ...p, description: e.target.value }))}
                          className="font-mono"
                        />
                      </div>
                      <div>
                        <div className="text-xs text-white/50">Parent (department)</div>
                        <select
                          value={deptDraft.parentId}
                          onChange={(e) => setDeptDraft((p) => ({ ...p, parentId: e.target.value }))}
                          className="h-12 w-full border border-white/10 bg-black/30 px-3 text-sm text-white/80 outline-none font-mono"
                        >
                          <option value="">(sem pai)</option>
                          {departments
                            .filter((d) => d.departmentId !== deptDraft.departmentId)
                            .map((d) => (
                              <option key={d.departmentId} value={d.departmentId}>
                                {d.name} • {d.code}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div>
                        <div className="text-xs text-white/50">Status</div>
                        <select
                          value={deptDraft.status}
                          onChange={(e) =>
                            setDeptDraft((p) => ({ ...p, status: e.target.value as Department["status"] }))
                          }
                          className="h-12 w-full border border-white/10 bg-black/30 px-3 text-sm text-white/80 outline-none font-mono"
                        >
                          <option value="ativo">ativo</option>
                          <option value="inativo">inativo</option>
                          <option value="arquivado">arquivado</option>
                        </select>
                      </div>
                    </div>
                  ) : drawerType === "sector" ? (
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-white/50">Departamento</div>
                        <select
                          value={sectorDraft.departmentId}
                          onChange={(e) => setSectorDraft((p) => ({ ...p, departmentId: e.target.value }))}
                          disabled={drawerMode === "edit"}
                          className={cn(
                            "h-12 w-full border border-white/10 bg-black/30 px-3 text-sm text-white/80 outline-none font-mono",
                            drawerMode === "edit" && "opacity-60 cursor-not-allowed",
                          )}
                        >
                          <option value="">Selecione…</option>
                          {departments.map((d) => (
                            <option key={d.departmentId} value={d.departmentId}>
                              {d.name} • {d.code}
                            </option>
                          ))}
                        </select>
                        {drawerMode === "edit" ? (
                          <div className="mt-1 text-[11px] text-white/40">
                            (Regras atuais: não é possível trocar departmentId em update. Move entre departamentos será um endpoint dedicado.)
                          </div>
                        ) : null}
                        {drawerErrors.departmentId ? <div className="mt-1 text-[11px] text-[hsl(var(--danger))]">{drawerErrors.departmentId}</div> : null}
                      </div>
                      <div>
                        <div className="text-xs text-white/50">Nome</div>
                        <Input
                          value={sectorDraft.name}
                          onChange={(e) => setSectorDraft((p) => ({ ...p, name: e.target.value }))}
                          className="font-mono"
                        />
                        {drawerErrors.name ? <div className="mt-1 text-[11px] text-[hsl(var(--danger))]">{drawerErrors.name}</div> : null}
                      </div>
                      <div>
                        <div className="text-xs text-white/50">Código</div>
                        <Input
                          value={sectorDraft.code}
                          onChange={(e) => setSectorDraft((p) => ({ ...p, code: e.target.value }))}
                          className="font-mono"
                        />
                        {drawerErrors.code ? <div className="mt-1 text-[11px] text-[hsl(var(--danger))]">{drawerErrors.code}</div> : null}
                      </div>
                      <div>
                        <div className="text-xs text-white/50">Descrição</div>
                        <Input
                          value={sectorDraft.description}
                          onChange={(e) => setSectorDraft((p) => ({ ...p, description: e.target.value }))}
                          className="font-mono"
                        />
                      </div>
                      <div>
                        <div className="text-xs text-white/50">Parent (sector)</div>
                        <select
                          value={sectorDraft.parentId}
                          onChange={(e) => setSectorDraft((p) => ({ ...p, parentId: e.target.value }))}
                          className="h-12 w-full border border-white/10 bg-black/30 px-3 text-sm text-white/80 outline-none font-mono"
                        >
                          <option value="">(sem pai)</option>
                          {sectors
                            .filter((s) => s.departmentId === sectorDraft.departmentId)
                            .filter((s) => s.id !== sectorDraft.id)
                            .map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name} • {s.code}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div>
                        <div className="text-xs text-white/50">Status</div>
                        <select
                          value={sectorDraft.status}
                          onChange={(e) =>
                            setSectorDraft((p) => ({ ...p, status: e.target.value as Sector["status"] }))
                          }
                          className="h-12 w-full border border-white/10 bg-black/30 px-3 text-sm text-white/80 outline-none font-mono"
                        >
                          <option value="ativo">ativo</option>
                          <option value="inativo">inativo</option>
                          <option value="arquivado">arquivado</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-white/50">Setor</div>
                        <select
                          value={positionDraft.sectorId}
                          onChange={(e) => setPositionDraft((p) => ({ ...p, sectorId: e.target.value }))}
                          disabled={drawerMode === "edit"}
                          className={cn(
                            "h-12 w-full border border-white/10 bg-black/30 px-3 text-sm text-white/80 outline-none font-mono",
                            drawerMode === "edit" && "opacity-60 cursor-not-allowed",
                          )}
                        >
                          <option value="">Selecione…</option>
                          {sectors.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} • {s.code}
                            </option>
                          ))}
                        </select>
                        {drawerMode === "edit" ? (
                          <div className="mt-1 text-[11px] text-white/40">
                            (Regras atuais: não é possível trocar sectorId em update. Move de cargo será um endpoint dedicado.)
                          </div>
                        ) : null}
                        {drawerErrors.sectorId ? <div className="mt-1 text-[11px] text-[hsl(var(--danger))]">{drawerErrors.sectorId}</div> : null}
                      </div>
                      <div>
                        <div className="text-xs text-white/50">Nome</div>
                        <Input
                          value={positionDraft.name}
                          onChange={(e) => setPositionDraft((p) => ({ ...p, name: e.target.value }))}
                          className="font-mono"
                        />
                        {drawerErrors.name ? <div className="mt-1 text-[11px] text-[hsl(var(--danger))]">{drawerErrors.name}</div> : null}
                      </div>
                      <div>
                        <div className="text-xs text-white/50">Código</div>
                        <Input
                          value={positionDraft.code}
                          onChange={(e) => setPositionDraft((p) => ({ ...p, code: e.target.value }))}
                          className="font-mono"
                        />
                        {drawerErrors.code ? <div className="mt-1 text-[11px] text-[hsl(var(--danger))]">{drawerErrors.code}</div> : null}
                      </div>
                      <div>
                        <div className="text-xs text-white/50">Descrição</div>
                        <Input
                          value={positionDraft.description}
                          onChange={(e) => setPositionDraft((p) => ({ ...p, description: e.target.value }))}
                          className="font-mono"
                        />
                      </div>
                      <div>
                        <div className="text-xs text-white/50">Status</div>
                        <select
                          value={positionDraft.status}
                          onChange={(e) =>
                            setPositionDraft((p) => ({ ...p, status: e.target.value as Position["status"] }))
                          }
                          className="h-12 w-full border border-white/10 bg-black/30 px-3 text-sm text-white/80 outline-none font-mono"
                        >
                          <option value="ativo">ativo</option>
                          <option value="inativo">inativo</option>
                          <option value="arquivado">arquivado</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-white/10 px-6 py-5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[11px] text-white/40">
                      {armedMode ? "ARMED: audit + motivo" : "SAFE: motivo opcional"}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setDrawerOpen(false)}
                        disabled={drawerBusy}
                      >
                        Cancelar
                      </Button>
                      <Button type="button" onClick={() => void saveDrawer()} disabled={drawerBusy}>
                        {drawerBusy ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Salvando…
                          </>
                        ) : (
                          "Salvar"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Organogram View */}
        <AnimatePresence>
          {organogramView && (
            <OrganogramView
              departments={tree}
              onClose={() => setOrganogramView(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MovePanel({
  selected,
  departments,
  sectors,
  armedMode,
  reason,
  onApplied,
}: {
  selected: SelectedNode;
  departments: Department[];
  sectors: Sector[];
  armedMode: boolean;
  reason: string;
  onApplied: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [parentId, setParentId] = useState<string>("");

  useEffect(() => {
    if (selected.type === "department") {
      const d = departments.find((x) => x.departmentId === selected.id);
      setParentId(d?.parentId ?? "");
    } else if (selected.type === "sector") {
      const s = sectors.find((x) => x.id === selected.id);
      setParentId(s?.parentId ?? "");
    } else {
      setParentId("");
    }
  }, [departments, sectors, selected]);

  const departmentDescendants = useMemo(() => {
    if (selected.type !== "department") return new Set<string>();
    const byParent = new Map<string, string[]>();
    for (const d of departments) {
      if (!d.parentId) continue;
      const list = byParent.get(d.parentId) ?? [];
      list.push(d.departmentId);
      byParent.set(d.parentId, list);
    }
    const out = new Set<string>();
    const stack = [...(byParent.get(selected.id) ?? [])];
    while (stack.length) {
      const id = stack.pop();
      if (!id) continue;
      if (out.has(id)) continue;
      out.add(id);
      const kids = byParent.get(id) ?? [];
      for (const k of kids) stack.push(k);
    }
    return out;
  }, [departments, selected]);

  const apply = useCallback(async () => {
    if (armedMode && !reason.trim()) {
      notificationCenter.add({
        type: "error",
        title: "ARMED MODE",
        message: "Informe um motivo para executar movimentações (ação auditável).",
      });
      return;
    }

    setBusy(true);
    try {
      if (selected.type === "department") {
        const res = await fetch(`/api/departments/${selected.id}`, {
          method: "PUT",
          headers: { ...getAuthHeadersWithTenant(), "Content-Type": "application/json" },
          body: JSON.stringify({
            parentId: parentId || null,
            metadata: { ui: "orgcc", reason: reason.trim() || undefined },
          }),
        });
        if (!res.ok) {
          const msg = await res.json().catch(() => ({ message: "Erro ao mover departamento" }));
          notificationCenter.add({
            type: "error",
            title: "Falha ao mover",
            message: String(msg.message ?? "Erro"),
          });
          return;
        }
      } else if (selected.type === "sector") {
        const res = await fetch(`/api/sectors/${selected.id}`, {
          method: "PUT",
          headers: { ...getAuthHeadersWithTenant(), "Content-Type": "application/json" },
          body: JSON.stringify({
            parentId: parentId || null,
            metadata: { ui: "orgcc", reason: reason.trim() || undefined },
          }),
        });
        if (!res.ok) {
          const msg = await res.json().catch(() => ({ message: "Erro ao mover setor" }));
          notificationCenter.add({
            type: "error",
            title: "Falha ao mover",
            message: String(msg.message ?? "Erro"),
          });
          return;
        }
      } else {
        notificationCenter.add({
          type: "info",
          title: "Move indisponível",
          message:
            "Regra atual: não é possível trocar sectorId em update. Precisamos de endpoint dedicado para mover cargos.",
        });
        return;
      }

      notificationCenter.add({
        type: "success",
        title: "Movimentação aplicada",
        message: "Reparent atualizado (auditável).",
      });
      await onApplied();
    } finally {
      setBusy(false);
    }
  }, [armedMode, onApplied, parentId, reason, selected]);

  if (selected.type === "position") {
    return (
      <div className="border border-white/10 bg-black/20 p-4 text-sm text-white/55">
        Move de cargo entre setores exige endpoint dedicado (porque `sectorId` não é atualizável no update atual).
      </div>
    );
  }

  const options =
    selected.type === "department"
      ? departments
          .filter((d) => d.departmentId !== selected.id)
          .filter((d) => !departmentDescendants.has(d.departmentId))
          .map((d) => ({ id: d.departmentId, label: `${d.name} • ${d.code}` }))
      : sectors
          .filter((s) => s.id !== selected.id)
          .map((s) => ({ id: s.id, label: `${s.name} • ${s.code}` }));

  return (
    <div className="space-y-3">
      <div className="border border-white/10 bg-black/20 p-4">
        <div className="text-xs text-white/50">
          {selected.type === "department" ? "Novo parentId (department)" : "Novo parentId (sector)"}
        </div>
        <div className="mt-2 grid gap-2 md:grid-cols-[1fr_180px]">
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="h-12 w-full border border-white/10 bg-black/30 px-3 text-sm text-white/80 outline-none font-mono"
          >
            <option value="">(sem pai)</option>
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
          <Button type="button" onClick={() => void apply()} disabled={busy}>
            {busy ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Aplicando…
              </>
            ) : (
              "Aplicar"
            )}
          </Button>
        </div>
        <div className="mt-2 text-[11px] text-white/40">
          Observação: move entre departamentos (sector.departmentId) ainda não é suportado no update atual.
        </div>
      </div>
    </div>
  );
}
