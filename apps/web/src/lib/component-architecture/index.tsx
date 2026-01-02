/**
 * Component Architecture Index
 * 
 * Exportações centralizadas de component architecture utilities
 */

// Hooks
export {
    useFormState,
    useAsyncOperation,
    useToggle,
    useArray,
    useLocalStorage,
    usePrevious,
    useIsMounted,
} from "./hooks";

// Atomic Design Guide (apenas para referência, não exportar componentes)
export type { ButtonProps, FormFieldProps, LoginFormUIProps } from "./atomic-design-guide";
