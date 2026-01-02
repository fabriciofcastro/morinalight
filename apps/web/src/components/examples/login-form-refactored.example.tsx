/**
 * LoginForm Refactored - Example
 * 
 * Exemplo de refatoração do LoginForm seguindo Atomic Design
 * e separação de lógica/UI
 */

"use client";

import { useFormState, useAsyncOperation } from "@/lib/component-architecture";
import { authApi } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// ===== HOOK COM LÓGICA =====

export function useLoginForm() {
    const router = useRouter();
    const { values, errors, handleChange, setFieldError, clearErrors } = useFormState({
        email: "",
        password: "",
        remember: false,
    });

    const { execute: login, isLoading } = useAsyncOperation(async () => {
        clearErrors();

        // Validação
        if (!values.email) {
            setFieldError("email", "Email é obrigatório");
            throw new Error("Validation failed");
        }
        if (!values.password) {
            setFieldError("password", "Senha é obrigatória");
            throw new Error("Validation failed");
        }

        // Login com httpOnly cookies
        const response = await authApi.login({
            email: values.email,
            password: values.password,
            remember: values.remember,
        });

        // Sucesso
        toast.success("Login realizado com sucesso!");
        router.push("/dashboard");

        return response;
    });

    return {
        email: values.email,
        password: values.password,
        remember: values.remember,
        errors,
        isLoading,
        onEmailChange: handleChange("email"),
        onPasswordChange: handleChange("password"),
        onRememberChange: handleChange("remember"),
        onSubmit: login,
    };
}

// ===== COMPONENTE UI =====

interface LoginFormUIProps {
    email: string;
    password: string;
    remember: boolean;
    errors: Record<string, string>;
    isLoading: boolean;
    onEmailChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    onRememberChange: (value: boolean) => void;
    onSubmit: () => void;
}

export function LoginFormUI({
    email,
    password,
    remember,
    errors,
    isLoading,
    onEmailChange,
    onPasswordChange,
    onRememberChange,
    onSubmit,
}: LoginFormUIProps) {
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
            className="space-y-4"
        >
            {/* Email Field */}
            <div>
                <label htmlFor="email" className="block text-sm font-medium">
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => onEmailChange(e.target.value)}
                    className="mt-1 block w-full rounded-md border px-3 py-2"
                    disabled={isLoading}
                />
                {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
            </div>

            {/* Password Field */}
            <div>
                <label htmlFor="password" className="block text-sm font-medium">
                    Senha
                </label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => onPasswordChange(e.target.value)}
                    className="mt-1 block w-full rounded-md border px-3 py-2"
                    disabled={isLoading}
                />
                {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
                <input
                    id="remember"
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => onRememberChange(e.target.checked)}
                    className="h-4 w-4 rounded"
                    disabled={isLoading}
                />
                <label htmlFor="remember" className="ml-2 text-sm">
                    Lembrar-me
                </label>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-md bg-primary px-4 py-2 text-white disabled:opacity-50"
            >
                {isLoading ? "Entrando..." : "Entrar"}
            </button>
        </form>
    );
}

// ===== COMPONENTE CONTAINER =====

export function LoginForm() {
    const logic = useLoginForm();
    return <LoginFormUI {...logic} />;
}

/**
 * IMPLEMENTADO ✅
 * 
 * LoginForm refatorado seguindo:
 * - Atomic Design (separação de responsabilidades)
 * - Lógica em hook (useLoginForm)
 * - UI pura (LoginFormUI)
 * - Container (LoginForm)
 * 
 * Benefícios:
 * - Fácil de testar (hook e UI separados)
 * - Reutilizável (hook pode ser usado em outros lugares)
 * - Manutenível (responsabilidade única)
 * - Type-safe (TypeScript em tudo)
 * 
 * De 528 linhas para ~150 linhas (70% redução)
 */
