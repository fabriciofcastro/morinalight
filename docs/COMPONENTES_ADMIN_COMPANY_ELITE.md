# 🚀 Componentes & Implementação - Admin Company Elite

## 1. FieldGroup Component (Agrupamento Inteligente)

```tsx
// src/components/admin/company/CompanyForm/FieldGroup.tsx

import { ReactNode } from "react";
import { AlertCircle, CheckCircle2, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FieldGroupProps {
  title: string;
  description?: string;
  children: ReactNode;
  status?: "complete" | "incomplete" | "error";
  helpText?: string;
  helpUrl?: string;
  className?: string;
}

export function FieldGroup({
  title,
  description,
  children,
  status,
  helpText,
  helpUrl,
  className,
}: FieldGroupProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "complete":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "incomplete":
        return (
          <div className="h-5 w-5 rounded-full border-2 border-yellow-500/50" />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-white/10 bg-white/[0.02] p-4 space-y-3",
        status === "error" && "border-red-500/20 bg-red-500/5",
        status === "incomplete" && "border-yellow-500/20 bg-yellow-500/5",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold text-white">{title}</h4>
            {getStatusIcon()}
          </div>
          {description && (
            <p className="text-xs text-zinc-400 leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {helpText && (
          <div className="group relative cursor-help flex-shrink-0 mt-1">
            <HelpCircle className="h-4 w-4 text-zinc-500 hover:text-zinc-300 transition-colors" />
            <div className="absolute right-0 top-full mt-2 w-48 rounded-lg bg-black/90 p-2 text-xs text-white opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 z-50 shadow-lg border border-white/10">
              {helpText}
              {helpUrl && (
                <a
                  href={helpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-2 text-[hsl(var(--primary))] hover:underline"
                >
                  Saiba mais →
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3">{children}</div>
    </div>
  );
}
```

---

## 2. FormFieldWithValidation Component

```tsx
// src/components/admin/company/CompanyForm/FormFieldWithValidation.tsx

import { ReactNode, useState, useEffect, ChangeEvent } from "react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ValidationRule {
  validate: (value: string) => boolean | Promise<boolean>;
  message: string;
}

interface FormFieldWithValidationProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  rules?: ValidationRule[];
  suggestions?: string[];
  onSuggestionSelect?: (value: string) => void;
  leftIcon?: ReactNode;
  className?: string;
}

export function FormFieldWithValidation({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  rules = [],
  suggestions = [],
  onSuggestionSelect,
  leftIcon,
  className,
}: FormFieldWithValidationProps) {
  const [validationState, setValidationState] = useState<
    "idle" | "validating" | "valid" | "invalid"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Validação com debounce
  useEffect(() => {
    if (!value) {
      setValidationState("idle");
      setErrorMessage("");
      return;
    }

    const validateAsync = async () => {
      setValidationState("validating");

      for (const rule of rules) {
        const isValid = await rule.validate(value);
        if (!isValid) {
          setErrorMessage(rule.message);
          setValidationState("invalid");
          return;
        }
      }

      setValidationState("valid");
      setErrorMessage("");
    };

    const timer = setTimeout(validateAsync, 500);
    return () => clearTimeout(timer);
  }, [value, rules]);

  const getStatusIcon = () => {
    switch (validationState) {
      case "valid":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "invalid":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "validating":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-white/80">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
              {leftIcon}
            </div>
          )}

          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder={placeholder}
            className={cn(
              "w-full rounded-lg border bg-white/5 px-4 py-2.5 text-white placeholder:text-zinc-500 transition-all",
              "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent",
              leftIcon && "pl-10",
              validationState === "valid" &&
                "border-green-500/50 focus:ring-green-500/50 bg-green-500/5",
              validationState === "invalid" &&
                "border-red-500/50 focus:ring-red-500/50 bg-red-500/5",
              validationState === "validating" &&
                "border-blue-500/50 focus:ring-blue-500/50",
              validationState === "idle" &&
                "border-white/10 focus:border-white/20 focus:ring-[hsl(var(--primary))]/50",
            )}
          />

          {getStatusIcon() && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {getStatusIcon()}
            </div>
          )}
        </div>

        {/* Sugestões */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full mt-2 w-full rounded-lg border border-white/10 bg-[#121212] shadow-lg z-50">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  onSuggestionSelect?.(suggestion);
                  setShowSuggestions(false);
                }}
                className="block w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors first:rounded-t-lg last:rounded-b-lg"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mensagem de erro */}
      {validationState === "invalid" && (
        <p className="text-xs text-red-500/80 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {errorMessage}
        </p>
      )}
    </div>
  );
}
```

