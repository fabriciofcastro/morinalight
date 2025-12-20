import { z } from "zod";

export interface ValidationError {
  row: number;
  field: string;
  message: string;
  value?: unknown;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface SupplierImportRow {
  name?: string;
  document?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  website?: string;
  ramoAtividade?: string;
  tipoFornecedor?: string;
  prazoPagamento?: number;
  condicaoPagamento?: string;
  limiteCredito?: number;
  contatoPrincipal?: string;
  cargoContato?: string;
  notes?: string;
}

/**
 * Validate CNPJ format and check digits
 */
function validateCNPJ(cnpj: string): boolean {
  // Remove formatting
  const cleanCNPJ = cnpj.replace(/\D/g, "");

  // Check length
  if (cleanCNPJ.length !== 14) {
    return false;
  }

  // Check if all digits are the same
  if (/^(\d)\1+$/.test(cleanCNPJ)) {
    return false;
  }

  // Validate check digits
  let length = cleanCNPJ.length - 2;
  let numbers = cleanCNPJ.substring(0, length);
  const digits = cleanCNPJ.substring(length);
  let sum = 0;
  let pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += Number(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== Number(digits.charAt(0))) {
    return false;
  }

  length = length + 1;
  numbers = cleanCNPJ.substring(0, length);
  sum = 0;
  pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += Number(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== Number(digits.charAt(1))) {
    return false;
  }

  return true;
}

/**
 * Validate email format
 */
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone format (Brazilian)
 */
function validatePhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, "");
  // Brazilian phone: 10 or 11 digits (with or without area code)
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
}

/**
 * Validate URL format
 */
function validateURL(url: string): boolean {
  try {
    new URL(url.startsWith("http") ? url : `https://${url}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate CEP format (Brazilian)
 */
function validateCEP(cep: string): boolean {
  const cleanCEP = cep.replace(/\D/g, "");
  return cleanCEP.length === 8;
}

/**
 * Validate a single supplier import row
 */
export function validateSupplierRow(
  row: SupplierImportRow,
  rowIndex: number,
  options: { checkDuplicates?: boolean; existingDocuments?: Set<string> } = {}
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Required fields
  if (!row.name || row.name.trim().length === 0) {
    errors.push({
      row: rowIndex + 1,
      field: "name",
      message: "Nome é obrigatório",
      value: row.name,
    });
  }

  // Document validation (CNPJ/CPF)
  if (row.document) {
    const cleanDocument = row.document.replace(/\D/g, "");
    
    if (cleanDocument.length === 14) {
      // CNPJ
      if (!validateCNPJ(row.document)) {
        errors.push({
          row: rowIndex + 1,
          field: "document",
          message: "CNPJ inválido",
          value: row.document,
        });
      } else if (options.checkDuplicates && options.existingDocuments?.has(cleanDocument)) {
        warnings.push({
          row: rowIndex + 1,
          field: "document",
          message: "CNPJ já existe no sistema",
          value: row.document,
        });
      }
    } else if (cleanDocument.length === 11) {
      // CPF (validar formato básico)
      if (!/^\d{11}$/.test(cleanDocument)) {
        errors.push({
          row: rowIndex + 1,
          field: "document",
          message: "CPF inválido",
          value: row.document,
        });
      }
    } else if (cleanDocument.length > 0) {
      errors.push({
        row: rowIndex + 1,
        field: "document",
        message: "Documento deve ter 11 (CPF) ou 14 (CNPJ) dígitos",
        value: row.document,
      });
    }
  }

  // Email validation
  if (row.email && row.email.trim().length > 0) {
    if (!validateEmail(row.email)) {
      errors.push({
        row: rowIndex + 1,
        field: "email",
        message: "Email inválido",
        value: row.email,
      });
    }
  }

  // Phone validation
  if (row.phone && row.phone.trim().length > 0) {
    if (!validatePhone(row.phone)) {
      warnings.push({
        row: rowIndex + 1,
        field: "phone",
        message: "Telefone pode estar em formato inválido",
        value: row.phone,
      });
    }
  }

  // Website validation
  if (row.website && row.website.trim().length > 0) {
    if (!validateURL(row.website)) {
      warnings.push({
        row: rowIndex + 1,
        field: "website",
        message: "URL do website pode estar inválida",
        value: row.website,
      });
    }
  }

  // CEP validation
  if (row.zipCode && row.zipCode.trim().length > 0) {
    if (!validateCEP(row.zipCode)) {
      warnings.push({
        row: rowIndex + 1,
        field: "zipCode",
        message: "CEP pode estar em formato inválido",
        value: row.zipCode,
      });
    }
  }

  // State validation (should be 2 characters)
  if (row.state && row.state.trim().length > 0) {
    if (row.state.trim().length !== 2) {
      warnings.push({
        row: rowIndex + 1,
        field: "state",
        message: "Estado deve ter 2 caracteres (UF)",
        value: row.state,
      });
    }
  }

  // Prazo pagamento validation
  if (row.prazoPagamento !== undefined) {
    const prazo = typeof row.prazoPagamento === "string" ? parseInt(row.prazoPagamento, 10) : row.prazoPagamento;
    if (isNaN(prazo) || prazo < 0 || prazo > 365) {
      errors.push({
        row: rowIndex + 1,
        field: "prazoPagamento",
        message: "Prazo de pagamento deve ser entre 0 e 365 dias",
        value: row.prazoPagamento,
      });
    }
  }

  // Limite crédito validation
  if (row.limiteCredito !== undefined) {
    const limite = typeof row.limiteCredito === "string" ? parseFloat(row.limiteCredito) : row.limiteCredito;
    if (isNaN(limite) || limite < 0) {
      errors.push({
        row: rowIndex + 1,
        field: "limiteCredito",
        message: "Limite de crédito deve ser um número positivo",
        value: row.limiteCredito,
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate multiple supplier rows
 */
export function validateSupplierRows(
  rows: SupplierImportRow[],
  options: { checkDuplicates?: boolean; existingDocuments?: Set<string> } = {}
): ValidationResult[] {
  return rows.map((row, index) => validateSupplierRow(row, index, options));
}

/**
 * Map raw parsed data to SupplierImportRow using column mapping
 */
export function mapToSupplierRow(
  rawRow: Record<string, string | number | undefined>,
  columnMapping: Record<string, string>
): SupplierImportRow {
  const mapped: SupplierImportRow = {};

  // Reverse mapping: field -> column name
  const reverseMapping: Record<string, string> = {};
  for (const [column, field] of Object.entries(columnMapping)) {
    reverseMapping[field] = column;
  }

  // Map each field
  const fields: (keyof SupplierImportRow)[] = [
    "name",
    "document",
    "email",
    "phone",
    "address",
    "city",
    "state",
    "zipCode",
    "website",
    "ramoAtividade",
    "tipoFornecedor",
    "prazoPagamento",
    "condicaoPagamento",
    "limiteCredito",
    "contatoPrincipal",
    "cargoContato",
    "notes",
  ];

  for (const field of fields) {
    const columnName = reverseMapping[field];
    if (columnName && rawRow[columnName] !== undefined) {
      const value = rawRow[columnName];
      
      // Convert to appropriate type
      if (field === "prazoPagamento" || field === "limiteCredito") {
        const numValue = typeof value === "string" ? parseFloat(value.replace(",", ".")) : Number(value);
        if (!isNaN(numValue)) {
          mapped[field] = numValue;
        }
      } else {
        mapped[field] = String(value || "").trim() || undefined;
      }
    }
  }

  return mapped;
}


