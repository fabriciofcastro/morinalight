import { IUnitOfWork } from '@/application/ports/unit-of-work.port';
import { OutboxMessage } from '@/domain/entities/outbox-message.entity';
import { RequestContext } from '@/shared/kernel/utils/request-context';
import { PrismaClient } from '@prisma/client';
import { PrismaOutboxRepository } from './prisma-outbox.repository';
import { TransactionManager } from './transaction-manager';

/**
 * PrismaUnitOfWork Adapter
 * 
 * Implementação do Unit of Work específica para o Prisma.
 * Utiliza o sistema de transações interativas do Prisma ($transaction)
 * e o TransactionManager para propagar o contexto.
 */
export class PrismaUnitOfWork implements IUnitOfWork {
  constructor(private readonly prisma: PrismaClient) {}

  async start<T>(work: (uow: IUnitOfWork) => Promise<T>): Promise<T> {
    // Se já existe uma transação no contexto, continua nela
    const currentTx = TransactionManager.getTransaction();
    if (currentTx) {
      return work(this);
    }

    // Inicia nova transação
    return this.prisma.$transaction(async (tx) => {
      return TransactionManager.run(tx, () => work(this));
    });
  }

  getTransaction<T>(): T {
    return TransactionManager.getTransaction<T>() || (this.prisma as any);
  }

  async saveMessage(type: string, payload: any, correlationId?: string, causationId?: string): Promise<void> {
    const tx = this.getTransaction<any>();
    const outboxRepository = new PrismaOutboxRepository(tx);
    
    // Tenta obter do RequestContext se não fornecido
    const context = RequestContext.get();
    const finalCorrelationId = correlationId || context?.correlationId;
    const finalCausationId = causationId || context?.causationId;

    const message = OutboxMessage.create(type, payload, finalCorrelationId, finalCausationId);
    await outboxRepository.save(message);
  }
}
