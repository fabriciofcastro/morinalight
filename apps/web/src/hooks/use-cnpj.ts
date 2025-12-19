import { useState, useCallback } from "react";
import { buscarCnpj, type CnpjData, validarCnpj } from "@/lib/integrations/cnpj";
import { notificationCenter } from "@/components/notifications/notification-center";

/**
 * Hook para busca de CNPJ usando BrasilAPI
 */
export function useCnpj() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CnpjData | null>(null);

  const buscar = useCallback(async (cnpj: string): Promise<CnpjData | null> => {
    if (!validarCnpj(cnpj)) {
      const errorMsg = "CNPJ inválido. Deve ter 14 dígitos.";
      setError(errorMsg);
      notificationCenter.add({
        type: "error",
        title: "CNPJ inválido",
        message: errorMsg,
      });
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const resultado = await buscarCnpj(cnpj);
      if (resultado) {
        setData(resultado);
        notificationCenter.add({
          type: "success",
          title: "CNPJ encontrado",
          message: "Dados do CNPJ carregados com sucesso.",
        });
      } else {
        setError("CNPJ não encontrado");
        notificationCenter.add({
          type: "error",
          title: "CNPJ não encontrado",
          message: "Não foi possível encontrar dados para este CNPJ.",
        });
      }
      return resultado;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao buscar CNPJ";
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

  const limpar = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    buscar,
    limpar,
  };
}




