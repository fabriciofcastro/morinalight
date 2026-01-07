import { generateUUID } from '@/shared/kernel/utils';

/**
 * OutboxMessage Status
 */
export enum OutboxStatus {
  PENDING = 'PENDING',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED',
}

/**
 * OutboxMessage Entity
 * 
 * Representa uma mensagem (evento) que precisa ser publicada de forma confiável.
 * Salva no banco de dados na mesma transação da alteração de estado.
 */
export class OutboxMessage {
  constructor(
    public readonly id: string,
    public readonly type: string,
    public readonly payload: string, // JSON string
    public readonly status: OutboxStatus,
    public readonly occurredAt: Date,
    public readonly correlationId?: string,
    public readonly causationId?: string,
    public processedAt?: Date,
    public error?: string,
    public attempts: number = 0
  ) {}

  static create(type: string, payload: any, correlationId?: string, causationId?: string): OutboxMessage {
    return new OutboxMessage(
      generateUUID(),
      type,
      JSON.stringify(payload),
      OutboxStatus.PENDING,
      new Date(),
      correlationId,
      causationId
    );
  }

  markAsProcessed(): OutboxMessage {
    return new OutboxMessage(
      this.id,
      this.type,
      this.payload,
      OutboxStatus.PROCESSED,
      this.occurredAt,
      this.correlationId,
      this.causationId,
      new Date(),
      undefined,
      this.attempts
    );
  }
 
  markAsFailed(error: string): OutboxMessage {
    return new OutboxMessage(
      this.id,
      this.type,
      this.payload,
      OutboxStatus.FAILED,
      this.occurredAt,
      this.correlationId,
      this.causationId,
      this.processedAt,
      error,
      this.attempts + 1
    );
  }
  
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      payload: this.payload,
      status: this.status,
      occurredAt: this.occurredAt.toISOString(),
      processedAt: this.processedAt?.toISOString(),
      error: this.error,
      attempts: this.attempts,
      correlationId: this.correlationId,
      causationId: this.causationId,
    };
  }
}
