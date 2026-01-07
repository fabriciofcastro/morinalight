/**
 * Option Type
 * 
 * Tipo para representar valores que podem ser nulos/undefined.
 * Alternativa type-safe a null/undefined checks.
 */

export type Option<T> = T | null | undefined;

/**
 * Helper para criar Option com valor
 */
export const Some = <T>(value: T): Option<T> => value;

/**
 * Helper para criar Option vazio
 */
export const None = <T = never>(): Option<T> => null;

/**
 * Type guard para verificar se tem valor
 */
export const isSome = <T>(option: Option<T>): option is T => {
  return option !== null && option !== undefined;
};

/**
 * Type guard para verificar se está vazio
 */
export const isNone = <T>(option: Option<T>): option is null | undefined => {
  return option === null || option === undefined;
};

/**
 * Extrai valor ou lança erro
 */
export const unwrapOption = <T>(option: Option<T>): T => {
  if (isSome(option)) {
    return option;
  }
  throw new Error('Tried to unwrap None value');
};

/**
 * Extrai valor ou retorna default
 */
export const unwrapOrOption = <T>(option: Option<T>, defaultValue: T): T => {
  if (isSome(option)) {
    return option;
  }
  return defaultValue;
};

/**
 * Map sobre Option
 */
export const map = <T, U>(option: Option<T>, fn: (value: T) => U): Option<U> => {
  if (isSome(option)) {
    return fn(option);
  }
  return None();
};