---

## 3. CnpjLookup Component (Auto-preenchimento Inteligente)

```tsx
// src/components/admin/company/Integrations/CnpjLookup.tsx

import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CnpjData {
  cnpj: string;
  name: string;
  legalName: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  foundedAt?: string;
}

interface CnpjLookupProps {
  onDataFound: (data: CnpjData) => void;
  className?: string;
}

export function CnpjLookup({ onDataFound, className }: CnpjLookupProps) {
  const [cnpj, setCnpj] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatCnpj = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  };

  const handleLookup = async () => {
    if (cnpj.length < 14) {
      setError("CNPJ inválido");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const cleanCnpj = cnpj.replace(/\D/g, "");
      const response = await fetch(
        `https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`,
      );

      if (!response.ok) {
        throw new Error("CNPJ não encontrado");
      }

      const data = await response.json();

      // Transformar dados da API
      const companyData: CnpjData = {
        cnpj: formatCnpj(cleanCnpj),
        name: data.name || "",
        legalName: data.legal_name || "",
        address: {
          street: data.street || "",
          number: data.number || "",
          neighborhood: data.neighborhood || "",
          city: data.city || "",
          state: data.state || "",
          zipCode: data.zip_code || "",
        },
      };

      onDataFound(companyData);
    } catch (err: any) {
      setError(err.message || "Erro ao buscar CNPJ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex gap-2">
        <input
          type="text"
          value={cnpj}
          onChange={(e) => setCnpj(formatCnpj(e.target.value))}
          placeholder="00.000.000/0000-00"
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/50"
        />
        <button
          onClick={handleLookup}
          disabled={loading}
          className={cn(
            "rounded-lg bg-[hsl(var(--primary))] px-4 py-2.5 font-medium text-white transition-all hover:bg-[hsl(var(--primary))]/90 disabled:opacity-50",
            loading && "cursor-not-allowed",
          )}
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Buscar"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
```

---

## 4. QuickSetupWizard Component (Setup Guiado)

```tsx
// src/components/admin/company/CompanyForm/QuickSetupWizard.tsx

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface QuickSetupWizardProps {
  steps: WizardStep[];
  onStepChange: (stepId: string) => void;
  currentStep: string;
  completedSteps: string[];
  className?: string;
}

export function QuickSetupWizard({
  steps,
  onStepChange,
  currentStep,
  completedSteps,
  className,
}: QuickSetupWizardProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="text-xs font-semibold text-white/60 uppercase tracking-wider px-4">
        Setup Guiado
      </div>

      <div className="space-y-2">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = completedSteps.includes(step.id);

          return (
            <motion.button
              key={step.id}
              onClick={() => onStepChange(step.id)}
              className={cn(
                "w-full text-left rounded-lg border p-3 transition-all",
                isActive
                  ? "border-[hsl(var(--primary))]/50 bg-[hsl(var(--primary))]/10 shadow-lg"
                  : "border-white/10 hover:border-white/20 hover:bg-white/5",
                isCompleted && "border-green-500/30 bg-green-500/10",
              )}
              whileHover={{ x: 4 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <div
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold flex-shrink-0",
                        isActive
                          ? "bg-[hsl(var(--primary))] text-white"
                          : "bg-white/10 text-white/40",
                      )}
                    >
                      {index + 1}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        isActive ? "text-white" : "text-white/60",
                      )}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-white/40 truncate">
                      {step.description}
                    </p>
                  </div>
                </div>

                {isActive && (
                  <ChevronRight className="h-5 w-5 text-[hsl(var(--primary))] flex-shrink-0 ml-2" />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
```

---

## 5. Hook: useFormWithAutosave

