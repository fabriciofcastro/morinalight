"use client";

import { Button, cn, type TreeNode, TreeViewContainer } from "@morina/ui";
import { Briefcase, Building2, Edit, FolderTree, Layers, Plus, Trash2 } from "lucide-react";

export type SubdepartmentNode = {
  id: string;
  name: string;
  code: string;
  status: "ativo" | "inativo" | "arquivado";
  sectors?: SectorNode[];
};

export type DepartmentNode = {
  id: string;
  name: string;
  code: string;
  status: "ativo" | "inativo" | "arquivado";
  subdepartments?: SubdepartmentNode[];
  sectors?: SectorNode[]; // Setores diretos (quando não há subdepartamentos)
};

export type SectorNode = {
  id: string;
  name: string;
  code: string;
  status: "ativo" | "inativo" | "arquivado";
  departmentId: string;
  positions?: PositionNode[];
};

export type PositionNode = {
  id: string;
  name: string;
  code: string;
  status: "ativo" | "inativo" | "arquivado";
  sectorId: string;
};

type OrganizationTreeProps = {
  departments: DepartmentNode[];
  selectedId?: string;
  onSelect?: (node: {
    type: "department" | "subdepartment" | "sector" | "position";
    id: string;
    data: DepartmentNode | SubdepartmentNode | SectorNode | PositionNode;
  }) => void;
  onEdit?: (node: {
    type: "department" | "subdepartment" | "sector" | "position";
    id: string;
    data: DepartmentNode | SubdepartmentNode | SectorNode | PositionNode;
  }) => void;
  onDelete?: (node: {
    type: "department" | "subdepartment" | "sector" | "position";
    id: string;
    data: DepartmentNode | SubdepartmentNode | SectorNode | PositionNode;
  }) => void;
  onAddChild?: (parentType: "department" | "subdepartment" | "sector", parentId: string) => void;
  expanded?: Set<string>;
  onToggleExpand?: (id: string) => void;
  className?: string;
};

export function OrganizationTree({
  departments,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
  onAddChild,
  expanded = new Set(),
  onToggleExpand,
  className,
}: OrganizationTreeProps) {
  const buildTreeNodes = (): TreeNode[] => {
    return departments.map((dept) => {
      // Construir nós de subdepartamentos
      const subdepartmentNodes: TreeNode[] =
        dept.subdepartments?.map((subdept) => {
          // Setores do subdepartamento
          const sectorNodes: TreeNode[] =
            subdept.sectors?.map((sector) => {
              const positionNodes: TreeNode[] =
                sector.positions?.map((position) => ({
                  id: `position-${position.id}`,
                  label: position.name,
                  data: { ...position, type: "position" as const },
                  icon: <Briefcase className="h-4 w-4" />,
                  badge: position.code,
                  actions: (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit?.({ type: "position", id: position.id, data: position });
                        }}
                        className="h-7 w-7 p-0"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete?.({ type: "position", id: position.id, data: position });
                        }}
                        className="h-7 w-7 p-0 text-[var(--danger)] hover:text-[var(--danger)]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ),
                })) || [];

              return {
                id: `sector-${sector.id}`,
                label: sector.name,
                data: { ...sector, type: "sector" as const },
                icon: <FolderTree className="h-4 w-4" />,
                badge: sector.code,
                children: positionNodes,
                actions: (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddChild?.("sector", sector.id);
                      }}
                      className="h-7 w-7 p-0"
                      title="Adicionar Cargo"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.({ type: "sector", id: sector.id, data: sector });
                      }}
                      className="h-7 w-7 p-0"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.({ type: "sector", id: sector.id, data: sector });
                      }}
                      className="h-7 w-7 p-0 text-[var(--danger)] hover:text-[var(--danger)]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ),
              };
            }) || [];

          return {
            id: `subdepartment-${subdept.id}`,
            label: subdept.name,
            data: { ...subdept, type: "subdepartment" as const },
            icon: <Layers className="h-4 w-4" />,
            badge: subdept.code,
            children: sectorNodes,
            actions: (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddChild?.("subdepartment", subdept.id);
                  }}
                  className="h-7 w-7 p-0"
                  title="Adicionar Setor"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.({ type: "subdepartment", id: subdept.id, data: subdept });
                  }}
                  className="h-7 w-7 p-0"
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.({ type: "subdepartment", id: subdept.id, data: subdept });
                  }}
                  className="h-7 w-7 p-0 text-[var(--danger)] hover:text-[var(--danger)]"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ),
          };
        }) || [];

      // Setores diretos do departamento (quando não há subdepartamentos)
      const directSectorNodes: TreeNode[] =
        dept.sectors?.map((sector) => {
          const positionNodes: TreeNode[] =
            sector.positions?.map((position) => ({
              id: `position-${position.id}`,
              label: position.name,
              data: { ...position, type: "position" as const },
              icon: <Briefcase className="h-4 w-4" />,
              badge: position.code,
              actions: (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.({ type: "position", id: position.id, data: position });
                    }}
                    className="h-7 w-7 p-0"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.({ type: "position", id: position.id, data: position });
                    }}
                    className="h-7 w-7 p-0 text-[var(--danger)] hover:text-[var(--danger)]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ),
            })) || [];

          return {
            id: `sector-${sector.id}`,
            label: sector.name,
            data: { ...sector, type: "sector" as const },
            icon: <FolderTree className="h-4 w-4" />,
            badge: sector.code,
            children: positionNodes,
            actions: (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddChild?.("sector", sector.id);
                  }}
                  className="h-7 w-7 p-0"
                  title="Adicionar Cargo"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.({ type: "sector", id: sector.id, data: sector });
                  }}
                  className="h-7 w-7 p-0"
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.({ type: "sector", id: sector.id, data: sector });
                  }}
                  className="h-7 w-7 p-0 text-[var(--danger)] hover:text-[var(--danger)]"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ),
          };
        }) || [];

      // Filhos do departamento: subdepartamentos ou setores diretos
      const departmentChildren = subdepartmentNodes.length > 0 ? subdepartmentNodes : directSectorNodes;

      return {
        id: `department-${dept.id}`,
        label: dept.name,
        data: { ...dept, type: "department" as const },
        icon: <Building2 className="h-4 w-4" />,
        badge: dept.code,
        children: departmentChildren,
        actions: (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAddChild?.("department", dept.id);
              }}
              className="h-7 w-7 p-0"
              title={subdepartmentNodes.length > 0 ? "Adicionar Subdepartamento" : "Adicionar Setor"}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.({ type: "department", id: dept.id, data: dept });
              }}
              className="h-7 w-7 p-0"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.({ type: "department", id: dept.id, data: dept });
              }}
              className="h-7 w-7 p-0 text-[var(--danger)] hover:text-[var(--danger)]"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      };
    });
  };

  const handleSelect = (node: TreeNode) => {
    const data = node.data as
      | (DepartmentNode & { type: "department" })
      | (SubdepartmentNode & { type: "subdepartment" })
      | (SectorNode & { type: "sector" })
      | (PositionNode & { type: "position" });
    if (data?.type) {
      onSelect?.({ type: data.type, id: data.id, data });
    }
  };

  return (
    <TreeViewContainer
      nodes={buildTreeNodes()}
      selectedId={selectedId}
      onSelect={handleSelect}
      expanded={expanded}
      onToggleExpand={onToggleExpand}
      className={cn("min-h-[400px]", className)}
      emptyMessage="Nenhuma estrutura organizacional encontrada. Comece criando um departamento."
    />
  );
}
