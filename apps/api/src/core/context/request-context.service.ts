import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestContext {
  userId?: string;
  orgId?: string;
  role?: string;
  traceId?: string;
}

/**
 * Service to manage request-scoped context across async boundaries.
 */
export class RequestContextService {
  private static storage = new AsyncLocalStorage<RequestContext>();

  /**
   * Enters the context without wrapping a function.
   * Useful in environments like Fastify where wrapping is hard.
   */
  static enterWith(context: RequestContext): void {
    this.storage.enterWith(context);
  }

  /**
   * Runs a function within a context.
   */

  static run<T>(context: RequestContext, fn: () => T): T {
    return this.storage.run(context, fn);
  }

  /**
   * Gets the current context.
   */
  static getContext(): RequestContext | undefined {
    return this.storage.getStore();
  }

  /**
   * Helper to get specific values
   */
  static get orgId(): string | undefined {
    return this.getContext()?.orgId;
  }

  static get userId(): string | undefined {
    return this.getContext()?.userId;
  }
}
