/**
 * Formata um valor numérico como moeda brasileira
 */
export function formatCurrency(value: number | string): string {
  const numValue = typeof value === "string" ? parseFloat(value.replace(/[^\d,]/g, "").replace(",", ".")) : value;
  if (Number.isNaN(numValue)) return "R$ 0,00";
  
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numValue);
}

/**
 * Remove formatação de moeda e retorna número
 */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^\d,]/g, "").replace(",", ".");
  const parsed = parseFloat(cleaned);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * Aplica máscara de moeda enquanto o usuário digita
 */
export function applyCurrencyMask(value: string): string {
  // Remove tudo que não é dígito
  const digits = value.replace(/\D/g, "");
  
  if (!digits) return "";
  
  // Converte para número e divide por 100 para ter centavos
  const number = parseInt(digits, 10) / 100;
  
  // Formata como moeda
  return formatCurrency(number);
}

/**
 * Aplica máscara de porcentagem
 */
export function applyPercentageMask(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  
  const number = parseFloat(digits) / 100;
  return `${number.toFixed(2)}%`;
}

/**
 * Remove máscara de porcentagem
 */
export function parsePercentage(value: string): number {
  const cleaned = value.replace(/\D/g, "");
  const parsed = parseFloat(cleaned) / 100;
  return Number.isNaN(parsed) ? 0 : parsed;
}









