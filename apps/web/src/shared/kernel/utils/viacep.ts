/**
 * Serviço de integração com ViaCEP
 * https://viacep.com.br/
 */

export type ViaCepResponse = {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
};

export type EnderecoViaCep = {
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
  complemento?: string;
};

/**
 * Busca endereço por CEP usando ViaCEP
 * @param cep - CEP com ou sem formatação (aceita 00000-000 ou 00000000)
 * @returns Endereço encontrado ou null se não encontrado
 */
export async function buscarEnderecoPorCep(cep: string): Promise<EnderecoViaCep | null> {
  // Remover formatação
  const cepLimpo = cep.replace(/\D/g, "");

  // Validar CEP
  if (cepLimpo.length !== 8) {
    throw new Error("CEP deve ter 8 dígitos");
  }

  try {
    // Usar API route do Next.js para cache e proxy
    const response = await fetch(`/api/integrations/viacep?cep=${cepLimpo}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "force-cache", // Cache por 1 dia
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro ao buscar CEP" }));
      throw new Error(error.message || "CEP não encontrado");
    }

    const data = await response.json();

    if (data.erro) {
      return null;
    }

    return {
      cep: data.cep || cepLimpo,
      logradouro: data.logradouro || "",
      bairro: data.bairro || "",
      cidade: data.localidade || "",
      estado: data.uf || "",
      complemento: data.complemento || undefined,
    };
  } catch (error) {
    console.error("Erro ao buscar CEP:", error);
    throw error;
  }
}

/**
 * Valida formato de CEP
 */
export function validarCep(cep: string): boolean {
  const cepLimpo = cep.replace(/\D/g, "");
  return cepLimpo.length === 8;
}

/**
 * Formata CEP
 */
export function formatarCep(cep: string): string {
  const cepLimpo = cep.replace(/\D/g, "");
  if (cepLimpo.length !== 8) return cep;
  return cepLimpo.replace(/^(\d{5})(\d{3})$/, "$1-$2");
}




