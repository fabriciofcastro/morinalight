/**
 * Exemplos Práticos de Uso de Erros Elegantes com Tooltips
 * 
 * Demonstra como usar os componentes de erro elegantes em diferentes cenários.
 */

"use client";

import React, { useState } from "react";
import {
  ErrorTooltip,
  FieldErrorTooltip,
  InputWithError,
  TextareaWithError,
  ErrorBadge,
  InlineErrorIndicator,
  ElegantErrorNotification,
  ElegantErrorToast,
} from "./index";
import { Button } from "@morina/ui";

/**
 * Exemplo 1: Formulário com Erros Elegantes
 */
export function ElegantFormExample() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Mensagem é obrigatória";
    } else if (formData.message.length < 10) {
      newErrors.message = "Mensagem deve ter pelo menos 10 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      alert("Formulário válido!");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <InputWithError
        label="Nome"
        error={errors.name}
        fieldName="nome"
        required
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        onBlur={validate}
      />

      <InputWithError
        label="Email"
        error={errors.email}
        fieldName="email"
        type="email"
        required
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        onBlur={validate}
      />

      <TextareaWithError
        label="Mensagem"
        error={errors.message}
        fieldName="mensagem"
        required
        rows={4}
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        onBlur={validate}
      />

      <Button type="submit">Enviar</Button>
    </form>
  );
}

/**
 * Exemplo 2: Botão com Tooltip de Erro
 */
export function ButtonWithErrorTooltipExample() {
  const [error, setError] = useState<unknown>(null);

  const handleAction = async () => {
    try {
      // Simular erro
      throw new Error("Não foi possível processar a solicitação");
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="space-y-4">
      <ErrorTooltip error={error} side="top">
        <Button onClick={handleAction}>
          Processar Solicitação
        </Button>
      </ErrorTooltip>

      {!!error && (
        <ErrorBadge error={error} variant="subtle" showTooltip />
      )}
    </div>
  );
}

/**
 * Exemplo 3: Card com Indicador de Erro
 */
export function CardWithErrorIndicatorExample() {
  const [error, setError] = useState<unknown>(null);

  return (
    <div className="relative inline-block">
      <div className="rounded-lg border border-white/20 bg-white/5 p-4">
        <h3 className="font-semibold text-white">Produto</h3>
        <p className="text-sm text-white/70">Descrição do produto...</p>
      </div>
      {!!error && (
        <InlineErrorIndicator
          error={error}
          position="top-right"
          size="sm"
        />
      )}
      <Button
        size="sm"
        onClick={() => setError(new Error("Erro ao carregar produto"))}
        className="mt-2"
      >
        Simular Erro
      </Button>
    </div>
  );
}

/**
 * Exemplo 4: Notificações Elegantes
 */
export function ElegantNotificationsExample() {
  const [error, setError] = useState<unknown>(null);
  const [toastError, setToastError] = useState<unknown>(null);

  const triggerError = () => {
    setError({
      response: {
        status: 400,
        data: {
          error: {
            code: "VALIDATION_ERROR",
            message: "Dados inválidos",
            fields: [
              { field: "email", message: "Email inválido" },
              { field: "senha", message: "Senha muito curta" },
            ],
          },
        },
      },
    });
  };

  const triggerToast = () => {
    setToastError(new Error("Operação concluída com avisos"));
    setTimeout(() => setToastError(null), 5000);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={triggerError}>
          Mostrar Notificação Compacta
        </Button>
        <Button onClick={triggerToast}>
          Mostrar Toast
        </Button>
      </div>

      {!!error && (
        <ElegantErrorNotification
          error={error}
          variant="compact"
          position="top-right"
          onDismiss={() => setError(null)}
        />
      )}

      {!!toastError && (
        <ElegantErrorToast
          error={toastError}
          duration={5000}
          onDismiss={() => setToastError(null)}
        />
      )}
    </div>
  );
}

/**
 * Exemplo 5: Campo Customizado com Tooltip
 */
export function CustomFieldWithTooltipExample() {
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white">
        Campo Customizado
      </label>
      <FieldErrorTooltip error={error} fieldName="campo customizado">
        <div className="relative">
          <input
            type="text"
            className="w-full rounded-md border border-white/20 bg-white/5 px-3 py-2 text-white"
            onBlur={(e) => {
              if (!e.target.value.trim()) {
                setError("Este campo é obrigatório");
              } else {
                setError(null);
              }
            }}
          />
        </div>
      </FieldErrorTooltip>
    </div>
  );
}

/**
 * Exemplo 6: Múltiplos Erros com Badges
 */
export function MultipleErrorsExample() {
  const errors = [
    new Error("Erro de validação"),
    new Error("Erro de conexão"),
    new Error("Erro de permissão"),
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {errors.map((error, index) => (
        <ErrorBadge
          key={index}
          error={error}
          variant={index % 2 === 0 ? "subtle" : "prominent"}
          showTooltip
        />
      ))}
    </div>
  );
}









