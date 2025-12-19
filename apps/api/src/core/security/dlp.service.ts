/**
 * Data Loss Prevention (DLP) Service
 * Detecta vazamento de dados sensíveis
 */

type DLPFinding = {
  type: "cpf" | "cnpj" | "credit_card" | "email" | "phone";
  count: number;
  positions?: number[];
};

type DLPResult = {
  violations: DLPFinding[];
  riskLevel: "low" | "medium" | "high" | "critical";
};

// Padrões para detecção de dados sensíveis
const DLP_PATTERNS = {
  cpf: /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g,
  cnpj: /\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g,
  credit_card: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /\b(\(?\d{2}\)?\s?)?\d{4,5}[\s-]?\d{4}\b/g,
} as const;

/**
 * Escaneia conteúdo em busca de dados sensíveis
 */
export function scanContent(content: string): DLPResult {
  const findings: DLPFinding[] = [];

  for (const [type, pattern] of Object.entries(DLP_PATTERNS)) {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      findings.push({
        type: type as DLPFinding["type"],
        count: matches.length,
      });
    }
  }

  // Calcular nível de risco
  let riskLevel: DLPResult["riskLevel"] = "low";
  if (findings.length > 0) {
    const totalMatches = findings.reduce((sum, f) => sum + f.count, 0);
    if (totalMatches >= 10) {
      riskLevel = "critical";
    } else if (totalMatches >= 5) {
      riskLevel = "high";
    } else if (totalMatches >= 2) {
      riskLevel = "medium";
    }
  }

  return {
    violations: findings,
    riskLevel,
  };
}

/**
 * Valida se conteúdo contém dados sensíveis (para uploads, etc.)
 */
export function validateContent(content: string): { valid: boolean; violations: DLPFinding[] } {
  const result = scanContent(content);
  return {
    valid: result.violations.length === 0,
    violations: result.violations,
  };
}

/**
 * Sanitiza conteúdo removendo dados sensíveis detectados
 */
export function sanitizeContent(content: string, replaceWith: string = "[REDACTED]"): string {
  let sanitized = content;

  for (const pattern of Object.values(DLP_PATTERNS)) {
    sanitized = sanitized.replace(pattern, replaceWith);
  }

  return sanitized;
}
