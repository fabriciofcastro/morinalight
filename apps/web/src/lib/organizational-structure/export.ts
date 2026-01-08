/**
 * Utilitários para exportação de estrutura organizacional
 */

import type { Department, Subdepartment, Sector, Position } from "@morina/organizational-structure-domain";

export type OrganizationalStructureExport = {
  version: string;
  exportedAt: string;
  departments: Department[];
  subdepartments: Subdepartment[];
  sectors: Sector[];
  positions: Position[];
};

/**
 * Exporta a estrutura organizacional completa para JSON
 */
export function exportToJSON(
  departments: Department[],
  subdepartments: Subdepartment[],
  sectors: Sector[],
  positions: Position[],
): string {
  const exportData: OrganizationalStructureExport = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    departments,
    subdepartments,
    sectors,
    positions,
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Exporta a estrutura organizacional para CSV
 */
export function exportToCSV(
  departments: Department[],
  subdepartments: Subdepartment[],
  sectors: Sector[],
  positions: Position[],
): string {
  const lines: string[] = [];

  // Header
  lines.push("Tipo,ID,Código,Nome,Status,Departamento,Subdepartamento,Setor,Descrição");

  // Departments
  for (const dept of departments) {
    lines.push(
      `Departamento,${dept.id},${dept.code},"${dept.name}",${dept.active ? "Ativo" : "Inativo"},,,,"${dept.description || ""}"`,
    );
  }

  // Subdepartments
  for (const subdept of subdepartments) {
    const dept = departments.find((d) => d.id === subdept.departmentId);
    lines.push(
      `Subdepartamento,${subdept.subdepartmentId},${subdept.code},"${subdept.name}",${subdept.status},"${dept?.name || ""}",,"${subdept.description || ""}"`,
    );
  }

  // Sectors
  for (const sector of sectors) {
    const dept = departments.find((d) => d.id === sector.departmentId);
    const subdept = subdepartments.find(
      (sd) => sd.subdepartmentId === sector.subdepartmentId,
    );
    lines.push(
      `Setor,${sector.id},${sector.code},"${sector.name}",${sector.active ? "Ativo" : "Inativo"},"${dept?.name || ""}","${subdept?.name || ""}",,"${sector.description || ""}"`,
    );
  }

  // Positions
  for (const position of positions) {
    const sector = sectors.find((s) => s.id === position.sectorId);
    const dept = departments.find(
      (d) => d.id === sector?.departmentId,
    );
    const subdept = subdepartments.find(
      (sd) => sd.subdepartmentId === sector?.subdepartmentId,
    );
    lines.push(
      `Cargo,${position.id},${position.code},"${position.name}",${position.active ? "Ativo" : "Inativo"},"${dept?.name || ""}","${subdept?.name || ""}","${sector?.name || ""}","${position.description || ""}"`,
    );
  }

  return lines.join("\n");
}

/**
 * Faz download de um arquivo
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}









