"use client";

import { Button, GlassCard, Input, Popover, PopoverContent, PopoverTrigger, cn } from "@morina/ui";
import { AnimatePresence, motion } from "framer-motion";
import {
    AlertTriangle,
    ArrowLeftRight,
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
    Users,
    X,
    XCircle
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { DateRangePicker, type DateRangePreset } from "@/components/dashboard/DateRangePicker";
import { notificationCenter } from "@/shared/ui/notification-center";
import {
    OrganizationTree,
    type DepartmentNode,
    type PositionNode,
    type SectorNode,
    type SubdepartmentNode,
} from "@/components/organizational-structure/organization-tree";
import { OrganizationalToolbar } from "@/components/organizational-structure/OrganizationalToolbar";
import { DepartmentForm } from "@/features/organizational-structure/components/Forms/DepartmentForm";
import { PositionForm } from "@/features/organizational-structure/components/Forms/PositionForm";
import { SectorForm } from "@/features/organizational-structure/components/Forms/SectorForm";
import { ActivityFeedPanel } from "@/features/organizational-structure/components/Panels/ActivityFeedPanel";
import { AdvancedMetricsPanel } from "@/features/organizational-structure/components/Panels/AdvancedMetricsPanel";
import { OrganizationalAuditPanel } from "@/features/organizational-structure/components/Panels/AuditPanel";
import { ComparisonPanel } from "@/features/organizational-structure/components/Panels/ComparisonPanel";
import { ImportExportPanel } from "@/features/organizational-structure/components/Panels/ImportExportPanel";
import { OverviewPanel } from "@/features/organizational-structure/components/Panels/OverviewPanel";
import { PredictiveInsightsPanel } from "@/features/organizational-structure/components/Panels/PredictiveInsightsPanel";
import { OrgTree } from "@/features/organizational-structure/components/Tree/OrgTree";
import { organizationalService } from "@/features/organizational-structure/services/OrganizationalService";
import { getAuthHeadersWithTenant } from "@/lib/auth-client";
import { generateExcelReport } from "@/lib/reports/excel-generator";
import { generatePDFReport } from "@/lib/reports/pdf-generator";
import { Department, Position, Sector, Subdepartment } from "@morina/organizational-structure-domain";

// Local types removed in favor of Domain types


type ListResponse<T> = {
  itens: T[];
  proximoCursor?: string | null;
};

type SelectedNode =
  | { type: "department"; id: string; data: DepartmentNode }
  | { type: "subdepartment"; id: string; data: SubdepartmentNode }
  | { type: "sector"; id: string; data: SectorNode }
  | { type: "position"; id: string; data: PositionNode };

type DetailsTab = "overview" | "members" | "permissions" | "audit" | "move" | "import-export" | "comparison";

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
  const [dateRange, setDateRange] = useState<DateRangePreset>("30d");

  // Drawer CRUD

  // Drawer CRUD - Refactored to use Smart Forms
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [drawerType, setDrawerType] = useState<DrawerEntityType>("department");
  const [drawerBusy, setDrawerBusy] = useState(false);
  // Drafts removed in favor of Smart Forms


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
    // Helper for status match
    const matchStatus = (active: boolean, filter: string) => {
      if (filter === 'all') return true;
      if (filter === 'ativo') return active;
      if (filter === 'inativo') return !active;
      return false;
    };

    // Organizar setores por departamento e subdepartamento
    const sectorsByDepartment = new Map<string, Sector[]>();
    const sectorsBySubdepartment = new Map<string, Sector[]>();

    for (const s of sectors) {
      if ((s as any).subdepartmentId) {
        // Setor pertence a um subdepartamento
        const list = sectorsBySubdepartment.get((s as any).subdepartmentId) ?? [];
        list.push(s);
        sectorsBySubdepartment.set((s as any).subdepartmentId, list);
      } else {
        // Setor pertence diretamente ao departamento
        const list = sectorsByDepartment.get(s.departmentId || "") ?? [];
        list.push(s);
        sectorsByDepartment.set(s.departmentId || "", list);
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
      if (!p.sectorId) continue;
      const list = positionsBySector.get(p.sectorId) ?? [];
      list.push(p);
      positionsBySector.set(p.sectorId, list);
    }

    const depts = departments
      .map((d) => {
        // Subdepartamentos do departamento
        const subdepts = (subdepartmentsByDepartment.get((d.id || "")) ?? []).map((sd) => ({
          id: (sd.subdepartmentId || ""),
          name: sd.name,
          code: sd.code,
          status: sd.status,
          active: sd.status === 'ativo',
          sectors: (sectorsBySubdepartment.get((sd.subdepartmentId || "")) ?? [])
            .map((s) => {
              const secNode: SectorNode = {
                id: s.id || "",
                departmentId: s.departmentId || "",
                name: s.name,
                code: s.code,
                active: !!s.active,
                positions: (positionsBySector.get(s.id || "") ?? []).map((p) => {

                  const posNode: PositionNode = {
                    id: p.id || "",
                    sectorId: p.sectorId || "",
                    name: p.name,
                    code: p.code,
                    active: !!p.active,
                  };
                  return posNode;
                }),
              };
              return secNode;
            })
            .sort((a, b) => a.name.localeCompare(b.name)),
        }));

        // Setores diretos do departamento (quando não há subdepartamentos)
        const directSectors = (sectorsByDepartment.get((d.id || "")) ?? [])
          .map((s) => {
            const secNode: SectorNode = {
              id: s.id || "",
              departmentId: s.departmentId || "",
              name: s.name,
              code: s.code,
              active: !!s.active,
              positions: (positionsBySector.get(s.id || "") ?? []).map((p) => {
                const posNode: PositionNode = {
                  id: p.id || "",
                  sectorId: p.sectorId || "",
                  name: p.name,
                  code: p.code,
                  active: !!p.active,
                };
                return posNode;
              }),
            };
            return secNode;
          })
          .sort((a, b) => a.name.localeCompare(b.name));

        const deptNode: DepartmentNode = {
          id: (d.id || ""),
          name: d.name,
          code: d.code,
          active: d.active,
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
          sectors: d.sectors?.map((s) => ({ ...s, positions: [] })) ?? [],
        }));
      } else if (filters.type === "position") {
        // Keep all but only show positions
        filteredDepts = filteredDepts.map((d) => ({
          ...d,
          sectors: d.sectors?.map((s) => ({ ...s, positions: s.positions })) ?? [],
        }));
      }
    }


    // Filter by status
    if (filters.status !== "all") {
      filteredDepts = filteredDepts
        .filter((d) => matchStatus(d.active, filters.status))
        .map((d) => ({
          ...d,
          subdepartments: d.subdepartments
            ?.filter((sd) => matchStatus(sd.active, filters.status))
            .map((sd) => ({
              ...sd,
              sectors: sd.sectors
                ?.filter((s) => matchStatus(s.active, filters.status))
                .map((s) => ({
                  ...s,
                  positions: s.positions?.filter((p) => matchStatus(p.active, filters.status)) ?? [],
                })),
            })),
          sectors: d.sectors
            ?.filter((s) => matchStatus(s.active, filters.status))
            .map((s) => ({
              ...s,
              positions: s.positions?.filter((p) => matchStatus(p.active, filters.status)) ?? [],
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
              .filter((s) => s !== null) as SectorNode[];

            const keepSubdept = match(sd.name) || match(sd.code) || sectorsFiltered.length > 0;
            if (!keepSubdept) return null;
            return { ...sd, sectors: sectorsFiltered };
          })
          .filter((sd) => sd !== null) as SubdepartmentNode[];

        // Filtrar setores diretos
        const sectorsFiltered = (d.sectors ?? [])
          .map((s) => {
            const positionsFiltered = (s.positions ?? []).filter((p) => match(p.name) || match(p.code));
            const keepSector = match(s.name) || match(s.code) || positionsFiltered.length > 0;
            if (!keepSector) return null;
            return { ...s, positions: positionsFiltered };
          })
          .filter((s) => s !== null) as SectorNode[];

        const keepDept = match(d.name) || match(d.code) || subdeptsFiltered.length > 0 || sectorsFiltered.length > 0;
        if (!keepDept) return null;
        return {
          ...d,
          subdepartments: subdeptsFiltered.length > 0 ? subdeptsFiltered : undefined,
          sectors: subdeptsFiltered.length === 0 ? sectorsFiltered : undefined,
        };
      })
      .filter((d) => d !== null) as DepartmentNode[];
  }, [departments, subdepartments, positions, search, sectors, filters]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [depts, subdepts, sects, pos] = await Promise.all([
        organizationalService.getDepartments(),
        organizationalService.getSubdepartments(),
        organizationalService.getSectors(),
        organizationalService.getPositions(),
      ]);

      setDepartments(depts);
      setSubdepartments(subdepts);
      setSectors(sects);
      setPositions(pos);
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

  /* Drawer Functions - Simplified for Smart Forms */
  const openCreateDepartment = useCallback(() => {
    setDrawerMode("create");
    setDrawerType("department");
    setDrawerOpen(true);
  }, []);

  const openCreateSector = useCallback((departmentId: string) => {
    // For sector, we might need to pre-select department. 
    // Ideally we pass this to the form as initialData or context.
    // For now we just open. The form will handle selection or we pass data later.
    setDrawerMode("create");
    setDrawerType("sector");
    setDrawerOpen(true);
  }, []);

  const openCreatePosition = useCallback((sectorId: string) => {
    setDrawerMode("create");
    setDrawerType("position");
    setDrawerOpen(true);
  }, []);

  const openEditNode = useCallback((node: SelectedNode) => {
    if (node.type === "subdepartment") {
      console.warn("Edit subdepartment not implemented");
      return;
    }
    setDrawerMode("edit");
    setDrawerType(node.type);
    setSelected(node); // Ensure selected is set
    setDrawerOpen(true);
  }, []);




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
        if (node.type === "department") {
          await organizationalService.deleteDepartment.execute(node.id);
        } else if (node.type === "sector") {
          await organizationalService.deleteSector.execute(node.id);
        } else if (node.type === "position") {
          await organizationalService.deletePosition.execute(node.id);
        } else if (node.type === "subdepartment") {
          // Subdepartment delete not yet in service, but let's add it or keep legacy for now
          await fetch(`/api/subdepartments/${node.id}`, {
            method: "DELETE",
            headers: { ...getAuthHeadersWithTenant(), "Content-Type": "application/json" },
          });
        }

        notificationCenter.add({
          type: "success",
          title: "Removido",
          message: "Estrutura atualizada.",
        });

        setSelected(null);
        setTab("overview");
        await loadAll();
      } catch (err) {
        console.error(err);
        notificationCenter.add({
          type: "error",
          title: "Falha ao deletar",
          message: err instanceof Error ? err.message : "Erro desconhecido",
        });
      } finally {
        setDrawerBusy(false);
      }
    },
    [armedMode, loadAll, reason],
  );

  // Auto-refresh every 30 seconds for real-time overview
  useEffect(() => {
    const interval = setInterval(() => {
      void loadAll();
    }, 30000); // 30s
    return () => clearInterval(interval);
  }, [loadAll]);

  // Load initial data
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
        const parentDept = departments.find((d) => (d.id || "") === dept.parentId);
        exportData.push({
          Tipo: "Departamento",
          ID: dept.id || "",
          Nome: dept.name,
          Código: dept.code,
          Descrição: dept.description || null,
          Status: dept.active ? "Ativo" : "Inativo",
          "Departamento Pai": parentDept ? `${parentDept.name} (${parentDept.code})` : undefined,
          "Criado Em": dept.createdAt ? new Date(dept.createdAt).toLocaleString("pt-BR") : "",
          "Atualizado Em": dept.updatedAt ? new Date(dept.updatedAt).toLocaleString("pt-BR") : "",
        });
      }

      // Adicionar setores
      for (const sector of sectors) {
        const dept = departments.find((d) => (d.id || "") === sector.departmentId);
        const parentSector = sectors.find((s) => s.id === sector.parentId);
        exportData.push({
          Tipo: "Setor",
          ID: sector.id || "",
          Nome: sector.name,
          Código: sector.code,
          Descrição: sector.description || null,
          Status: sector.active ? "Ativo" : "Inativo",
          "Setor Vinculado": dept ? `${dept.name} (${dept.code})` : undefined,
          "Setor Pai": parentSector ? `${parentSector.name} (${parentSector.code})` : undefined,
          "Criado Em": sector.createdAt ? new Date(sector.createdAt).toLocaleString("pt-BR") : "",
          "Atualizado Em": sector.updatedAt ? new Date(sector.updatedAt).toLocaleString("pt-BR") : "",
        });
      }

      // Adicionar cargos
      for (const position of positions) {
        const sector = sectors.find((s) => s.id === position.sectorId);
        exportData.push({
          Tipo: "Cargo",
          ID: position.id || "",
          Nome: position.name,
          Código: position.code,
          Descrição: position.description || null,
          Status: position.active ? "Ativo" : "Inativo",
          "Setor Vinculado": sector ? `${sector.name} (${sector.code})` : undefined,
          "Criado Em": position.createdAt ? new Date(position.createdAt).toLocaleString("pt-BR") : "",
          "Atualizado Em": position.updatedAt ? new Date(position.updatedAt).toLocaleString("pt-BR") : "",
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
        // Multi-sheet Excel Export
        const deptSheet = {
          name: 'Departamentos',
          columns: [
            { header: 'ID', key: 'ID', width: 30 },
            { header: 'Nome', key: 'Nome', width: 30 },
            { header: 'Código', key: 'Código', width: 15 },
            { header: 'Status', key: 'Status', width: 10 },
            { header: 'Pai', key: 'Departamento Pai', width: 30 },
            { header: 'Criado Em', key: 'Criado Em', width: 20 },
          ],
          data: exportData.filter(d => d.Tipo === "Departamento")
        };

        const sectSheet = {
          name: 'Setores',
          columns: [
            { header: 'ID', key: 'ID', width: 30 },
            { header: 'Nome', key: 'Nome', width: 30 },
            { header: 'Código', key: 'Código', width: 15 },
            { header: 'Status', key: 'Status', width: 10 },
            { header: 'Departamento', key: 'Setor Vinculado', width: 30 },
            { header: 'Criado Em', key: 'Criado Em', width: 20 },
          ],
          data: exportData.filter(d => d.Tipo === "Setor")
        };

        const posSheet = {
          name: 'Cargos',
          columns: [
            { header: 'ID', key: 'ID', width: 30 },
            { header: 'Nome', key: 'Nome', width: 30 },
            { header: 'Código', key: 'Código', width: 15 },
            { header: 'Status', key: 'Status', width: 10 },
            { header: 'Setor', key: 'Setor Vinculado', width: 30 },
            { header: 'Criado Em', key: 'Criado Em', width: 20 },
          ],
          data: exportData.filter(d => d.Tipo === "Cargo")
        };

        const allSheet = {
          name: 'Tudo',
          columns: Object.keys(exportData[0] || {}).map(k => ({ header: k, key: k, width: 20 })),
          data: exportData
        };

        await generateExcelReport(
          `estrutura_organizacional_${new Date().toISOString().split("T")[0]}`,
          [allSheet, deptSheet, sectSheet, posSheet]
        );

      } else if (format === "pdf") {
        // PDF Report Generation (Screenshot of dashboard)
        if (!selected) {
          // Export Global Dashboard
          await generatePDFReport(
            "command-center-dashboard",
            `relatorio_global_${new Date().toISOString().split("T")[0]}`,
            "MorinaLight - Relatório Executivo Global"
          );
        } else {
          // Fallback to simple HTML print for specific node or use same screenshot if we wrap detail view
          // For now, let's just warn or fallback to HTML default if no ID found
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
  <h1>Estrutura Organizacional - Detalhes</h1>
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
            title: "PDF de Nó Selecionado",
            message: "Para nós específicos, geramos formato HTML para impressão (melhor legibilidade de lista).",
          });
          return;
        }
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
  }, [departments, sectors, positions, selected]);

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
    (node: { type: "department" | "subdepartment" | "sector" | "position"; id: string; data: DepartmentNode | SubdepartmentNode | SectorNode | PositionNode }) => {
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

    if (selected.type === "subdepartment") {
      const sd = subdepartments.find(s => (s.subdepartmentId || "") === selected.id);
      const dept = sd ? departments.find(d => (d.id || "") === (sd.departmentId || "")) : null;
      return [
        { label: dept?.name ?? "Departamento", code: dept?.code },
        { label: selected.data.name, code: selected.data.code },
      ];
    }

    if (selected.type === "sector") {
      const dept = departments.find((d) => (d.id || "") === selected.data.departmentId);
      return [
        { label: dept?.name ?? "Departamento", code: dept?.code },
        { label: selected.data.name, code: selected.data.code },
      ];
    }

    if (selected.type === "position") {
      const sector = sectors.find((s) => s.id === selected.data.sectorId);
      const dept = sector ? departments.find((d) => (d.id || "") === (sector.departmentId || "")) : null;
      return [
        { label: dept?.name ?? "Departamento", code: dept?.code },
        { label: sector?.name ?? "Setor", code: sector?.code },
        { label: selected.data.name, code: selected.data.code },
      ];
    }

    return [];
  }, [departments, subdepartments, sectors, selected]);

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
            <DateRangePicker value={dateRange} onChange={setDateRange} />
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
                    { id: "comparison", label: "Comparar", icon: ArrowLeftRight },
                  ] as const
                ).map((t) => {
                  const Icon = t.icon;
                  const active = tab === t.id;
                  const disabled = !selected && t.id !== "overview" && t.id !== "comparison";
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

              {!selected && tab !== "comparison" ? (
                <div id="command-center-dashboard" className="space-y-8 animate-in fade-in duration-500">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <h3 className="text-lg font-medium text-white">Visão Global</h3>
                      <p className="text-sm text-white/50">Métricas consolidadas de toda a organização</p>
                    </div>
                  </div>
                  <AdvancedMetricsPanel
                    departments={departments}
                    sectors={sectors}
                    positions={positions}
                  />
                  <OverviewPanel
                    departments={departments}
                    sectors={sectors}
                    positions={positions}
                    membersCount={members.length}
                    dateRange={dateRange}
                  />
                  <PredictiveInsightsPanel
                    departments={departments}
                    sectors={sectors}
                    positions={positions}
                  />

                  <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-3">
                      <ActivityFeedPanel />
                    </div>
                  </div>
                </div>
              ) : tab === "overview" ? (
                <div className="space-y-8">
                  <AdvancedMetricsPanel
                    departments={departments}
                    sectors={sectors}
                    positions={positions}
                  />
                  <OverviewPanel
                    departments={departments}
                    sectors={sectors}
                    positions={positions}
                    membersCount={members.length}
                    dateRange={dateRange}
                  />
                  <PredictiveInsightsPanel
                    departments={departments}
                    sectors={sectors}
                    positions={positions}
                  />
                </div>
              ) : tab === "comparison" ? (
                <ComparisonPanel
                  departments={departments}
                  sectors={sectors}
                  positions={positions}
                  members={members}
                />
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
                    id: d.id || "",
                    departmentId: d.id || "",
                    orgId: (d as any).orgId || "",
                    name: d.name,
                    code: d.code,
                    description: d.description ?? undefined,
                    type: "CORE" as const,
                    filialId: undefined,
                    parentId: d.parentId ?? undefined,
                    active: !!d.active,
                    createdAt: d.createdAt,
                    updatedAt: d.updatedAt,
                  }))}
                  subdepartments={subdepartments.map((sd) => ({
                    subdepartmentId: sd.subdepartmentId,
                    orgId: (sd as any).orgId || "",
                    departmentId: sd.departmentId,
                    name: sd.name,
                    code: sd.code,
                    description: sd.description ?? undefined,
                    status: sd.status,
                    ordem: sd.ordem,
                    createdAt: sd.createdAt,
                    updatedAt: sd.updatedAt,
                  }))}
                  sectors={sectors.map((s) => ({
                    id: s.id,
                    departmentId: s.departmentId,
                    name: s.name,
                    code: s.code,
                    description: s.description ?? undefined,
                    type: "CORE" as const,
                    active: !!s.active,
                    filialId: undefined,
                    parentId: s.parentId ?? undefined,
                    createdAt: s.createdAt,
                    updatedAt: s.updatedAt,
                  }))}
                  positions={positions.map((p) => ({
                    id: p.id,
                    name: p.name,
                    code: p.code,
                    description: p.description ?? undefined,
                    seniority: "Junior",
                    active: !!p.active,
                    responsabilidades: (p as any).responsabilidades ?? undefined,
                    requisitos: (p as any).requisitos ?? undefined,
                    salarioMin: (p as any).salarioMin ?? undefined,
                    salarioMax: (p as any).salarioMax ?? undefined,
                    createdAt: p.createdAt,
                    updatedAt: p.updatedAt,
                  }))}
                  orgId={(departments[0] as any)?.orgId || ""}
                  onImportComplete={async () => {
                    await loadAll();
                  }}
                />
              ) : selected ? (
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
              ) : null}
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
                setDrawerOpen(false);
              }}
            />
            <div className="absolute right-0 top-0 h-full w-full max-w-[520px] border-l border-white/10 bg-[color-mix(in_oklab,hsl(var(--surface))_78%,black_22%)] shadow-[0_28px_140px_-45px_rgba(0,0,0,0.95)]">
              <div className="pointer-events-none absolute inset-0 holo-grid opacity-10" />
              <div className="relative flex h-full flex-col p-6 overflow-y-auto">
                {drawerType === "department" && (
                  <DepartmentForm
                    initialData={drawerMode === 'edit' && selected?.type === 'department' ?
                      departments.find(d => (d.id || "") === selected.id) : undefined}
                    onSubmit={async (data) => {
                      if (drawerMode === 'edit' && selected?.id) {
                        await organizationalService.updateDepartment.execute(selected.id, data);
                      } else {
                        await organizationalService.createDepartment.execute(data);
                      }
                    }}
                    onSuccess={() => {
                      setDrawerOpen(false);
                      void loadAll();
                    }}
                    onCancel={() => setDrawerOpen(false)}
                  />
                )}
                {drawerType === "sector" && (
                  <SectorForm
                    initialData={drawerMode === 'edit' && selected?.type === 'sector' ?
                      sectors.find(s => s.id === selected.id) : undefined}
                    onSubmit={async (data) => {
                      if (drawerMode === 'edit' && selected?.id) {
                        await organizationalService.updateSector.execute(selected.id, data);
                      } else {
                        await organizationalService.createSector.execute(data);
                      }
                    }}
                    onSuccess={() => {
                      setDrawerOpen(false);
                      void loadAll();
                    }}
                    onCancel={() => setDrawerOpen(false)}
                    departmentId={drawerMode === 'create' && selected?.type === 'department' ? selected.id : undefined}
                  />
                )}
                {drawerType === "position" && (
                  <PositionForm
                    initialData={drawerMode === 'edit' && selected?.type === 'position' ?
                      positions.find(p => p.id === selected.id) : undefined}
                    onSubmit={async (data) => {
                      if (drawerMode === 'edit' && selected?.id) {
                        await organizationalService.updatePosition.execute(selected.id, data);
                      } else {
                        await organizationalService.createPosition.execute(data);
                      }
                    }}
                    onSuccess={() => {
                      setDrawerOpen(false);
                      void loadAll();
                    }}
                    onCancel={() => setDrawerOpen(false)}
                    sectorId={drawerMode === 'create' && selected?.type === 'sector' ? selected.id : undefined}
                  />
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* Organogram View */}
        <AnimatePresence>
          {organogramView && (
            <OrgTree
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
      const d = departments.find((x) => (x.id || "") === selected.id);
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
      list.push(d.id || "");
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
        await organizationalService.moveDepartment.execute(selected.id, parentId || null, reason.trim());
      } else if (selected.type === "sector") {
        await organizationalService.moveSector.execute(selected.id, parentId || null, reason.trim());
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
    } catch (err) {
      console.error(err);
      notificationCenter.add({
        type: "error",
        title: "Falha ao mover",
        message: err instanceof Error ? err.message : "Erro desconhecido",
      });
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
        .filter((d) => (d.id || "") !== selected.id)
        .filter((d) => !departmentDescendants.has(d.id || ""))
        .map((d) => ({ id: d.id || "", label: `${d.name} • ${d.code}` }))
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
