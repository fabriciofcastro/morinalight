/**
 * Retry utility for resilient operations
 * Implements exponential backoff and jitter
 */

export type RetryOptions = {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  factor?: number;
  jitter?: boolean;
  onRetry?: (attempt: number, error: Error) => void;
  shouldRetry?: (error: Error) => boolean;
};

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, "onRetry" | "shouldRetry">> = {
  maxAttempts: 3,
  initialDelayMs: 100,
  maxDelayMs: 5000,
  factor: 2,
  jitter: true,
};

/**
 * Calculate delay with exponential backoff and optional jitter
 */
function calculateDelay(attempt: number, options: Required<Omit<RetryOptions, "onRetry" | "shouldRetry">>): number {
  const exponentialDelay = options.initialDelayMs * Math.pow(options.factor, attempt - 1);
  const delay = Math.min(exponentialDelay, options.maxDelayMs);

  if (options.jitter) {
    // Add random jitter (±25%)
    const jitterAmount = delay * 0.25;
    const jitter = (Math.random() - 0.5) * 2 * jitterAmount;
    return Math.max(0, delay + jitter);
  }

  return delay;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Default retry predicate - retry on all errors except specific ones
 */
function defaultShouldRetry(error: Error): boolean {
  // Don't retry on authentication/authorization errors
  if (error.message.includes("401") || error.message.includes("403")) {
    return false;
  }

  // Don't retry on validation errors
  if (error.message.includes("400") || error.message.includes("VALIDATION")) {
    return false;
  }

  // Retry on network errors, timeouts, and server errors
  return true;
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const shouldRetry = options.shouldRetry || defaultShouldRetry;

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry this error
      if (!shouldRetry(lastError)) {
        throw lastError;
      }

      // If this is the last attempt, throw the error
      if (attempt === opts.maxAttempts) {
        throw lastError;
      }

      // Call onRetry callback if provided
      if (options.onRetry) {
        options.onRetry(attempt, lastError);
      }

      // Calculate delay and wait
      const delay = calculateDelay(attempt, opts);
      await sleep(delay);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError || new Error("Retry failed");
}

/**
 * Retry with timeout
 */
export async function retryWithTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  retryOptions: RetryOptions = {},
): Promise<T> {
  return retry(
    () =>
      Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs),
        ),
      ]),
    retryOptions,
  );
}











