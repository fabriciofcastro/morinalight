"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, X, Loader2, AlertCircle } from "lucide-react";
import { cn } from "../lib/cn";
import { useDebounce } from "../hooks/use-debounce";

export interface CodeValidatorProps {
    value: string;
    onChange: (value: string) => void;
    entity: "branch" | "department" | "product" | "sector" | "position";
    currentId?: string; // ID do registro sendo editado (para não validar contra si mesmo)
    label?: string;
    placeholder?: string;
    required?: boolean;
    className?: string;
    onValidationChange?: (isValid: boolean) => void;
}

type ValidationState = "idle" | "validating" | "valid" | "invalid";

export function CodeValidator({
    value,
    onChange,
    entity,
    currentId,
    label = "Código",
    placeholder = "Digite o código...",
    required = true,
    className,
    onValidationChange,
}: CodeValidatorProps) {
    const [validationState, setValidationState] = useState<ValidationState>("idle");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [suggestions, setSuggestions] = useState<string[]>([]);

    // Use local debounce hook
    const debouncedValue = useDebounce(value, 500);

    const validateCode = useCallback(async (code: string) => {
        if (!code.trim()) {
            setValidationState("idle");
            setErrorMessage("");
            setSuggestions([]);
            onValidationChange?.(false);
            return;
        }

        setValidationState("validating");

        try {
            // Em produção, isso seria uma chamada de API injetada via prop ou contexto
            // Para mantermos o componente "puro", idealmente a função de validação deveria ser passada via props
            // Mas para manter compatibilidade com o código original por enquanto, mantemos a simulação aqui
            // TODO: Refatorar para aceitar async validator function via props

            await new Promise(resolve => setTimeout(resolve, 300));

            const existingCodes = ["PROD-001", "DEP-001", "BRANCH-001"];
            const isUnique = !existingCodes.includes(code.toUpperCase()) || code === currentId;

            if (isUnique) {
                // Validações adicionais
                if (code.length < 3) {
                    setValidationState("invalid");
                    setErrorMessage("Código deve ter pelo menos 3 caracteres");
                    onValidationChange?.(false);
                    return;
                }

                if (!/^[A-Z0-9-_]+$/i.test(code)) {
                    setValidationState("invalid");
                    setErrorMessage("Use apenas letras, números, hífen e underscore");
                    onValidationChange?.(false);
                    return;
                }

                setValidationState("valid");
                setErrorMessage("");
                setSuggestions([]);
                onValidationChange?.(true);
            } else {
                setValidationState("invalid");
                setErrorMessage("Este código já está em uso");

                // Gerar sugestões
                const baseName = code.replace(/-\d+$/, "");
                const newSuggestions = [
                    `${baseName}-${Math.floor(Math.random() * 1000)}`,
                    `${baseName}-${new Date().getFullYear()}`,
                    `${baseName}-NEW`,
                ];
                setSuggestions(newSuggestions);
                onValidationChange?.(false);
            }
        } catch (error) {
            setValidationState("invalid");
            setErrorMessage("Erro ao validar código");
            setSuggestions([]);
            onValidationChange?.(false);
        }
    }, [currentId, onValidationChange]);

    useEffect(() => {
        validateCode(debouncedValue);
    }, [debouncedValue, validateCode]);

    const getIcon = () => {
        switch (validationState) {
            case "validating":
                return <Loader2 className="w-4 h-4 animate-spin text-blue-400" />;
            case "valid":
                return <Check className="w-4 h-4 text-emerald-400" />;
            case "invalid":
                return <X className="w-4 h-4 text-red-400" />;
            default:
                return null;
        }
    };

    const getBorderColor = () => {
        switch (validationState) {
            case "valid":
                return "border-emerald-500/50 focus-within:border-emerald-500";
            case "invalid":
                return "border-red-500/50 focus-within:border-red-500";
            default:
                return "border-white/10 focus-within:border-cyan-500/50";
        }
    };

    return (
        <div className={cn("space-y-2", className)}>
            {label && (
                <label className="block text-sm font-medium text-white/70">
                    {label}
                    {required && <span className="text-red-400 ml-1">*</span>}
                </label>
            )}

            <div className={cn(
                "relative flex items-center gap-2 px-4 py-3 rounded-lg border bg-white/5 backdrop-blur-sm transition-all",
                getBorderColor()
            )}>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value.toUpperCase())}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent text-white placeholder:text-white/30 focus:outline-none"
                />
                <div className="flex-shrink-0">
                    {getIcon()}
                </div>
            </div>

            {/* Error Message */}
            {validationState === "invalid" && errorMessage && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm text-red-400">{errorMessage}</p>

                        {suggestions.length > 0 && (
                            <div className="mt-2 space-y-1">
                                <p className="text-xs text-red-300/70">Sugestões disponíveis:</p>
                                <div className="flex flex-wrap gap-2">
                                    {suggestions.map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            type="button"
                                            onClick={() => onChange(suggestion)}
                                            className="px-2 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded border border-red-500/30 transition-colors"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Success Message */}
            {validationState === "valid" && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <p className="text-sm text-emerald-400">Código disponível</p>
                </div>
            )}
        </div>
    );
}
