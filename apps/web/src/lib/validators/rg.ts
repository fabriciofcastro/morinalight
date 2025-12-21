/**
 * Validação de RG por estado brasileiro
 * Cada estado tem regras específicas de formato e validação
 */

export type EstadoUF = 
  | "AC" | "AL" | "AP" | "AM" | "BA" | "CE" | "DF" | "ES" | "GO" 
  | "MA" | "MT" | "MS" | "MG" | "PA" | "PB" | "PR" | "PE" | "PI" 
  | "RJ" | "RN" | "RS" | "RO" | "RR" | "SC" | "SP" | "SE" | "TO";

interface RGValidationRule {
  minLength: number;
  maxLength: number;
  pattern?: RegExp;
  description: string;
}

const RG_RULES: Record<EstadoUF, RGValidationRule> = {
  // Acre
  AC: { minLength: 9, maxLength: 13, pattern: /^\d{9,13}$/, description: "9 a 13 dígitos" },
  
  // Alagoas
  AL: { minLength: 9, maxLength: 9, pattern: /^\d{9}$/, description: "9 dígitos" },
  
  // Amapá
  AP: { minLength: 8, maxLength: 9, pattern: /^\d{8,9}$/, description: "8 ou 9 dígitos" },
  
  // Amazonas
  AM: { minLength: 9, maxLength: 9, pattern: /^\d{9}$/, description: "9 dígitos" },
  
  // Bahia
  BA: { minLength: 7, maxLength: 9, pattern: /^\d{7,9}$/, description: "7 a 9 dígitos" },
  
  // Ceará
  CE: { minLength: 9, maxLength: 9, pattern: /^\d{9}$/, description: "9 dígitos" },
  
  // Distrito Federal
  DF: { minLength: 9, maxLength: 11, pattern: /^\d{9,11}$/, description: "9 a 11 dígitos" },
  
  // Espírito Santo
  ES: { minLength: 7, maxLength: 9, pattern: /^\d{7,9}$/, description: "7 a 9 dígitos" },
  
  // Goiás
  GO: { minLength: 8, maxLength: 9, pattern: /^\d{8,9}$/, description: "8 ou 9 dígitos" },
  
  // Maranhão
  MA: { minLength: 8, maxLength: 9, pattern: /^\d{8,9}$/, description: "8 ou 9 dígitos" },
  
  // Mato Grosso
  MT: { minLength: 8, maxLength: 9, pattern: /^\d{8,9}$/, description: "8 ou 9 dígitos" },
  
  // Mato Grosso do Sul
  MS: { minLength: 8, maxLength: 9, pattern: /^\d{8,9}$/, description: "8 ou 9 dígitos" },
  
  // Minas Gerais
  MG: { minLength: 9, maxLength: 13, pattern: /^\d{9,13}$/, description: "9 a 13 dígitos" },
  
  // Pará
  PA: { minLength: 8, maxLength: 9, pattern: /^\d{8,9}$/, description: "8 ou 9 dígitos" },
  
  // Paraíba
  PB: { minLength: 7, maxLength: 9, pattern: /^\d{7,9}$/, description: "7 a 9 dígitos" },
  
  // Paraná
  PR: { minLength: 8, maxLength: 10, pattern: /^\d{8,10}$/, description: "8 a 10 dígitos" },
  
  // Pernambuco
  PE: { minLength: 7, maxLength: 9, pattern: /^\d{7,9}$/, description: "7 a 9 dígitos" },
  
  // Piauí
  PI: { minLength: 8, maxLength: 9, pattern: /^\d{8,9}$/, description: "8 ou 9 dígitos" },
  
  // Rio de Janeiro
  RJ: { minLength: 7, maxLength: 8, pattern: /^\d{7,8}$/, description: "7 ou 8 dígitos" },
  
  // Rio Grande do Norte
  RN: { minLength: 9, maxLength: 10, pattern: /^\d{9,10}$/, description: "9 ou 10 dígitos" },
  
  // Rio Grande do Sul
  RS: { minLength: 10, maxLength: 10, pattern: /^\d{10}$/, description: "10 dígitos" },
  
  // Rondônia
  RO: { minLength: 9, maxLength: 14, pattern: /^\d{9,14}$/, description: "9 a 14 dígitos" },
  
  // Roraima
  RR: { minLength: 8, maxLength: 9, pattern: /^\d{8,9}$/, description: "8 ou 9 dígitos" },
  
  // Santa Catarina
  SC: { minLength: 9, maxLength: 9, pattern: /^\d{9}$/, description: "9 dígitos" },
  
  // São Paulo
  SP: { minLength: 9, maxLength: 9, pattern: /^\d{9}$/, description: "9 dígitos (formato: XX.XXX.XXX-X)" },
  
  // Sergipe
  SE: { minLength: 9, maxLength: 9, pattern: /^\d{9}$/, description: "9 dígitos" },
  
  // Tocantins
  TO: { minLength: 7, maxLength: 11, pattern: /^\d{7,11}$/, description: "7 a 11 dígitos" },
};