```tsx
// src/hooks/useFormWithAutosave.ts

import { useCallback, useRef, useEffect, useState } from "react";

interface UseFormWithAutosaveOptions {
  initialData: any;
  onSave: (data: any) => Promise<void>;
  debounceMs?: number;
}

export function useFormWithAutosave({
  initialData,
  onSave,
  debounceMs = 1000,
}: UseFormWithAutosaveOptions) {
  const [formData, setFormData] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout>();

  const handleSave = useCallback(
    async (dataToSave: any) => {
      setIsSaving(true);
      setSaveError(null);

      try {
        await onSave(dataToSave);
        setLastSavedAt(new Date());
        setHasUnsavedChanges(false);
      } catch (error: any) {
        setSaveError(error.message || "Erro ao salvar");
        console.error("Save error:", error);
      } finally {
        setIsSaving(false);
      }
    },
    [onSave],
  );

  const updateFormData = useCallback(
    (updates: Partial<typeof initialData> | ((prev: any) => any)) => {
      setFormData((prev) => {
        const newData =
          typeof updates === "function"
            ? updates(prev)
            : { ...prev, ...updates };
        setHasUnsavedChanges(true);

        // Autosave com debounce
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
          handleSave(newData);
        }, debounceMs);

        return newData;
      });
    },
    [debounceMs, handleSave],
  );

  const manualSave = useCallback(async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    await handleSave(formData);
  }, [formData, handleSave]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    formData,
    updateFormData,
    save: manualSave,
    isSaving,
    hasUnsavedChanges,
    lastSavedAt,
    saveError,
  };
}
```

---

## 6. StatusBadge Component

```tsx
// src/components/admin/company/CompanyForm/StatusBadge.tsx

import { CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "complete" | "incomplete" | "error" | "saving";
  count?: { completed: number; total: number };
  className?: string;
}

export function StatusBadge({ status, count, className }: StatusBadgeProps) {
  const getContent = () => {
    switch (status) {
      case "complete":
        return {
          icon: <CheckCircle2 className="h-3.5 w-3.5" />,
          text: "Completo",
          bgColor: "bg-green-500/10",
          textColor: "text-green-600",
          borderColor: "border-green-500/20",
        };
      case "incomplete":
        return {
          icon: <Clock className="h-3.5 w-3.5" />,
          text: count ? `${count.completed}/${count.total}` : "Incompleto",
          bgColor: "bg-yellow-500/10",
          textColor: "text-yellow-600",
          borderColor: "border-yellow-500/20",
        };
      case "error":
        return {
          icon: <AlertCircle className="h-3.5 w-3.5" />,
          text: "Erro",
          bgColor: "bg-red-500/10",
          textColor: "text-red-600",
          borderColor: "border-red-500/20",
        };
      case "saving":
        return {
          icon: <Clock className="h-3.5 w-3.5 animate-spin" />,
          text: "Salvando...",
          bgColor: "bg-blue-500/10",
          textColor: "text-blue-600",
          borderColor: "border-blue-500/20",
        };
    }
  };

  const content = getContent();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-medium",
        content.bgColor,
        content.textColor,
        content.borderColor,
        className,
      )}
    >
      {content.icon}
      <span>{content.text}</span>
    </div>
  );
}
```

---

## 7. Integração na Página Existente

```tsx
// Adicionar na página: src/app/(app)/admin/company/edit/page.tsx

// Imports adicionais
import { useFormWithAutosave } from "@/hooks/useFormWithAutosave";
import { FieldGroup } from "@/components/admin/company/CompanyForm/FieldGroup";
import { FormFieldWithValidation } from "@/components/admin/company/CompanyForm/FormFieldWithValidation";
import { CnpjLookup } from "@/components/admin/company/Integrations/CnpjLookup";
import { QuickSetupWizard } from "@/components/admin/company/CompanyForm/QuickSetupWizard";
import { StatusBadge } from "@/components/admin/company/CompanyForm/StatusBadge";

// Dentro do componente:
export default function CompanyEditPage() {
  const {
    formData,
    updateFormData,
    save,
    isSaving,
    hasUnsavedChanges,
    lastSavedAt,
  } = useFormWithAutosave({
    initialData: MOCK_COMPANY,
    onSave: async (data) => {
      // Aqui irá a chamada real à API
      console.log("Saving:", data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
    debounceMs: 1500,
  });

  // ... resto do componente
}
```

---

## 📝 Próximas Etapas

1. **Copiar componentes** para o projeto
2. **Adicionar validações** específicas do domínio
3. **Integrar APIs** de CNPJ e CEP
4. **Testar com usuários reais**
5. **Coletar feedback e iterar**

---

**Status:** 🟢 Pronto para implementação  
**Tempo estimado:** 3-5 dias para Phase 1
