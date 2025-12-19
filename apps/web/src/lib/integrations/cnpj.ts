/**
 * Serviço de integração com BrasilAPI para busca de CNPJ
 * https://brasilapi.com.br/
 */

export type CnpjBrasilApiResponse = {
  cnpj: string;
  identificador_matriz_filial: number;
  descricao_matriz_filial: string;
  razao_social: string;
  nome_fantasia: string | null;
  situacao_cadastral: number;
  descricao_situacao_cadastral: string;
  data_situacao_cadastral: string;
  motivo_situacao_cadastral: number;
  nome_cidade_exterior: string | null;
  codigo_natureza_juridica: number;
  data_inicio_atividade: string;
  cnae_fiscal_principal: {
    codigo: string;
    descricao: string;
  };
  cnae_fiscal_secundaria: Array<{
    codigo: string;
    descricao: string;
  }>;
  tipo_logradouro: string;
  logradouro: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cep: string;
  uf: string;
  codigo_municipio: number;
  municipio: string;
  ddd_telefone_1: string | null;
  ddd_telefone_2: string | null;
  ddd_fax: string | null;
  qualificacao_do_responsavel: number;
  capital_social: number;
  porte: string;
  descricao_porte: string;
  opcao_pelo_simples: boolean;
  data_opcao_pelo_simples: string | null;
  data_exclusao_do_simples: string | null;
  opcao_pelo_mei: boolean;
  situacao_especial: string | null;
  data_situacao_especial: string | null;
  qsa: Array<{
    identificador_de_socio: number;
    nome_socio: string;
    cnpj_cpf_do_socio: string;
    qualificacao_socio: number;
    data_entrada_sociedade: string;
    pais: string | null;
    representante_legal: string;
    nome_representante_legal: string | null;
    qualificacao_representante_legal: number;
    faixa_etaria: number;
  }>;
};

export type CnpjData = {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  situacaoCadastral: string;
  dataInicioAtividade: string;
  cnaePrincipal: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento: string | null;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  telefone: string | null;
  email: string | null;
  capitalSocial: number;
  porte: string;
};

/**
 * Busca dados de CNPJ usando BrasilAPI
 * @param cnpj - CNPJ com ou sem formatação (aceita 00.000.000/0000-00 ou 00000000000000)
 * @returns Dados do CNPJ encontrado ou null se não encontrado
 */
export async function buscarCnpj(cnpj: string): Promise<CnpjData | null> {
  // Remover formatação
  const cnpjLimpo = cnpj.replace(/\D/g, "");

  // Validar CNPJ
  if (cnpjLimpo.length !== 14) {
    throw new Error("CNPJ deve ter 14 dígitos");
  }

  try {
    // Usar API route do Next.js para cache e proxy
    const response = await fetch(`/api/integrations/cnpj?cnpj=${cnpjLimpo}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "force-cache", // Cache por 1 dia
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro ao buscar CNPJ" }));
      throw new Error(error.message || "CNPJ não encontrado");
    }

    const data: CnpjBrasilApiResponse = await response.json();

    return {
      cnpj: cnpjLimpo,
      razaoSocial: data.razao_social || "",
      nomeFantasia: data.nome_fantasia || null,
      situacaoCadastral: data.descricao_situacao_cadastral || "",
      dataInicioAtividade: data.data_inicio_atividade || "",
      cnaePrincipal: data.cnae_fiscal_principal?.descricao || "",
      endereco: {
        logradouro: data.logradouro || "",
        numero: data.numero || "",
        complemento: data.complemento || null,
        bairro: data.bairro || "",
        cidade: data.municipio || "",
        estado: data.uf || "",
        cep: data.cep || "",
      },
      telefone: data.ddd_telefone_1 || null,
      email: null, // BrasilAPI não fornece email
      capitalSocial: data.capital_social || 0,
      porte: data.descricao_porte || "",
    };
  } catch (error) {
    console.error("Erro ao buscar CNPJ:", error);
    throw error;
  }
}

/**
 * Valida CNPJ usando algoritmo de dígitos verificadores (módulo 11)
 * Aceita formato: "00.000.000/0000-00" ou "00000000000000"
 */
export function validarCnpj(cnpj: string): boolean {
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
    sum += parseInt(cleaned[i]) * multiplier;
    multiplier = multiplier === 2 ? 9 : multiplier - 1;
  }

  let remainder = sum % 11;
  const firstDigit = remainder < 2 ? 0 : 11 - remainder;

  if (parseInt(cleaned[12]) !== firstDigit) {
    return false;
  }

  // Calcular segundo dígito verificador
  sum = 0;
  multiplier = 6;

  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned[i]) * multiplier;
    multiplier = multiplier === 2 ? 9 : multiplier - 1;
  }

  remainder = sum % 11;
  const secondDigit = remainder < 2 ? 0 : 11 - remainder;

  if (parseInt(cleaned[13]) !== secondDigit) {
    return false;
  }

  return true;
}

/**
 * Formata CNPJ
 */
export function formatarCnpj(cnpj: string): string {
  const cnpjLimpo = cnpj.replace(/\D/g, "");
  if (cnpjLimpo.length !== 14) return cnpj;
  return cnpjLimpo.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}




