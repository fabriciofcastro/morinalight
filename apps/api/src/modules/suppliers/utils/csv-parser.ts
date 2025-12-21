import Papa from "papaparse";

export interface ParsedRow {
  [key: string]: string | undefined;
}

export interface ParseResult {
  data: ParsedRow[];
  errors: Papa.ParseError[];
  meta: Papa.ParseMeta;
}

/**
 * Parse CSV file content
 */
export function parseCSV(content: string): ParseResult {
  const result = Papa.parse<ParsedRow>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => {
      // Normalize header: trim, lowercase, replace spaces with underscores
      return header.trim().toLowerCase().replace(/\s+/g, "_");
    },
    transform: (value: string) => {
      // Trim values
      return value.trim();
    },
  });

  return {
    data: result.data,
    errors: result.errors,
    meta: result.meta,
  };
}

/**
 * Detect column mapping from CSV headers
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
    const normalizedHeader = header.toLowerCase().trim();

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





