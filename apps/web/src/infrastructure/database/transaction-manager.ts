import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * TransactionManager
 * 
 * Gerencia o contexto de transação usando AsyncLocalStorage.
 * Permite que repositórios acessem a transação atual de forma transparente.
 */
export class TransactionManager {
  private static storage = new AsyncLocalStorage<any>();

  /**
   * Executa um bloco de código dentro de um contexto de transação.
   */
  static run<T>(transaction: any, fn: () => T): T {
    return this.storage.run(transaction, fn);
  }

  /**
   * Retorna a transação atual ou undefined se não houver.
   */
  static getTransaction<T>(): T | undefined {
    return this.storage.getStore();
  }
}
