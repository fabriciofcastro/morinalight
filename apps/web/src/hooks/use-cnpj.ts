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
      let errorMessage = "Erro ao buscar CNPJ";
      let errorTitle = "Erro";
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Mensagens mais amigáveis baseadas no tipo de erro
        if (err.message.includes("Acesso negado") || err.message.includes("bloqueando")) {
          errorTitle = "Acesso Negado";
          errorMessage = "O serviço de consulta de CNPJ está bloqueando requisições no momento. Por favor, preencha os dados do fornecedor manualmente ou tente novamente mais tarde.";
        } else if (err.message.includes("indisponível") || err.message.includes("temporariamente")) {
          errorTitle = "Serviço Indisponível";
          errorMessage = "O serviço de consulta de CNPJ está temporariamente indisponível. Por favor, tente novamente em alguns instantes ou preencha os dados manualmente.";
        } else if (err.message.includes("não encontrado")) {
          errorTitle = "CNPJ não encontrado";
          errorMessage = "Não foi possível encontrar dados para este CNPJ. Verifique se o CNPJ está correto ou preencha os dados manualmente.";
        } else if (err.message.includes("conexão") || err.message.includes("network")) {
          errorTitle = "Erro de Conexão";
          errorMessage = "Não foi possível conectar ao serviço. Verifique sua conexão com a internet e tente novamente.";
        } else if (err.message.includes("Muitas requisições") || err.message.includes("rate limit")) {
          errorTitle = "Muitas Requisições";
          errorMessage = "Você fez muitas requisições. Aguarde alguns instantes antes de tentar novamente.";
        }
      }
      
      setError(errorMessage);
      notificationCenter.add({
        type: "error",
        title: errorTitle,
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




