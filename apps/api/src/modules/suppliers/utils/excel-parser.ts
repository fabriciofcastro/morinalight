import * as XLSX from "xlsx";

export interface ParsedRow {
  [key: string]: string | number | undefined;
}

export interface ParseResult {
  data: ParsedRow[];
  sheetNames: string[];
  errors: string[];
}

/**
 * Parse Excel file (XLSX, XLS)
 */
export function parseExcel(buffer: Buffer, sheetIndex = 0): ParseResult {
  const errors: string[] = [];
  let data: ParsedRow[] = [];
  let sheetNames: string[] = [];

  try {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    sheetNames = workbook.SheetNames;

    if (sheetNames.length === 0) {
      errors.push("Arquivo Excel não contém planilhas");
      return { data: [], sheetNames: [], errors };
    }

    const sheetName = sheetNames[sheetIndex] || sheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
      errors.push(`Planilha "${sheetName}" não encontrada`);
      return { data: [], sheetNames: [], errors };
    }

    // Convert to JSON with header row
    const jsonData = XLSX.utils.sheet_to_json<ParsedRow>(worksheet, {
      header: 1, // Use first row as header
      defval: "", // Default value for empty cells
      raw: false, // Convert all values to strings
    });

    if (jsonData.length === 0) {
      errors.push("Planilha está vazia");
      return { data: [], sheetNames: [], errors };
    }

    // First row is headers
    const headers = (jsonData[0] as unknown as string[]).map((h) =>
      String(h || "").trim().toLowerCase().replace(/\s+/g, "_")
    );

    // Convert rows to objects
    data = jsonData.slice(1).map((row) => {
      const rowObj: ParsedRow = {};
      const rowArray = row as unknown as (string | number)[];

      headers.forEach((header, index) => {
        const value = rowArray[index];
        rowObj[header] = value !== undefined && value !== null ? String(value).trim() : undefined;
      });

      return rowObj;
    });

    // Filter out completely empty rows
    data = data.filter((row) => {
      return Object.values(row).some((val) => val !== undefined && val !== "" && val !== null);
    });
  } catch (error) {
    errors.push(`Erro ao processar arquivo Excel: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
  }

  return { data, sheetNames, errors };
}

/**
 * Detect column mapping from Excel headers
 */
export function detectColumnMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};

  // Common field mappings (case-insensitive)
  const fieldMappings: Record<string, string[]> = {
    name: ["nome", "name", "razao_social", "razao social", "fornecedor"],
    document: ["cnpj", "document", "documento", "cpf_cnpj"],
    email: ["email", "e-mail", "correio"],
    phone: ["telefone", "phone", "fone", "tel"],
    address: ["endereco", "address", "rua", "logradouro"],
    city: ["cidade", "city", "municipio"],
    state: ["estado", "state", "uf", "sigla"],
    zipCode: ["cep", "zipcode", "zip_code", "codigo_postal"],
    website: ["website", "site", "url", "web"],
    ramoAtividade: ["ramo_atividade", "ramo", "atividade", "segmento"],
    tipoFornecedor: ["tipo_fornecedor", "tipo", "categoria"],
    prazoPagamento: ["prazo_pagamento", "prazo", "dias_pagamento"],
    condicaoPagamento: ["condicao_pagamento", "condicao", "forma_pagamento"],
    limiteCredito: ["limite_credito", "limite", "credito"],
    contatoPrincipal: ["contato_principal", "contato", "responsavel"],
    cargoContato: ["cargo_contato", "cargo", "funcao"],
    notes: ["notas", "notes", "observacoes", "observacao"],
  };

  headers.forEach((header) => {
    const normalizedHeader = String(header).toLowerCase().trim();

    // Find matching field
    for (const [field, aliases] of Object.entries(fieldMappings)) {
      if (aliases.some((alias) => normalizedHeader === alias || normalizedHeader.includes(alias))) {
        mapping[header] = field;
        break;
      }
    }
  });

  return mapping;
}









