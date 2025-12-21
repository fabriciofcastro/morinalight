/**
 * Validação de Inscrição Estadual por estado brasileiro
 * Cada estado tem regras específicas de formato e validação
 */

export type EstadoUF = 
  | "AC" | "AL" | "AP" | "AM" | "BA" | "CE" | "DF" | "ES" | "GO" 
  | "MA" | "MT" | "MS" | "MG" | "PA" | "PB" | "PR" | "PE" | "PI" 
  | "RJ" | "RN" | "RS" | "RO" | "RR" | "SC" | "SP" | "SE" | "TO";

interface IEValidationRule {
  minLength: number;
  maxLength: number;
  pattern?: RegExp;
  description: string;
  validate?: (ie: string) => boolean;
}

const IE_RULES: Record<EstadoUF, IEValidationRule> = {
  // Acre
  AC: { 
    minLength: 13, 
    maxLength: 13, 
    pattern: /^\d{13}$/, 
    description: "13 dígitos",
    validate: (ie: string) => {
      if (ie.length !== 13) return false;
      // Validação do dígito verificador do AC
      const base = ie.slice(0, 11);
      const dv = parseInt(ie.slice(11, 13));
      let sum = 0;
      for (let i = 0; i < 11; i++) {
        sum += parseInt(base[i]) * (i + 2);
      }
      const remainder = sum % 11;
      const calculatedDV = remainder < 2 ? 0 : 11 - remainder;
      return calculatedDV === dv;
    }
  },
  
  // Alagoas
  AL: { 
    minLength: 9, 
    maxLength: 9, 
    pattern: /^\d{9}$/, 
    description: "9 dígitos",
    validate: (ie: string) => {
      if (ie.length !== 9) return false;
      const base = ie.slice(0, 8);
      const dv = parseInt(ie[8]);
      let sum = 0;
      for (let i = 0; i < 8; i++) {
        sum += parseInt(base[i]) * (9 - i);
      }
      const remainder = sum % 11;
      const calculatedDV = remainder < 2 ? 0 : 11 - remainder;
      return calculatedDV === dv;
    }
  },
  
  // Amapá
  AP: { 
    minLength: 9, 
    maxLength: 9, 
    pattern: /^\d{9}$/, 
    description: "9 dígitos",
    validate: (ie: string) => {
      if (ie.length !== 9) return false;
      const base = ie.slice(0, 8);
      const dv = parseInt(ie[8]);
      let sum = 0;
      let multiplier = 9;
      for (let i = 0; i < 8; i++) {
        sum += parseInt(base[i]) * multiplier;
        multiplier--;
      }
      const remainder = sum % 11;
      let calculatedDV = 11 - remainder;
      if (calculatedDV === 10) calculatedDV = 0;
      if (calculatedDV === 11) calculatedDV = 0;
      return calculatedDV === dv;
    }
  },
  
  // Amazonas
  AM: { 
    minLength: 9, 
    maxLength: 9, 
    pattern: /^\d{9}$/, 
    description: "9 dígitos",
    validate: (ie: string) => {
      if (ie.length !== 9) return false;
      const base = ie.slice(0, 8);
      const dv = parseInt(ie[8]);
      let sum = 0;
      for (let i = 0; i < 8; i++) {
        sum += parseInt(base[i]) * (9 - i);
      }
      const remainder = sum % 11;
      const calculatedDV = remainder < 2 ? 0 : 11 - remainder;
      return calculatedDV === dv;
    }
  },
  
  // Bahia
  BA: { 
    minLength: 8, 
    maxLength: 9, 
    pattern: /^\d{8,9}$/, 
    description: "8 ou 9 dígitos",
    validate: (ie: string) => {
      if (ie.length !== 8 && ie.length !== 9) return false;
      // Validação simplificada - BA tem regras complexas
      return /^\d{8,9}$/.test(ie);
    }
  },
  
  // Ceará
  CE: { 
    minLength: 9, 
    maxLength: 9, 
    pattern: /^\d{9}$/, 
    description: "9 dígitos",
    validate: (ie: string) => {
      if (ie.length !== 9) return false;
      const base = ie.slice(0, 8);
      const dv = parseInt(ie[8]);
      let sum = 0;
      for (let i = 0; i < 8; i++) {
        sum += parseInt(base[i]) * (9 - i);
      }
      const remainder = sum % 11;
      const calculatedDV = remainder < 2 ? 0 : 11 - remainder;
      return calculatedDV === dv;
    }
  },
  
  // Distrito Federal
  DF: { 
    minLength: 13, 
    maxLength: 13, 
    pattern: /^\d{13}$/, 
    description: "13 dígitos",
    validate: (ie: string) => {
      if (ie.length !== 13) return false;
      // Validação simplificada
      return /^\d{13}$/.test(ie);
    }
  },
  
  // Espírito Santo
  ES: { 
    minLength: 9, 
    maxLength: 9, 
    pattern: /^\d{9}$/, 
    description: "9 dígitos",
    validate: (ie: string) => {
      if (ie.length !== 9) return false;
      const base = ie.slice(0, 8);
      const dv = parseInt(ie[8]);
      let sum = 0;
      for (let i = 0; i < 8; i++) {
        sum += parseInt(base[i]) * (9 - i);
      }
      const remainder = sum % 11;
      const calculatedDV = remainder < 2 ? 0 : 11 - remainder;
      return calculatedDV === dv;
    }
  },
  
  // Goiás
  GO: { 
    minLength: 9, 
    maxLength: 9, 
    pattern: /^\d{9}$/, 
    description: "9 dígitos",
    validate: (ie: string) => {
      if (ie.length !== 9) return false;
      const base = ie.slice(0, 8);
      const dv = parseInt(ie[8]);
      let sum = 0;
      for (let i = 0; i < 8; i++) {
        sum += parseInt(base[i]) * (9 - i);
      }
      const remainder = sum % 11;
      let calculatedDV = 11 - remainder;
      if (calculatedDV === 11) calculatedDV = 0;
      if (calculatedDV === 10) {
        // Regra especial do GO
        if (base >= "10103105" && base <= "10119997") {
          calculatedDV = 1;
        } else {
          calculatedDV = 0;
        }
      }
      return calculatedDV === dv;
    }
  },
  
  // Maranhão
  MA: { 
    minLength: 9, 
    maxLength: 9, 
    pattern: /^\d{9}$/, 
    description: "9 dígitos",
    validate: (ie: string) => {
      if (ie.length !== 9) return false;
      const base = ie.slice(0, 8);
      const dv = parseInt(ie[8]);
      let sum = 0;
      for (let i = 0; i < 8; i++) {
        sum += parseInt(base[i]) * (9 - i);
      }
      const remainder = sum % 11;
      const calculatedDV = remainder < 2 ? 0 : 11 - remainder;
      return calculatedDV === dv;
    }
  },
  
  // Mato Grosso
  MT: { 
    minLength: 11, 
    maxLength: 11, 
    pattern: /^\d{11}$/, 
    description: "11 dígitos",
    validate: (ie: string) => {
      if (ie.length !== 11) return false;
      // Validação simplificada
      return /^\d{11}$/.test(ie);
    }
  },
  
  // Mato Grosso do Sul
  MS: { 
    minLength: 9, 
    maxLength: 9, 
    pattern: /^\d{9}$/, 
    description: "9 dígitos",
    validate: (ie: string) => {
      if (ie.length !== 9) return false;
      if (!ie.startsWith("28")) return false;
      const base = ie.slice(0, 8);
      const dv = parseInt(ie[8]);
      let sum = 0;
      for (let i = 0; i < 8; i++) {
        sum += parseInt(base[i]) * (9 - i);
      }
      const remainder = sum % 11;
      const calculatedDV = remainder < 2 ? 0 : 11 - remainder;
      return calculatedDV === dv;
    }
  },
  
  // Minas Gerais
  MG: { 
    minLength: 13, 
    maxLength: 13, 
    pattern: /^\d{13}$/, 
    description: "13 dígitos",
    validate: (ie: string) => {
      if (ie.length !== 13) return false;
      // MG tem validação complexa com 2 dígitos verificadores
      const base = ie.slice(0, 11);
      const dv1 = parseInt(ie[11]);
      const dv2 = parseInt(ie[12]);
      
      // Primeiro dígito
      let sum = 0;
      let multiplier = 1;
      for (let i = 0; i < 11; i++) {
        const digit = parseInt(base[i]);
        const product = digit * multiplier;
        sum += Math.floor(product / 10) + (product % 10);
        multiplier = multiplier === 2 ? 1 : 2;
      }
      const remainder1 = sum % 10;
      const calculatedDV1 = remainder1 === 0 ? 0 : 10 - remainder1;
      
      // Segundo dígito
      const baseWithDV1 = base + calculatedDV1;
      sum = 0;
      for (let i = 0; i < 12; i++) {
        sum += parseInt(baseWithDV1[i]) * (i === 0 ? 3 : 12 - i);
      }
      const remainder2 = sum % 11;
      const calculatedDV2 = remainder2 < 2 ? 0 : 11 - remainder2;
      
      return calculatedDV1 === dv1 && calculatedDV2 === dv2;
    }
  },
  
  // Pará
  PA: { 
    minLength: 9, 
    maxLength: 9, 
    pattern: /^\d{9}$/, 
    description: "9 dígitos",
    validate: (ie: string) => {
      if (ie.length !== 9) return false;
      if (!ie.startsWith("15")) return false;
      const base = ie.slice(0, 8);
      const dv = parseInt(ie[8]);
      let sum = 0;
      for (let i = 0; i < 8; i++) {
        sum += parseInt(base[i]) * (9 - i);
      }
      const remainder = sum % 11;
      const calculatedDV = remainder < 2 ? 0 : 11 - remainder;
      return calculatedDV === dv;
    }
  },
  
  // Paraíba
  PB: { 
    minLength: 9, 
    maxLength: 9, 
    pattern: /^\d{9}$/, 
    description: "9 dígitos",
    validate: (ie: string) => {
      if (ie.length !== 9) return false;
      const base = ie.slice(0, 8);
      const dv = parseInt(ie[8]);
      let sum = 0;
      for (let i = 0; i < 8; i++) {
        sum += parseInt(base[i]) * (9 - i);
      }
      const remainder = sum % 11;
      const calculatedDV = remainder < 2 ? 0 : 11 - remainder;
      return calculatedDV === dv;
    }
  },
  
  // Paraná
  PR: { 
    minLength: 10, 
    maxLength: 10, 
    pattern: /^\d{10}$/, 
    description: "10 dígitos",
    validate: (ie: string) => {
      if (ie.length !== 10) return false;
      const base = ie.slice(0, 8);
      const dv1 = parseInt(ie[8]);
      const dv2 = parseInt(ie[9]);
      
      // Primeiro dígito
      let sum = 0;
      for (let i = 0; i < 8; i++) {
        sum += parseInt(base[i]) * (3 + i);
      }
      const remainder1 = sum % 11;
      const calculatedDV1 = remainder1 < 2 ? 0 : 11 - remainder1;
      
      // Segundo dígito
      const baseWithDV1 = base + calculatedDV1;
      sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += parseInt(baseWithDV1[i]) * (4 + i);
      }
      const remainder2 = sum % 11;
      const calculatedDV2 = remainder2 < 2 ? 0 : 11 - remainder2;
      
      return calculatedDV1 === dv1 && calculatedDV2 === dv2;
    }
  },
  
  // Pernambuco
  PE: { 
    minLength: 9, 
    maxLength: 9, 
    pattern: /^\d{9}$/, 
    description: "9 dígitos",
    validate: (ie: string) => {
      if (ie.length !== 9) return false;
      const base = ie.slice(0, 7);
      const dv1 = parseInt(ie[7]);
      const dv2 = parseInt(ie[8]);
      
      // Primeiro dígito
      let sum = 0;
      for (let i = 0; i < 7; i++) {
        sum += parseInt(base[i]) * (8 - i);
      }
      const remainder1 = sum % 11;
      const calculatedDV1 = remainder1 < 2 ? 0 : 11 - remainder1;
      
      // Segundo dígito
      const baseWithDV1 = base + calculatedDV1;
      sum = 0;
      for (let i = 0; i < 8; i++) {
        sum += parseInt(baseWithDV1[i]) * (9 - i);
      }
      const remainder2 = sum % 11;
      const calculatedDV2 = remainder2 < 2 ? 0 : 11 - remainder2;
      
      return calculatedDV1 === dv1 && calculatedDV2 === dv2;
    }
  },
  
  // Piauí
  PI: { 
    minLength: 9, 
    maxLength: 9, 
    pattern: /^\d{9}$/, 
    description: "9 dígitos",
    validate: (ie: string) => {
      if (ie.length !== 9) return false;
      const base = ie.slice(0, 8);
      const dv = parseInt(ie[8]);
      let sum = 0;
      for (let i = 0; i < 8; i++) {
        sum += parseInt(base[i]) * (9 - i);
      }
      const remainder = sum % 11;
      const calculatedDV = remainder < 2 ? 0 : 11 - remainder;
      return calculatedDV === dv;
    }
  },
  
  // Rio de Janeiro
  RJ: { 
    minLength: 8, 
    maxLength: 8, 
    pattern: /^\d{8}$/, 
    description: "8 dígitos",
    validate: (ie: string) => {
      if (ie.length !== 8) return false;
      const base = ie.slice(0, 7);
      const dv = parseInt(ie[7]);
      let sum = 0;
      let multiplier = 2;
      for (let i = 6; i >= 0; i--) {
        sum += parseInt(base[i]) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
      }
      const remainder = sum % 11;
      const calculatedDV = remainder < 2 ? 0 : 11 - remainder;
      return calculatedDV === dv;
    }
  },
  
  // Rio Grande do Norte
  RN: { 
    minLength: 9, 
    maxLength: 10, 
    pattern: /^\d{9,10}$/, 
    description: "9 ou 10 dígitos",
    validate: (ie: string) => {
      if (ie.length !== 9 && ie.length !== 10) return false;
      // Validação simplificada
      return /^\d{9,10}$/.test(ie);
    }
  },
  
  // Rio Grande do Sul
  RS: { 
    minLength: 10, 
    maxLength: 10, 
    pattern: /^\d{10}$/, 
    description: "10 dígitos",
    validate: (ie: string) => {
      if (ie.length !== 10) return false;
      const base = ie.slice(0, 9);
      const dv = parseInt(ie[9]);
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += parseInt(base[i]) * (2 + i);
      }
      const remainder = sum % 11;
      const calculatedDV = remainder < 2 ? 0 : 11 - remainder;
      return calculatedDV === dv;
    }
  },
  
  // Rondônia
  RO: { 
    minLength: 14, 
    maxLength: 14, 
    pattern: /^\d{14}$/, 
    description: "14 dígitos",
    validate: (ie: string) => {
      if (ie.length !== 14) return false;
      // Validação simplificada
      return /^\d{14}$/.test(ie);
    }
  },
  
  // Roraima
  RR: { 
    minLength: 9, 
    maxLength: 9, 
    pattern: /^\d{9}$/, 
    description: "9 dígitos",
    validate: (ie: string) => {
      if (ie.length !== 9) return false;
      if (!ie.startsWith("24")) return false;
      const base = ie.slice(0, 8);
      const dv = parseInt(ie[8]);
      let sum = 0;
      for (let i = 0; i < 8; i++) {
        sum += parseInt(base[i]) * (9 - i);
      }
      const remainder = sum % 11;
      const calculatedDV = remainder < 2 ? 0 : 11 - remainder;
      return calculatedDV === dv;
    }
  },
  
  // Santa Catarina
  SC: { 
    minLength: 9, 
    maxLength: 9, 
    pattern: /^\d{9}$/, 
    description: "9 dígitos",
    validate: (ie: string) => {
      if (ie.length !== 9) return false;
      const base = ie.slice(0, 8);
      const dv = parseInt(ie[8]);
      let sum = 0;
      for (let i = 0; i < 8; i++) {
        sum += parseInt(base[i]) * (9 - i);
      }
      const remainder = sum % 11;
      const calculatedDV = remainder < 2 ? 0 : 11 - remainder;
      return calculatedDV === dv;
    }
  },
  
  // São Paulo
  SP: { 
    minLength: 12, 
    maxLength: 12, 
    pattern: /^\d{12}$/, 
    description: "12 dígitos",
    validate: (ie: string) => {
      if (ie.length !== 12) return false;
      const base = ie.slice(0, 8);
      const dv1 = parseInt(ie[8]);
      const dv2 = parseInt(ie[9]);
      const resto = ie.slice(10, 12);
      
      // Primeiro dígito
      let sum = 0;
      let multiplier = 1;
      for (let i = 0; i < 8; i++) {
        const product = parseInt(base[i]) * multiplier;
        multiplier = multiplier === 2 ? 1 : 2;
        sum += Math.floor(product / 10) + (product % 10);
      }
      const remainder1 = sum % 10;
      const calculatedDV1 = remainder1 === 0 ? 0 : 10 - remainder1;
      
      // Segundo dígito
      const baseWithDV1 = base + calculatedDV1;
      sum = 0;
      multiplier = 3;
      for (let i = 0; i < 9; i++) {
        const product = parseInt(baseWithDV1[i]) * multiplier;
        multiplier = multiplier === 10 ? 1 : multiplier + 1;
        sum += Math.floor(product / 10) + (product % 10);
      }
      const remainder2 = sum % 10;
      const calculatedDV2 = remainder2 === 0 ? 0 : 10 - remainder2;
      
      return calculatedDV1 === dv1 && calculatedDV2 === dv2;
    }
  },
  
  // Sergipe
  SE: { 
    minLength: 9, 
    maxLength: 9, 
    pattern: /^\d{9}$/, 
    description: "9 dígitos",
    validate: (ie: string) => {
      if (ie.length !== 9) return false;
      const base = ie.slice(0, 8);
      const dv = parseInt(ie[8]);
      let sum = 0;
      for (let i = 0; i < 8; i++) {
        sum += parseInt(base[i]) * (9 - i);
      }
      const remainder = sum % 11;
      const calculatedDV = remainder < 2 ? 0 : 11 - remainder;
      return calculatedDV === dv;
    }
  },
  
  // Tocantins
  TO: { 
    minLength: 11, 
    maxLength: 11, 
    pattern: /^\d{11}$/, 
    description: "11 dígitos",
    validate: (ie: string) => {
      if (ie.length !== 11) return false;
      if (!ie.startsWith("29")) return false;
      // Validação simplificada
      return /^29\d{9}$/.test(ie);
    }
  },
};

