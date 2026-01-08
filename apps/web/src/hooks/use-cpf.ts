import { useState, useCallback } from "react";
import { buscarCpf, type CpfData, validarCpf } from "@/lib/integrations/cpf";
import { notificationCenter } from "@/shared/ui/notification-center";

/**
 * Hook para validação e busca de CPF
 * Nota: Devido à LGPD, APIs públicas não fornecem dados completos de CPF
 */
export function useCpf() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CpfData | null>(null);

  const buscar = useCallback(async (cpf: string): Promise<CpfData | null> => {
    if (!validarCpf(cpf)) {
      const errorMsg = "CPF inválido. Deve ter 11 dígitos e dígitos verificadores corretos.";
      setError(errorMsg);
      notificationCenter.add({
        type: "error",
        title: "CPF inválido",
        message: errorMsg,
      });
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const resultado = await buscarCpf(cpf);
      if (resultado) {
        setData(resultado);
        notificationCenter.add({
          type: "success",
          title: "CPF válido",
          message: "CPF validado com sucesso.",
        });
      } else {
        setError("CPF não encontrado");
        notificationCenter.add({
          type: "error",
          title: "CPF não encontrado",
          message: "Não foi possível validar este CPF.",
        });
      }
      return resultado;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao validar CPF";
      setError(errorMessage);
      notificationCenter.add({
        type: "error",
        title: "Erro",
        message: errorMessage,
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const validar = useCallback((cpf: string): boolean => {
    const isValid = validarCpf(cpf);
    if (!isValid) {
      setError("CPF inválido");
    } else {
      setError(null);
    }
    return isValid;
  }, []);

  const limpar = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    buscar,
    validar,
    limpar,
  };
}

