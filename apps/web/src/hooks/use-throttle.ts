/**
 * Hook para throttle de funções
 * Limita a frequência de execução de uma função
 */

import { useCallback, useRef } from "react";

export function useThrottle<T extends (...args: any[]) => any>(
  func: T,
  delay: number = 300,
): T {
  const lastRun = useRef<number>(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRun.current;

      if (timeSinceLastRun >= delay) {
        lastRun.current = now;
        func(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          lastRun.current = Date.now();
          func(...args);
        }, delay - timeSinceLastRun);
      }
    }) as T,
    [func, delay],
  );
}