/**
 * Valida Inscrição Estadual baseado no estado
 * @param ie - Número da IE (com ou sem formatação)
 * @param estado - UF do estado (opcional, se não informado valida formato genérico)
 * @returns true se válido, false caso contrário
 */
export function validateIE(ie: string, estado?: EstadoUF): boolean {
  if (!ie || !ie.trim()) {
    return false;
  }

  // Remove formatação
  const cleaned = ie.replace(/\D/g, "");

  // Aceita "ISENTO" como válido
  if (ie.toUpperCase().trim() === "ISENTO") {
    return true;
  }

  // Se não tem estado, valida formato genérico (8 a 14 dígitos)
  if (!estado) {
    return cleaned.length >= 8 && cleaned.length <= 14;
  }

  // Busca regra do estado
  const rule = IE_RULES[estado];
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

  // Valida dígito verificador se existir função de validação
  if (rule.validate && !rule.validate(cleaned)) {
    return false;
  }

  return true;
}

/**
 * Formata IE baseado no estado
 * @param ie - Número da IE
 * @param estado - UF do estado
 * @returns IE formatado
 */
export function formatIE(ie: string, estado?: EstadoUF): string {
  const cleaned = ie.replace(/\D/g, "");
  
  if (!estado) {
    // Formato genérico: XX.XXX.XXX-XX
    if (cleaned.length === 12) {
      return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    if (cleaned.length === 9) {
      return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, "$1.$2.$3-$4");
    }
    return cleaned;
  }

  // Formato específico por estado
  switch (estado) {
    case "SP":
      // SP: XXX.XXX.XXX.XXX
      if (cleaned.length === 12) {
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, "$1.$2.$3.$4");
      }
      break;
    
    case "RJ":
      // RJ: XX.XXX.XXX-X
      if (cleaned.length === 8) {
        return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, "$1.$2.$3-$4");
      }
      break;
    
    case "MG":
      // MG: XXX.XXX.XXX/XXXX
      if (cleaned.length === 13) {
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{4})/, "$1.$2.$3/$4");
      }
      break;
    
    default:
      // Formato genérico para outros estados
      if (cleaned.length === 9) {
        return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, "$1.$2.$3-$4");
      }
      if (cleaned.length === 10) {
        return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
      }
  }

  return cleaned;
}

/**
 * Retorna a descrição do formato de IE para um estado
 */
export function getIEFormatDescription(estado: EstadoUF): string {
  const rule = IE_RULES[estado];
  return rule ? rule.description : "Formato variável";
}

/**
 * Retorna lista de estados válidos
 */
export function getValidEstados(): EstadoUF[] {
  return Object.keys(IE_RULES) as EstadoUF[];
}


