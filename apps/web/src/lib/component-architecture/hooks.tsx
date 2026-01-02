/**
 * Component Refactoring Utilities
 * 
 * Utilities para facilitar refatoração de componentes grandes
 * seguindo Atomic Design e separação de lógica/UI
 */

import { useCallback, useEffect, useState } from "react";

/**
 * Separar lógica de UI - Pattern
 * 
 * Exemplo de como refatorar um componente grande:
 * 
 * ANTES (LoginForm.tsx - 528 linhas):
 * export function LoginForm() {
 *   // 500+ linhas de lógica + UI misturadas
 * }
 * 
 * DEPOIS:
 * 
 * 1. Hook com lógica (useLoginForm.ts):
 * export function useLoginForm() {
 *   const [email, setEmail] = useState("");
 *   const [password, setPassword] = useState("");
 *   const [errors, setErrors] = useState({});
 *   
 *   const handleSubmit = async () => {
 *     // Lógica de validação e submit
 *   };
 *   
 *   return { email, setEmail, password, setPassword, errors, handleSubmit };
 * }
 * 
 * 2. Componente UI (LoginFormUI.tsx):
 * export function LoginFormUI({ email, onEmailChange, password, onPasswordChange, errors, onSubmit }) {
 *   return (
 *     <form onSubmit={onSubmit}>
 *       <Input value={email} onChange={onEmailChange} error={errors.email} />
 *       <Input type="password" value={password} onChange={onPasswordChange} error={errors.password} />
 *       <Button type="submit">Login</Button>
 *     </form>
 *   );
 * }
 * 
 * 3. Componente Container (LoginForm/index.tsx):
 * export function LoginForm() {
 *   const logic = useLoginForm();
 *   return <LoginFormUI {...logic} />;
 * }
 */

/**
 * Hook helper para form state
 */
export function useFormState<T extends Record<string, any>>(initialState: T) {
    const [values, setValues] = useState<T>(initialState);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

    const handleChange = useCallback((field: keyof T) => {
        return (value: any) => {
            setValues((prev) => ({ ...prev, [field]: value }));
            setTouched((prev) => ({ ...prev, [field]: true }));
        };
    }, []);

    const handleBlur = useCallback((field: keyof T) => {
        return () => {
            setTouched((prev) => ({ ...prev, [field]: true }));
        };
    }, []);

    const setFieldError = useCallback((field: keyof T, error: string) => {
        setErrors((prev) => ({ ...prev, [field]: error }));
    }, []);

    const clearErrors = useCallback(() => {
        setErrors({});
    }, []);

    const reset = useCallback(() => {
        setValues(initialState);
        setErrors({});
        setTouched({});
    }, [initialState]);

    return {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        setFieldError,
        clearErrors,
        reset,
        setValues,
    };
}

/**
 * Hook helper para async operations
 */
export function useAsyncOperation<T, Args extends any[]>(
    operation: (...args: Args) => Promise<T>,
) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [data, setData] = useState<T | null>(null);

    const execute = useCallback(
        async (...args: Args) => {
            setIsLoading(true);
            setError(null);

            try {
                const result = await operation(...args);
                setData(result);
                return result;
            } catch (err) {
                const error = err instanceof Error ? err : new Error(String(err));
                setError(error);
                throw error;
            } finally {
                setIsLoading(false);
            }
        },
        [operation],
    );

    const reset = useCallback(() => {
        setIsLoading(false);
        setError(null);
        setData(null);
    }, []);

    return {
        execute,
        isLoading,
        error,
        data,
        reset,
    };
}

/**
 * Hook helper para toggle state
 */
export function useToggle(initialValue = false): [boolean, () => void, (value: boolean) => void] {
    const [value, setValue] = useState(initialValue);

    const toggle = useCallback(() => {
        setValue((v) => !v);
    }, []);

    return [value, toggle, setValue];
}

/**
 * Hook helper para array state
 */
export function useArray<T>(initialValue: T[] = []) {
    const [array, setArray] = useState<T[]>(initialValue);

    const push = useCallback((item: T) => {
        setArray((prev) => [...prev, item]);
    }, []);

    const remove = useCallback((index: number) => {
        setArray((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const update = useCallback((index: number, item: T) => {
        setArray((prev) => prev.map((v, i) => (i === index ? item : v)));
    }, []);

    const clear = useCallback(() => {
        setArray([]);
    }, []);

    return {
        array,
        set: setArray,
        push,
        remove,
        update,
        clear,
    };
}

/**
 * Hook helper para local storage
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === "undefined") return initialValue;

        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error loading ${key} from localStorage:`, error);
            return initialValue;
        }
    });

    const setValue = useCallback(
        (value: T | ((val: T) => T)) => {
            try {
                const valueToStore = value instanceof Function ? value(storedValue) : value;
                setStoredValue(valueToStore);

                if (typeof window !== "undefined") {
                    window.localStorage.setItem(key, JSON.stringify(valueToStore));
                }
            } catch (error) {
                console.error(`Error saving ${key} to localStorage:`, error);
            }
        },
        [key, storedValue],
    );

    return [storedValue, setValue] as const;
}

/**
 * Hook helper para previous value
 */
export function usePrevious<T>(value: T): T | undefined {
    const ref = React.useRef<T>();

    React.useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref.current;
}

/**
 * Hook helper para mounted state
 */
export function useIsMounted() {
    const isMounted = React.useRef(false);

    React.useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    return React.useCallback(() => isMounted.current, []);
}

import React from "react";
