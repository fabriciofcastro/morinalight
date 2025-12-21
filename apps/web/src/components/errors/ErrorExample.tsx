/**
 * Exemplo de Uso do Sistema de Erros Amigáveis
 * 
 * Este componente demonstra como usar o sistema de erros
 * de forma amigável para o usuário.
 */

"use client";

import React, { useState } from "react";
import { ErrorDisplay, SuccessDisplay } from "./ErrorDisplay";
import { useErrorHandler, useAsyncError } from "@/lib/errors";
import { Button } from "@morina/ui";
import { apiClient } from "@/lib/api/base";

/**
 * Exemplo 1: Uso básico com ErrorDisplay
 */
export function ErrorExampleBasic() {
  const [error, setError] = useState<unknown>(null);

  const handleAction = async () => {
    try {
      // Simular uma chamada que pode falhar
      await apiClient.get("/api/test-endpoint");
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="space-y-4">
      <Button onClick={handleAction}>Testar Erro</Button>
      
      {error && (
        <ErrorDisplay
          error={error}
          onRetry={handleAction}
          variant="card"
        />
      )}
    </div>
  );
}

/**
 * Exemplo 2: Uso com useErrorHandler (notificações automáticas)
 */
export function ErrorExampleWithHandler() {
  const { handleError } = useErrorHandler({
    showNotification: true, // Notificações amigáveis automáticas
  });

  const handleSubmit = async () => {
    try {
      await apiClient.post("/api/users", { name: "" });
    } catch (error) {
      // Notificação amigável aparece automaticamente
      handleError(error);
    }
  };

  return (
    <Button onClick={handleSubmit}>
      Enviar (com tratamento de erro)
    </Button>
  );
}

/**
 * Exemplo 3: Uso com useAsyncError (retry automático)
 */
export function ErrorExampleWithRetry() {
  const { execute, error, loading, retry } = useAsyncError(
    async () => {
      const data = await apiClient.get("/api/data");
      return data;
    },
    {
      autoRetry: true, // Retry automático para erros recuperáveis
      maxRetries: 3,
      showNotification: true,
    }
  );

  return (
    <div className="space-y-4">
      <Button onClick={execute} disabled={loading}>
        {loading ? "Carregando..." : "Carregar Dados"}
      </Button>

      {error && (
        <ErrorDisplay
          error={error}
          onRetry={retry}
          variant="inline"
        />
      )}
    </div>
  );
}

/**
 * Exemplo 4: Erro de validação com campos
 */
export function ErrorExampleValidation() {
  const [error, setError] = useState<unknown>(null);

  const handleValidation = async () => {
    try {
      // Simular erro de validação com campos
      throw {
        response: {
          status: 400,
          data: {
            error: {
              code: "VALIDATION_ERROR",
              message: "Validation failed",
              fields: [
                { field: "email", message: "Email inválido" },
                { field: "senha", message: "Senha deve ter pelo menos 8 caracteres" },
              ],
            },
          },
        },
      };
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="space-y-4">
      <Button onClick={handleValidation}>
        Testar Validação
      </Button>

      {error && (
        <ErrorDisplay
          error={error}
          variant="card"
          showDetails={false}
        />
      )}
    </div>
  );
}

/**
 * Exemplo 5: Sucesso após erro
 */
export function ErrorExampleSuccess() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const handleAction = async () => {
    try {
      await apiClient.post("/api/action");
      setSuccess(true);
      setError(null);
    } catch (err) {
      setError(err);
      setSuccess(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button onClick={handleAction}>
        Executar Ação
      </Button>

      {success && (
        <SuccessDisplay
          title="Sucesso!"
          message="Ação executada com sucesso."
          onClose={() => setSuccess(false)}
        />
      )}

      {error && (
        <ErrorDisplay
          error={error}
          onRetry={handleAction}
          variant="inline"
        />
      )}
    </div>
  );
}





