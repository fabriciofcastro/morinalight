import { useState, useCallback } from "react";
import { buscarEnderecoPorCep, validarCep, type EnderecoViaCep } from "@/shared/kernel/utils/viacep";

export function useViaCep() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [endereco, setEndereco] = useState<EnderecoViaCep | null>(null);

  const buscar = useCallback(async (cep: string) => {
    // Validar CEP
    if (!validarCep(cep)) {
      setError("CEP inválido. Deve ter 8 dígitos.");
      setEndereco(null);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const resultado = await buscarEnderecoPorCep(cep);
      setEndereco(resultado);
      
      if (!resultado) {
        setError("CEP não encontrado");
      }
      
      return resultado;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao buscar CEP";
      setError(errorMessage);
      setEndereco(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const limpar = useCallback(() => {
    setEndereco(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    endereco,
    loading,
    error,
    buscar,
    limpar,
    validarCep,
  };
}





