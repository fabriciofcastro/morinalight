/**
 * Validadores brasileiros completos
 * CPF, CNPJ, CEP, Telefone, etc.
 */

/**
 * Valida CPF usando módulo 11
 * Aceita formato: "000.000.000-00" ou "00000000000"
 */
export function validateCpf(cpf: string): boolean {
  // Remover formatação
  const cleaned = cpf.replace(/\D/g, "");

  // Verificar comprimento
  if (cleaned.length !== 11) {
    return false;
  }

  // Verificar se todos os dígitos são iguais (CPF inválido)
  if (/^(\d)\1{10}$/.test(cleaned)) {
    return false;
  }

  // Calcular primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]!) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned[9]!)) {
    return false;
  }

  // Calcular segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]!) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned[10]!)) {
    return false;
  }

  return true;
}

/**
 * Formata CPF para "000.000.000-00"
 */
export function formatCpf(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length !== 11) return cpf;
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

/**
 * Valida CNPJ usando módulo 11
 * Aceita formato: "00.000.000/0000-00" ou "00000000000000"
 */
export function validateCnpj(cnpj: string): boolean {
  // Remover formatação
  const cleaned = cnpj.replace(/\D/g, "");

  // Verificar comprimento
  if (cleaned.length !== 14) {
    return false;
  }

  // Verificar se todos os dígitos são iguais (CNPJ inválido)
  if (/^(\d)\1{13}$/.test(cleaned)) {
    return false;
  }

  // Calcular primeiro dígito verificador
  let sum = 0;
  let multiplier = 5;

  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned[i]!) * multiplier;
    multiplier = multiplier === 2 ? 9 : multiplier - 1;
  }

  let remainder = sum % 11;
  const firstDigit = remainder < 2 ? 0 : 11 - remainder;

  if (parseInt(cleaned[12]!) !== firstDigit) {
    return false;
  }

  // Calcular segundo dígito verificador
  sum = 0;
  multiplier = 6;

  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned[i]!) * multiplier;
    multiplier = multiplier === 2 ? 9 : multiplier - 1;
  }

  remainder = sum % 11;
  const secondDigit = remainder < 2 ? 0 : 11 - remainder;

  if (parseInt(cleaned[13]!) !== secondDigit) {
    return false;
  }

  return true;
}

/**
 * Formata CNPJ para "00.000.000/0000-00"
 */
export function formatCnpj(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, "");
  if (cleaned.length !== 14) return cnpj;
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

/**
 * Valida CEP (formato brasileiro)
 * Aceita: "00000-000" ou "00000000"
 */
export function validateCep(cep: string): boolean {
  const cleaned = cep.replace(/\D/g, "");
  return cleaned.length === 8 && /^[0-9]{8}$/.test(cleaned);
}

/**
 * Formata CEP para "00000-000"
 */
export function formatCep(cep: string): string {
  const cleaned = cep.replace(/\D/g, "");
  if (cleaned.length !== 8) return cep;
  return cleaned.replace(/(\d{5})(\d{3})/, "$1-$2");
}

/**
 * Valida telefone brasileiro
 * Aceita: (00) 0000-0000, (00) 00000-0000, 00 0000-0000, etc.
 */
export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  // Telefone fixo: 10 dígitos (DDD + número)
  // Celular: 11 dígitos (DDD + número com 9)
  return cleaned.length === 10 || cleaned.length === 11;
}

/**
 * Formata telefone para "(00) 00000-0000" ou "(00) 0000-0000"
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  return phone;
}

/**
 * Valida email com verificação de domínio
 */
export function validateEmail(email: string, checkDomain = false): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return false;
  }

  if (checkDomain) {
    const domain = email.split("@")[1]!;
    // Verificar se o domínio tem pelo menos um ponto
    if (!domain || !domain.includes(".")) {
      return false;
    }
    // Verificar se não é um domínio inválido comum
    const invalidDomains = ["test.com", "example.com", "invalid.com"];
    if (invalidDomains.includes(domain.toLowerCase())) {
      return false;
    }
  }

  return true;
}

/**
 * Valida data brasileira (DD/MM/YYYY)
 */
export function validateDate(dateStr: string): boolean {
  // DD/MM/YYYY format
  const dateRegexBR = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  // YYYY-MM-DD format (ISO)
  const dateRegexISO = /^(\d{4})-(\d{2})-(\d{2})$/;

  let day, month, year;

  const matchBR = dateStr.match(dateRegexBR);
  const matchISO = dateStr.match(dateRegexISO);

  if (matchBR) {
    day = parseInt(matchBR[1]!, 10);
    month = parseInt(matchBR[2]!, 10);
    year = parseInt(matchBR[3]!, 10);
  } else if (matchISO) {
    year = parseInt(matchISO[1]!, 10);
    month = parseInt(matchISO[2]!, 10);
    day = parseInt(matchISO[3]!, 10);
  } else {
    return false;
  }

  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const date = new Date(year, month - 1, day);
  return (
    date.getDate() === day &&
    date.getMonth() === month - 1 &&
    date.getFullYear() === year
  );
}

/**
 * Formata data para DD/MM/YYYY
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Valida força de senha
 * Retorna objeto com força (0-4) e mensagens de erro
 */
export function validatePasswordStrength(password: string): {
  strength: number;
  valid: boolean;
  errors: string[];
  requirements: {
    minLength: boolean;
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
} {
  const errors: string[] = [];
  const requirements = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  if (!requirements.minLength) errors.push("Mínimo de 8 caracteres");
  if (!requirements.hasUpperCase) errors.push("Pelo menos uma letra maiúscula");
  if (!requirements.hasLowerCase) errors.push("Pelo menos uma letra minúscula");
  if (!requirements.hasNumber) errors.push("Pelo menos um número");
  if (!requirements.hasSpecialChar) errors.push("Pelo menos um caractere especial");

  const validCount = Object.values(requirements).filter(Boolean).length;
  const strength = validCount;

  return {
    strength,
    valid: errors.length === 0,
    errors,
    requirements,
  };
}


