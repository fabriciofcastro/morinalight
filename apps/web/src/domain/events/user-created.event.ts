import { BaseDomainEvent } from './base-domain-event';

/**
 * User Created Event
 * 
 * Evento disparado quando um novo usuário é criado.
 */

export class UserCreatedEvent extends BaseDomainEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly role: string
  ) {
    super();
  }

  getEventName(): string {
    return 'user.created';
  }

  getPayload(): Record<string, unknown> {
    return {
      userId: this.userId,
      email: this.email,
      name: this.name,
      role: this.role,
    };
  }
}
