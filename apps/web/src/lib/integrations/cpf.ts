/**
 * Serviço de integração para busca e validação de CPF
 */

export type CpfData = {
  cpf: string;
  nome?: string;
  dataNascimento?: string;
  situacaoCadastral?: string;
};

/**
 * Valida CPF usando algoritmo de dígitos verificadores (módulo 11)
 * Aceita formato: "000.000.000-00" ou "00000000000"
 */
export function validarCpf(cpf: string): boolean {
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
    sum += parseInt(cleaned[i]) * (10 - i);
  }

  let remainder = sum % 11;
  const firstDigit = remainder < 2 ? 0 : 11 - remainder;

  if (parseInt(cleaned[9]) !== firstDigit) {
    return false;
  }

  // Calcular segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i);
  }

  remainder = sum % 11;
  const secondDigit = remainder < 2 ? 0 : 11 - remainder;

  if (parseInt(cleaned[10]) !== secondDigit) {
    return false;
  }

  return true;
}

/**
 * Formata CPF para "000.000.000-00"
 */
export function formatarCpf(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length !== 11) return cpf;
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

/**
 * Busca dados de CPF (validação básica)
 * Nota: APIs públicas de CPF são limitadas devido a LGPD
 * Esta função apenas valida o formato e dígitos verificadores
 */
export async function buscarCpf(cpf: string): Promise<CpfData | null> {
  // Remover formatação
  const cpfLimpo = cpf.replace(/\D/g, "");

  // Validar CPF
  if (!validarCpf(cpfLimpo)) {
    throw new Error("CPF inválido");
  }

  // Como não há API pública gratuita para buscar dados de CPF (devido a LGPD),
  // retornamos apenas o CPF validado
  // Em produção, pode integrar com serviços pagos se necessário

  return {
    cpf: cpfLimpo,
  };
}

