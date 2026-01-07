import { BaseDomainEvent } from './base-domain-event';

/**
 * User Deleted Event
 * 
 * Evento disparado quando um usuário é deletado.
 */

export class UserDeletedEvent extends BaseDomainEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string
  ) {
    super();
  }

  getEventName(): string {
    return 'user.deleted';
  }

  getPayload(): Record<string, unknown> {
    return {
      userId: this.userId,
      email: this.email,
    };
  }
}
