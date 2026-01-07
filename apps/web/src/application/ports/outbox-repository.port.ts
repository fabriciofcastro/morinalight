import { OutboxMessage } from '@/domain/entities/outbox-message.entity';
import { Option } from '@/shared/kernel/types';

/**
 * IOutboxRepository Port
 */
export interface IOutboxRepository {
  save(message: OutboxMessage): Promise<void>;
  findPending(limit?: number): Promise<OutboxMessage[]>;
  findById(id: string): Promise<Option<OutboxMessage>>;
  delete(id: string): Promise<void>;
}
