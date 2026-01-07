import { BaseDomainEvent } from './base-domain-event';

/**
 * User Updated Event
 * 
 * Evento disparado quando um usuário é atualizado.
 */

export class UserUpdatedEvent extends BaseDomainEvent {
  constructor(
    public readonly userId: string,
    public readonly changes: Record<string, unknown>
  ) {
    super();
  }

  getEventName(): string {
    return 'user.updated';
  }

  getPayload(): Record<string, unknown> {
    return {
      userId: this.userId,
      changes: this.changes,
    };
  }
}
