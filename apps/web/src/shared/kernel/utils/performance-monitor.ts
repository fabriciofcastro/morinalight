import type { ILogger } from '@/application/ports';

/**
 * Performance Monitor for Use Cases
 * 
 * Tracks execution time and logs performance metrics
 */
export class PerformanceMonitor {
  constructor(private readonly logger: ILogger) {}

  /**
   * Measure execution time of a use case
   */
  async measure<T>(
    useCaseName: string,
    operation: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await operation();
      const duration = performance.now() - startTime;
      
      this.logger.info(`UseCase executed: ${useCaseName}`, {
        duration: `${duration.toFixed(2)}ms`,
        ...metadata
      });
      
      // Alert if slow (> 1s)
      if (duration > 1000) {
        this.logger.warn(`Slow UseCase detected: ${useCaseName}`, {
          duration: `${duration.toFixed(2)}ms`,
          ...metadata
        });
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      const actualError = error instanceof Error ? error : new Error(String(error));
      
      this.logger.error(`UseCase failed: ${useCaseName}`, actualError, {
        duration: `${duration.toFixed(2)}ms`,
        ...metadata
      });
      
      throw error;
    }
  }
}
