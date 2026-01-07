import { PrismaClient } from '@prisma/client';
import { TransactionManager } from './transaction-manager';

/**
 * BasePrismaRepository
 * 
 * Classe base para todos os repositórios Prisma.
 * Resolve automaticamente se deve usar a instância global do Prisma
 * ou a transação ativa no contexto atual.
 */
export abstract class BasePrismaRepository {
  constructor(protected readonly prisma: PrismaClient) {}

  /**
   * Retorna o cliente Prisma adequado (global ou em transação).
   */
  protected get client() {
    return TransactionManager.getTransaction<any>() || this.prisma;
  }
}
