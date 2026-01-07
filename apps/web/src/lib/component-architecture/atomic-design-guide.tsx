/**
 * Atomic Design Structure Guide
 * 
 * Guia de organização de componentes seguindo Atomic Design
 */

/**
 * ESTRUTURA DE PASTAS:
 * 
 * /components
 *   /atoms          # Componentes básicos, indivisíveis
 *     /button
 *       - index.tsx
 *       - button.test.tsx
 *       - button.stories.tsx
 *     /input
 *     /label
 *     /icon
 * 
 *   /molecules      # Combinação de atoms
 *     /form-field   # Label + Input + Error
 *     /search-box   # Input + Button
 *     /card
 *     /modal
 * 
 *   /organisms      # Combinação de molecules/atoms com lógica
 *     /login-form
 *       - index.tsx           # Container
 *       - LoginFormUI.tsx     # UI pura
 *       - useLoginForm.ts     # Lógica
 *       - types.ts            # Tipos
 *       - login-form.test.tsx
 *     /user-table
 *     /navigation
 * 
 *   /templates      # Layouts de página
 *     /auth-layout
 *     /dashboard-layout
 *     /admin-layout
 * 
 *   /pages          # Páginas completas (mover para /app)
 */

/**
 * EXEMPLO: ATOM
 * 
 * /components/atoms/button/index.tsx
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
}

export function Button({
    variant = "primary",
    size = "md",
    isLoading = false,
    children,
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            {...props}
            disabled={disabled || isLoading}
            className={`btn btn-${variant} btn-${size}`}
        >
            {isLoading ? "Loading..." : children}
        </button>
    );
}

/**
 * EXEMPLO: MOLECULE
 * 
 * /components/molecules/form-field/index.tsx
 */
export interface FormFieldProps {
    label: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
}

export function FormField({ label, error, required, children }: FormFieldProps) {
    return (
        <div className="form-field">
            <label className="form-label">
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>
            {children}
            {error && <span className="form-error">{error}</span>}
        </div>
    );
}

/**
 * EXEMPLO: ORGANISM
 * 
 * /components/organisms/login-form/useLoginForm.ts
 */
export function useLoginForm() {
    const { values, errors, handleChange, setFieldError, clearErrors } = useFormState({
        email: "",
        password: "",
    });

    const { execute: login, isLoading } = useAsyncOperation(async () => {
        clearErrors();

        // Validação
        if (!values.email) {
            setFieldError("email", "Email é obrigatório");
            return;
        }
        if (!values.password) {
            setFieldError("password", "Senha é obrigatória");
            return;
        }

        // API call
        // await authApi.login(values.email, values.password);
    });

    return {
        email: values.email,
        password: values.password,
        errors,
        isLoading,
        onEmailChange: handleChange("email"),
        onPasswordChange: handleChange("password"),
        onSubmit: login,
    };
}

/**
 * /components/organisms/login-form/LoginFormUI.tsx
 */
export interface LoginFormUIProps {
    email: string;
    password: string;
    errors: Record<string, string>;
    isLoading: boolean;
    onEmailChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    onSubmit: () => void;
}

export function LoginFormUI({
    email,
    password,
    errors,
    isLoading,
    onEmailChange,
    onPasswordChange,
    onSubmit,
}: LoginFormUIProps) {
    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
            <FormField label="Email" error={errors.email} required>
                <Input
                    type="email"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onEmailChange(e.target.value)}
                />
            </FormField>

            <FormField label="Senha" error={errors.password} required>
                <Input
                    type="password"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onPasswordChange(e.target.value)}
                />
            </FormField>

            <Button type="submit" isLoading={isLoading}>
                Entrar
            </Button>
        </form>
    );
}

/**
 * /components/organisms/login-form/index.tsx
 */
export function LoginForm() {
    const logic = useLoginForm();
    return <LoginFormUI {...logic} />;
}

/**
 * BENEFÍCIOS:
 * 
 * 1. Separação de Responsabilidades
 *    - Lógica em hooks
 *    - UI em componentes puros
 *    - Fácil de testar
 * 
 * 2. Reutilização
 *    - Atoms e molecules reutilizáveis
 *    - Hooks compartilhados
 * 
 * 3. Testabilidade
 *    - Testar lógica isoladamente
 *    - Testar UI com mocks
 * 
 * 4. Manutenibilidade
 *    - Componentes pequenos
 *    - Responsabilidade única
 *    - Fácil de entender
 */

import React from "react";
// Mocks for example code to satisfy TypeScript
const useFormState = (initial: any) => ({
    values: initial,
    errors: {} as Record<string, string>,
    handleChange: (field: string) => (value: any) => { },
    setFieldError: (field: string, msg: string) => { },
    clearErrors: () => { }
});

const useAsyncOperation = (fn: any) => ({
    execute: fn,
    isLoading: false
});

const Input = (props: any) => <input {...props} />;
