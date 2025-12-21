/**
 * Utilitários para importação de estrutura organizacional de CSV
 */

import type {
  Department,
  Subdepartment,
  Sector,
  Position,
  CreateDepartmentInput,
  CreateSubdepartmentInput,
  CreateSectorInput,
  CreatePositionInput,
} from "@/lib/api/organizational-structure";
import { organizationalStructureApi } from "@/lib/api/organizational-structure";
import type { ImportResult } from "./import";

export type CSVRow = {
  Tipo: string;
  ID: string;
  Código: string;
  Nome: string;
  Status: string;
  Departamento: string;
  Subdepartamento: string;
  Setor: string;
  Descrição: string;
};

/**
 * Parse CSV content
 */
export function parseCSV(content: string): CSVRow[] {
  const lines = content.split("\n").filter((line) => line.trim());
  if (lines.length < 2) {
    throw new Error("CSV deve ter pelo menos um cabeçalho e uma linha de dados");
  }

  const headers = lines[0].split(",").map((h) => h.trim());
  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length !== headers.length) {
      continue; // Skip invalid rows
    }

    const row: Partial<CSVRow> = {};
    headers.forEach((header, idx) => {
      row[header as keyof CSVRow] = values[idx]?.replace(/^"|"$/g, "") || "";
    });
    rows.push(row as CSVRow);
  }

  return rows;
}

/**
 * Parse CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current);

  return values;
}

/**
 * Converte CSV para estrutura organizacional
 */
export function csvToOrganizationalStructure(rows: CSVRow[]): {
  departments: Omit<Department, "id" | "departmentId" | "createdAt" | "updatedAt">[];
  subdepartments: Omit<Subdepartment, "id" | "subdepartmentId" | "createdAt" | "updatedAt">[];
  sectors: Omit<Sector, "id" | "createdAt" | "updatedAt">[];
  positions: Omit<Position, "id" | "createdAt" | "updatedAt">[];
} {
  const departments: Omit<Department, "id" | "departmentId" | "createdAt" | "updatedAt">[] = [];
  const subdepartments: Omit<Subdepartment, "id" | "subdepartmentId" | "createdAt" | "updatedAt">[] = [];
  const sectors: Omit<Sector, "id" | "createdAt" | "updatedAt">[] = [];
  const positions: Omit<Position, "id" | "createdAt" | "updatedAt">[] = [];

  const departmentMap = new Map<string, string>(); // code -> id (temporary)
  const subdepartmentMap = new Map<string, string>(); // code -> id (temporary)
  const sectorMap = new Map<string, string>(); // code -> id (temporary)

  // Primeiro pass: criar departamentos
  for (const row of rows) {
    if (row.Tipo === "Departamento") {
      departments.push({
        orgId: "", // Será preenchido durante importação
        name: row.Nome,
        code: row.Código,
        description: row.Descrição || null,
        type: "CORE",
        filialId: null,
        parentId: null,
        active: row.Status === "ativo",
      });
      departmentMap.set(row.Código, row.ID);
    }
  }

  // Segundo pass: criar subdepartamentos
  for (const row of rows) {
    if (row.Tipo === "Subdepartamento") {
      const deptCode = row.Departamento;
      const deptId = departmentMap.get(deptCode);
      if (deptId) {
        subdepartments.push({
          orgId: "", // Será preenchido durante importação
          departmentId: deptId,
          name: row.Nome,
          code: row.Código,
          description: row.Descrição || null,
          status: (row.Status as "ativo" | "inativo" | "arquivado") || "ativo",
        });
        subdepartmentMap.set(row.Código, row.ID);
      }
    }
  }

  // Terceiro pass: criar setores
  for (const row of rows) {
    if (row.Tipo === "Setor") {
      const deptCode = row.Departamento;
      const subdeptCode = row.Subdepartamento;
      const deptId = departmentMap.get(deptCode);
      const subdeptId = subdeptCode ? subdepartmentMap.get(subdeptCode) : undefined;

      if (deptId) {
        sectors.push({
          orgId: "", // Será preenchido durante importação
          departmentId: deptId,
          subdepartmentId: subdeptId || null,
          name: row.Nome,
          code: row.Código,
          description: row.Descrição || null,
          status: (row.Status as "ativo" | "inativo" | "arquivado") || "ativo",
        });
        sectorMap.set(row.Código, row.ID);
      }
    }
  }

  // Quarto pass: criar cargos
  for (const row of rows) {
    if (row.Tipo === "Cargo") {
      const sectorCode = row.Setor;
      const sectorId = sectorMap.get(sectorCode);
      if (sectorId) {
        positions.push({
          orgId: "", // Será preenchido durante importação
          sectorId,
          name: row.Nome,
          code: row.Código,
          description: row.Descrição || null,
          responsabilidades: null,
          requisitos: null,
          salarioMin: null,
          salarioMax: null,
          status: (row.Status as "ativo" | "inativo" | "arquivado") || "ativo",
        });
      }
    }
  }

  return { departments, subdepartments, sectors, positions };
}

/**
 * Importa estrutura organizacional de CSV
 */
export async function importFromCSV(
  csvContent: string,
  orgId: string,
  options: {
    skipDuplicates?: boolean;
    updateExisting?: boolean;
  } = {},
): Promise<ImportResult> {
  try {
    const rows = parseCSV(csvContent);
    const structure = csvToOrganizationalStructure(rows);

    // Converter para formato JSON e usar importFromJSON
    const jsonData = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      departments: structure.departments.map((d) => ({
        ...d,
        id: "",
        departmentId: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
      subdepartments: structure.subdepartments.map((sd) => ({
        ...sd,
        id: "",
        subdepartmentId: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
      sectors: structure.sectors.map((s) => ({
        ...s,
        id: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
      positions: structure.positions.map((p) => ({
        ...p,
        id: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
    };

    // Usar a função de importação JSON existente
    const { importFromJSON } = await import("./import");
    return await importFromJSON(JSON.stringify(jsonData), orgId, options);
  } catch (error) {
    return {
      success: false,
      imported: { departments: 0, subdepartments: 0, sectors: 0, positions: 0 },
      errors: [
        {
          type: "department",
          code: "",
          name: "",
          error: error instanceof Error ? error.message : "Erro ao processar CSV",
        },
      ],
      warnings: [],
    };
  }
}


