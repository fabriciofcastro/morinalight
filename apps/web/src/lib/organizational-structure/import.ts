/**
 * Utilitários para importação de estrutura organizacional
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

export type OrganizationalStructureImport = {
  version: string;
  exportedAt?: string;
  departments: Department[];
  subdepartments: Subdepartment[];
  sectors: Sector[];
  positions: Position[];
};

export type ImportResult = {
  success: boolean;
  imported: {
    departments: number;
    subdepartments: number;
    sectors: number;
    positions: number;
  };
  errors: Array<{
    type: "department" | "subdepartment" | "sector" | "position";
    code: string;
    name: string;
    error: string;
  }>;
  warnings: string[];
};

/**
 * Valida estrutura organizacional antes de importar
 */
export function validateImport(data: OrganizationalStructureImport): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validar versão
  if (!data.version) {
    errors.push("Versão não especificada");
  }

  // Validar estrutura básica
  if (!Array.isArray(data.departments)) {
    errors.push("Departamentos devem ser um array");
  }
  if (!Array.isArray(data.subdepartments)) {
    errors.push("Subdepartamentos devem ser um array");
  }
  if (!Array.isArray(data.sectors)) {
    errors.push("Setores devem ser um array");
  }
  if (!Array.isArray(data.positions)) {
    errors.push("Cargos devem ser um array");
  }

  // Validar códigos únicos
  const departmentCodes = new Set<string>();
  for (const dept of data.departments || []) {
    if (departmentCodes.has(dept.code)) {
      errors.push(`Código de departamento duplicado: ${dept.code}`);
    }
    departmentCodes.add(dept.code);
  }

  const subdepartmentCodes = new Set<string>();
  for (const subdept of data.subdepartments || []) {
    if (subdepartmentCodes.has(subdept.code)) {
      errors.push(`Código de subdepartamento duplicado: ${subdept.code}`);
    }
    subdepartmentCodes.add(subdept.code);
  }

  const sectorCodes = new Set<string>();
  for (const sector of data.sectors || []) {
    if (sectorCodes.has(sector.code)) {
      errors.push(`Código de setor duplicado: ${sector.code}`);
    }
    sectorCodes.add(sector.code);
  }

  const positionCodes = new Set<string>();
  for (const position of data.positions || []) {
    if (positionCodes.has(position.code)) {
      errors.push(`Código de cargo duplicado: ${position.code}`);
    }
    positionCodes.add(position.code);
  }

  // Validar referências
  for (const subdept of data.subdepartments || []) {
    const dept = data.departments?.find(
      (d) => d.id === subdept.departmentId || d.departmentId === subdept.departmentId,
    );
    if (!dept) {
      errors.push(`Subdepartamento ${subdept.code} referencia departamento inexistente: ${subdept.departmentId}`);
    }
  }

  for (const sector of data.sectors || []) {
    const dept = data.departments?.find(
      (d) => d.id === sector.departmentId || d.departmentId === sector.departmentId,
    );
    if (!dept && !sector.subdepartmentId) {
      errors.push(`Setor ${sector.code} referencia departamento inexistente: ${sector.departmentId}`);
    }
    if (sector.subdepartmentId) {
      const subdept = data.subdepartments?.find(
        (sd) => sd.id === sector.subdepartmentId || sd.subdepartmentId === sector.subdepartmentId,
      );
      if (!subdept) {
        errors.push(`Setor ${sector.code} referencia subdepartamento inexistente: ${sector.subdepartmentId}`);
      }
    }
  }

  for (const position of data.positions || []) {
    const sector = data.sectors?.find((s) => s.id === position.sectorId);
    if (!sector) {
      errors.push(`Cargo ${position.code} referencia setor inexistente: ${position.sectorId}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Importa estrutura organizacional de JSON
 */
export async function importFromJSON(
  jsonContent: string,
  orgId: string,
  options: {
    skipDuplicates?: boolean;
    updateExisting?: boolean;
  } = {},
): Promise<ImportResult> {
  const data: OrganizationalStructureImport = JSON.parse(jsonContent);

  // Validar
  const validation = validateImport(data);
  if (!validation.valid) {
    return {
      success: false,
      imported: { departments: 0, subdepartments: 0, sectors: 0, positions: 0 },
      errors: validation.errors.map((error) => ({
        type: "department",
        code: "",
        name: "",
        error,
      })),
      warnings: [],
    };
  }

  const result: ImportResult = {
    success: true,
    imported: { departments: 0, subdepartments: 0, sectors: 0, positions: 0 },
    errors: [],
    warnings: [],
  };

  // Importar departamentos
  for (const dept of data.departments || []) {
    try {
      const existing = await organizationalStructureApi
        .getDepartments()
        .then((list) => list.find((d) => d.code === dept.code))
        .catch(() => null);

      if (existing && !options.updateExisting && !options.skipDuplicates) {
        result.errors.push({
          type: "department",
          code: dept.code,
          name: dept.name,
          error: "Departamento já existe",
        });
        continue;
      }

      if (existing && options.updateExisting) {
        await organizationalStructureApi.updateDepartment({
          departmentId: existing.id || existing.departmentId,
          orgId,
          ...dept,
        });
        result.warnings.push(`Departamento ${dept.code} atualizado`);
      } else if (!existing) {
        await organizationalStructureApi.createDepartment({
          orgId,
          name: dept.name,
          code: dept.code,
          description: dept.description,
          type: dept.type || "CORE",
          filialId: dept.filialId,
          parentId: dept.parentId,
          active: dept.active !== false,
        });
        result.imported.departments++;
      }
    } catch (error) {
      result.errors.push({
        type: "department",
        code: dept.code,
        name: dept.name,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Importar subdepartamentos
  for (const subdept of data.subdepartments || []) {
    try {
      const existing = await organizationalStructureApi
        .getSubdepartments()
        .then((list) => list.find((sd) => sd.code === subdept.code))
        .catch(() => null);

      if (existing && !options.updateExisting && !options.skipDuplicates) {
        result.errors.push({
          type: "subdepartment",
          code: subdept.code,
          name: subdept.name,
          error: "Subdepartamento já existe",
        });
        continue;
      }

      // Buscar departmentId atualizado
      const dept = await organizationalStructureApi
        .getDepartments()
        .then((list) => list.find((d) => d.code === data.departments?.find((d2) => d2.id === subdept.departmentId || d2.departmentId === subdept.departmentId)?.code))
        .catch(() => null);

      if (!dept) {
        result.errors.push({
          type: "subdepartment",
          code: subdept.code,
          name: subdept.name,
          error: "Departamento pai não encontrado",
        });
        continue;
      }

      if (existing && options.updateExisting) {
        await organizationalStructureApi.updateSubdepartment({
          subdepartmentId: existing.id || existing.subdepartmentId,
          orgId,
          departmentId: dept.id || dept.departmentId,
          ...subdept,
        });
        result.warnings.push(`Subdepartamento ${subdept.code} atualizado`);
      } else if (!existing) {
        await organizationalStructureApi.createSubdepartment({
          orgId,
          departmentId: dept.id || dept.departmentId,
          name: subdept.name,
          code: subdept.code,
          description: subdept.description,
          status: subdept.status || "ativo",
        });
        result.imported.subdepartments++;
      }
    } catch (error) {
      result.errors.push({
        type: "subdepartment",
        code: subdept.code,
        name: subdept.name,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Importar setores
  for (const sector of data.sectors || []) {
    try {
      const existing = await organizationalStructureApi
        .getSectors()
        .then((list) => list.find((s) => s.code === sector.code))
        .catch(() => null);

      if (existing && !options.updateExisting && !options.skipDuplicates) {
        result.errors.push({
          type: "sector",
          code: sector.code,
          name: sector.name,
          error: "Setor já existe",
        });
        continue;
      }

      // Buscar departmentId/subdepartmentId atualizado
      const dept = await organizationalStructureApi
        .getDepartments()
        .then((list) => list.find((d) => d.code === data.departments?.find((d2) => d2.id === sector.departmentId || d2.departmentId === sector.departmentId)?.code))
        .catch(() => null);

      if (!dept) {
        result.errors.push({
          type: "sector",
          code: sector.code,
          name: sector.name,
          error: "Departamento pai não encontrado",
        });
        continue;
      }

      let subdepartmentId: string | undefined;
      if (sector.subdepartmentId) {
        const subdept = await organizationalStructureApi
          .getSubdepartments()
          .then((list) => list.find((sd) => sd.code === data.subdepartments?.find((sd2) => sd2.id === sector.subdepartmentId || sd2.subdepartmentId === sector.subdepartmentId)?.code))
          .catch(() => null);
        subdepartmentId = subdept?.id || subdept?.subdepartmentId;
      }

      if (existing && options.updateExisting) {
        await organizationalStructureApi.updateSector({
          id: existing.id,
          orgId,
          departmentId: dept.id || dept.departmentId,
          subdepartmentId,
          ...sector,
        });
        result.warnings.push(`Setor ${sector.code} atualizado`);
      } else if (!existing) {
        await organizationalStructureApi.createSector({
          orgId,
          departmentId: dept.id || dept.departmentId,
          subdepartmentId,
          name: sector.name,
          code: sector.code,
          description: sector.description,
          status: sector.status || "ativo",
        });
        result.imported.sectors++;
      }
    } catch (error) {
      result.errors.push({
        type: "sector",
        code: sector.code,
        name: sector.name,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Importar cargos
  for (const position of data.positions || []) {
    try {
      const existing = await organizationalStructureApi
        .getPositions()
        .then((list) => list.find((p) => p.code === position.code))
        .catch(() => null);

      if (existing && !options.updateExisting && !options.skipDuplicates) {
        result.errors.push({
          type: "position",
          code: position.code,
          name: position.name,
          error: "Cargo já existe",
        });
        continue;
      }

      // Buscar sectorId atualizado
      const sector = await organizationalStructureApi
        .getSectors()
        .then((list) => list.find((s) => s.code === data.sectors?.find((s2) => s2.id === position.sectorId)?.code))
        .catch(() => null);

      if (!sector) {
        result.errors.push({
          type: "position",
          code: position.code,
          name: position.name,
          error: "Setor pai não encontrado",
        });
        continue;
      }

      if (existing && options.updateExisting) {
        await organizationalStructureApi.updatePosition({
          id: existing.id,
          orgId,
          sectorId: sector.id,
          ...position,
        });
        result.warnings.push(`Cargo ${position.code} atualizado`);
      } else if (!existing) {
        await organizationalStructureApi.createPosition({
          orgId,
          sectorId: sector.id,
          name: position.name,
          code: position.code,
          description: position.description,
          responsabilidades: position.responsabilidades,
          requisitos: position.requisitos,
          salarioMin: position.salarioMin,
          salarioMax: position.salarioMax,
        });
        result.imported.positions++;
      }
    } catch (error) {
      result.errors.push({
        type: "position",
        code: position.code,
        name: position.name,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  result.success = result.errors.length === 0;

  return result;
}

/**
 * Lê arquivo como texto
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error("Falha ao ler arquivo"));
      }
    };
    reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
    reader.readAsText(file);
  });
}


