import type { SupplierRepository } from "../repositories/supplier.repository";
import { detectColumnMapping as detectCSVMapping, parseCSV } from "../utils/csv-parser";
import { detectColumnMapping as detectExcelMapping, parseExcel } from "../utils/excel-parser";
import {
  mapToSupplierRow,
  type SupplierImportRow,
  type ValidationResult,
  validateSupplierRow,
  validateSupplierRows,
} from "../utils/import-validator";

export interface ImportPreview {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  rows: Array<{
    index: number;
    data: SupplierImportRow;
    validation: ValidationResult;
  }>;
  columnMapping: Record<string, string>;
  detectedHeaders: string[];
}

export interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
}

export class SupplierImportService {
  constructor(private supplierRepository: SupplierRepository) {}

  /**
   * Parse and validate uploaded file
   */
  async parseAndValidate(
    fileContent: Buffer | string,
    fileName: string,
    orgId: string,
    columnMapping?: Record<string, string>,
  ): Promise<ImportPreview> {
    // Detect file type
    const isCSV = fileName.endsWith(".csv");
    const isExcel = fileName.endsWith(".xlsx") || fileName.endsWith(".xls");

    let parsedData: Array<Record<string, string | number | undefined>> = [];
    let detectedHeaders: string[] = [];

    // Parse file
    if (isCSV) {
      const result = parseCSV(fileContent.toString("utf-8"));
      parsedData = result.data;
      detectedHeaders = result.meta.fields || [];
    } else if (isExcel) {
      const result = parseExcel(fileContent as Buffer);
      if (result.errors.length > 0) {
        throw new Error(`Erro ao processar Excel: ${result.errors.join(", ")}`);
      }
      parsedData = result.data;
      if (parsedData.length > 0) {
        detectedHeaders = Object.keys(parsedData[0]);
      }
    } else {
      throw new Error("Formato de arquivo não suportado. Use CSV ou Excel (XLSX/XLS)");
    }

    // Detect or use provided column mapping
    let finalMapping: Record<string, string>;
    if (columnMapping) {
      finalMapping = columnMapping;
    } else {
      finalMapping = isCSV
        ? detectCSVMapping(detectedHeaders)
        : detectExcelMapping(detectedHeaders);
    }

    // Get existing documents for duplicate check
    const existingSuppliers = await this.supplierRepository.findByOrgId(orgId, { limit: 10000 });
    const existingDocuments = new Set(
      existingSuppliers.map((s) => s.document?.replace(/\D/g, "")).filter((d): d is string => !!d),
    );

    // Map and validate rows
    const rows: ImportPreview["rows"] = [];
    let validRows = 0;
    let invalidRows = 0;

    for (let i = 0; i < parsedData.length; i++) {
      const rawRow = parsedData[i];
      const mappedRow = mapToSupplierRow(rawRow, finalMapping);
      const validation = validateSupplierRow(mappedRow, i, {
        checkDuplicates: true,
        existingDocuments,
      });

      if (validation.isValid) {
        validRows++;
      } else {
        invalidRows++;
      }

      rows.push({
        index: i + 1,
        data: mappedRow,
        validation,
      });
    }

    return {
      totalRows: rows.length,
      validRows,
      invalidRows,
      rows,
      columnMapping: finalMapping,
      detectedHeaders,
    };
  }

  /**
   * Execute import of validated suppliers
   */
  async executeImport(
    rows: SupplierImportRow[],
    orgId: string,
    userId: string,
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    // Validate all rows again before importing
    const validations = validateSupplierRows(rows, { checkDuplicates: false });

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const validation = validations[i];

      if (!validation.isValid) {
        result.failed++;
        result.errors.push({
          row: i + 1,
          message: validation.errors.map((e) => e.message).join("; "),
        });
        continue;
      }

      try {
        // Check if supplier already exists by document
        let existingSupplier = null;
        if (row.document) {
          const cleanDocument = row.document.replace(/\D/g, "");
          const suppliers = await this.supplierRepository.findByOrgId(orgId, { limit: 10000 });
          existingSupplier = suppliers.find(
            (s) => s.document?.replace(/\D/g, "") === cleanDocument,
          );
        }

        if (existingSupplier) {
          // Update existing supplier
          await this.supplierRepository.update(
            existingSupplier.id,
            {
              name: row.name || existingSupplier.name,
              email: row.email ?? existingSupplier.email,
              phone: row.phone ?? existingSupplier.phone,
              document: row.document ?? existingSupplier.document,
              address: row.address ?? existingSupplier.address,
              city: row.city ?? existingSupplier.city,
              state: row.state ?? existingSupplier.state,
              zipCode: row.zipCode ?? existingSupplier.zipCode,
              website: row.website ?? existingSupplier.website,
              ramoAtividade: row.ramoAtividade ?? existingSupplier.ramoAtividade,
              tipoFornecedor: row.tipoFornecedor ?? existingSupplier.tipoFornecedor,
              prazoPagamento: row.prazoPagamento ?? existingSupplier.prazoPagamento,
              condicaoPagamento: row.condicaoPagamento ?? existingSupplier.condicaoPagamento,
              limiteCredito: row.limiteCredito ?? existingSupplier.limiteCredito,
              contatoPrincipal: row.contatoPrincipal ?? existingSupplier.contatoPrincipal,
              cargoContato: row.cargoContato ?? existingSupplier.cargoContato,
              notes: row.notes ?? existingSupplier.notes,
              updatedBy: userId,
            },
            { userId, action: "import_update" },
          );
        } else {
          // Create new supplier
          await this.supplierRepository.create(
            {
              orgId,
              name: row.name!,
              email: row.email,
              phone: row.phone,
              document: row.document,
              address: row.address,
              city: row.city,
              state: row.state,
              zipCode: row.zipCode,
              website: row.website,
              ramoAtividade: row.ramoAtividade,
              tipoFornecedor: row.tipoFornecedor,
              prazoPagamento: row.prazoPagamento,
              condicaoPagamento: row.condicaoPagamento,
              limiteCredito: row.limiteCredito,
              contatoPrincipal: row.contatoPrincipal,
              cargoContato: row.cargoContato,
              notes: row.notes,
              status: "ativo",
              createdBy: userId,
              updatedBy: userId,
            },
            { userId, action: "import_create" },
          );
        }

        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          row: i + 1,
          message: error instanceof Error ? error.message : "Erro desconhecido",
        });
      }
    }

    return result;
  }
}
