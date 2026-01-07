/**
 * Result Type
 * 
 * Tipo para representar operações que podem falhar.
 * Alternativa type-safe a throw/catch.
 * 
 * Inspirado em Rust's Result<T, E>
 */

export type Result<T, E = Error> =
  | { success: true; value: T }
  | { success: false; error: E };

/**
 * Helper para criar Result de sucesso
 */
export const Ok = <T>(value: T): Result<T, never> => ({
  success: true,
  value,
});

/**
 * Helper para criar Result de erro
 */
export const Err = <E = Error>(error: E): Result<never, E> => ({
  success: false,
  error,
});

/**
 * Type guard para verificar sucesso
 */
export const isOk = <T, E>(result: Result<T, E>): result is { success: true; value: T } => {
  return result.success === true;
};

/**
 * Type guard para verificar erro
 */
export const isErr = <T, E>(result: Result<T, E>): result is { success: false; error: E } => {
  return result.success === false;
};

/**
 * Extrai valor ou lança erro
 */
export const unwrapResult = <T, E>(result: Result<T, E>): T => {
  if (isOk(result)) {
    return result.value;
  }
  throw result.error;
};

/**
 * Extrai valor ou retorna default
 */
export const unwrapOrResult = <T, E>(result: Result<T, E>, defaultValue: T): T => {
  if (isOk(result)) {
    return result.value;
  }
  return defaultValue;
};
