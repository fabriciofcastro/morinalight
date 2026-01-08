import { IOutboxRepository } from '@/application/ports';
import { OutboxMessage, OutboxStatus } from '@/domain/entities/outbox-message.entity';
import { None, Option, Some } from '@/shared/kernel/types';
import { PrismaClient } from '@prisma/client';
import { BasePrismaRepository } from './base-prisma.repository';

/**
 * PrismaOutboxRepository
 */
export class PrismaOutboxRepository extends BasePrismaRepository implements IOutboxRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async save(message: OutboxMessage): Promise<void> {
    const data = message.toJSON();

    await this.client.outboxMessage.upsert({
      where: { id: message.id },
      create: {
        id: data.id,
        type: data.type,
        payload: data.payload,
        status: data.status,
        occurredAt: new Date(data.occurredAt),
        attempts: data.attempts,
        error: data.error,
        correlationId: data.correlationId,
        causationId: data.causationId,
      },
      update: {
        status: data.status,
        processedAt: data.processedAt ? new Date(data.processedAt) : null,
        error: data.error,
        attempts: data.attempts,
      },
    });
  }

  async findPending(limit: number = 10): Promise<OutboxMessage[]> {
    const messages = await this.client.outboxMessage.findMany({
      where: { status: OutboxStatus.PENDING },
      take: limit,
      orderBy: { occurredAt: 'asc' },
    });

    return messages.map((m: any) => this.toDomain(m));
  }

  async findById(id: string): Promise<Option<OutboxMessage>> {
    const message = await this.client.outboxMessage.findUnique({
      where: { id },
    });

    if (!message) return None();

    return Some(this.toDomain(message));
  }

  async delete(id: string): Promise<void> {
    await this.client.outboxMessage.delete({
      where: { id },
    });
  }

  private toDomain(m: any): OutboxMessage {
    return new OutboxMessage(
      m.id,
      m.type,
      m.payload,
      m.status as OutboxStatus,
      m.occurredAt,
      m.processedAt || undefined,
      m.error || undefined,
      m.attempts
    );
  }
}
