/**
 * Validadores para dados de empresa
 */

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

  if (cleaned.length === 0) {
    return "";
  }

  if (cleaned.length <= 2) {
    return cleaned;
  }

  if (cleaned.length <= 5) {
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`;
  }

  if (cleaned.length <= 8) {
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5)}`;
  }

  if (cleaned.length <= 12) {
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8)}`;
  }

  return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12, 14)}`;
}

/**
 * Valida e-mail usando regex simples
 * Formato: user@domain.extension
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida CEP brasileiro (5 dígitos + 3 dígitos)
 * Aceita formato: "12345-678" ou "12345678"
 */
export function validateCep(cep: string): boolean {
  const cleaned = cep.replace(/\D/g, "");
  return cleaned.length === 8;
}

/**
 * Formata CEP para "12345-678"
 */
export function formatCep(cep: string): string {
  const cleaned = cep.replace(/\D/g, "");

  if (cleaned.length === 0) {
    return "";
  }

  if (cleaned.length <= 5) {
    return cleaned;
  }

  return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
}

/**
 * Valida telefone brasileiro
 * Aceita formatos: (11) 98765-4321, (11) 3456-7890, 11987654321, 1134567890
 */
export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  // Deve ter 10 ou 11 dígitos
  return cleaned.length === 10 || cleaned.length === 11;
}

/**
 * Formata telefone para (11) 98765-4321 ou (11) 3456-7890
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.length === 0) {
    return "";
  }

  if (cleaned.length <= 2) {
    return `(${cleaned}`;
  }

  if (cleaned.length <= 7) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  }

  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
}