/**
 * Valida RG baseado no estado emissor
 * @param rg - Número do RG (com ou sem formatação)
 * @param estado - UF do estado emissor (opcional, se não informado valida formato genérico)
 * @returns true se válido, false caso contrário
 */
export function validateRG(rg: string, estado?: EstadoUF): boolean {
  if (!rg || !rg.trim()) {
    return false;
  }

  // Remove formatação
  const cleaned = rg.replace(/\D/g, "");

  // Se não tem estado, valida formato genérico (7 a 14 dígitos)
  if (!estado) {
    return cleaned.length >= 7 && cleaned.length <= 14;
  }

  // Busca regra do estado
  const rule = RG_RULES[estado];
  if (!rule) {
    return false;
  }

  // Valida comprimento
  if (cleaned.length < rule.minLength || cleaned.length > rule.maxLength) {
    return false;
  }

  // Valida padrão se existir
  if (rule.pattern && !rule.pattern.test(cleaned)) {
    return false;
  }

  return true;
}

/**
 * Formata RG baseado no estado
 * @param rg - Número do RG
 * @param estado - UF do estado emissor
 * @returns RG formatado
 */
export function formatRG(rg: string, estado?: EstadoUF): string {
  const cleaned = rg.replace(/\D/g, "");
  
  if (!estado) {
    // Formato genérico: XX.XXX.XXX-X
    if (cleaned.length === 9) {
      return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, "$1.$2.$3-$4");
    }
    return cleaned;
  }

  // Formato específico por estado
  switch (estado) {
    case "SP":
      // SP: XX.XXX.XXX-X
      if (cleaned.length === 9) {
        return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, "$1.$2.$3-$4");
      }
      break;
    
    case "RJ":
      // RJ: XX.XXX.XXX-X ou X.XXX.XXX-X
      if (cleaned.length === 8) {
        return cleaned.replace(/(\d{1})(\d{3})(\d{3})(\d{1})/, "$1.$2.$3-$4");
      }
      if (cleaned.length === 7) {
        return cleaned.replace(/(\d{1})(\d{3})(\d{3})/, "$1.$2.$3");
      }
      break;
    
    case "MG":
      // MG: XX.XXX.XXX-X ou X.XXX.XXX-X
      if (cleaned.length >= 9) {
        return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3-$4");
      }
      break;
    
    case "RS":
      // RS: XXX.XXX.XXX-X
      if (cleaned.length === 10) {
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{1})/, "$1.$2.$3-$4");
      }
      break;
    
    default:
      // Formato genérico para outros estados
      if (cleaned.length === 9) {
        return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, "$1.$2.$3-$4");
      }
      if (cleaned.length === 8) {
        return cleaned.replace(/(\d{2})(\d{3})(\d{3})/, "$1.$2.$3");
      }
  }

  return cleaned;
}

/**
 * Retorna a descrição do formato de RG para um estado
 */
export function getRGFormatDescription(estado: EstadoUF): string {
  const rule = RG_RULES[estado];
  return rule ? rule.description : "Formato variável";
}

/**
 * Retorna lista de estados válidos
 */
export function getValidEstados(): EstadoUF[] {
  return Object.keys(RG_RULES) as EstadoUF[];
}


