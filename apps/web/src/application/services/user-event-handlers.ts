import type { IEventBus, ILogger } from '@/application/ports';
import { UserCreatedEvent, UserDeletedEvent, UserUpdatedEvent } from '@/domain/events';

/**
 * User Event Handlers
 * 
 * Handlers que reagem a eventos de domínio de usuário.
 * Implementam side-effects como envio de emails, logs, analytics, etc.
 */

export class UserEventHandlers {
  constructor(
    private readonly eventBus: IEventBus,
    private readonly logger: ILogger
  ) {}

  /**
   * Registra todos os handlers
   */
  register(): void {
    this.eventBus.subscribe('user.created', this.handleUserCreated.bind(this));
    this.eventBus.subscribe('user.updated', this.handleUserUpdated.bind(this));
    this.eventBus.subscribe('user.deleted', this.handleUserDeleted.bind(this));
  }

  /**
   * Handler para UserCreatedEvent
   */
  private async handleUserCreated(event: UserCreatedEvent): Promise<void> {
    const payload = event.getPayload();
    
    this.logger.info('User created event received', {
      userId: payload.userId,
      email: payload.email,
    });

    // Side-effects:
    // 1. Enviar email de boas-vindas
    // await emailService.sendWelcomeEmail(payload.email);

    // 2. Criar entrada no audit log
    // await auditService.log('user_created', payload);

    // 3. Enviar para analytics
    // await analytics.track('user_created', payload);

    // 4. Notificar admins
    // await notificationService.notifyAdmins('New user registered', payload);
  }

  /**
   * Handler para UserUpdatedEvent
   */
  private async handleUserUpdated(event: UserUpdatedEvent): Promise<void> {
    const payload = event.getPayload();
    
    this.logger.info('User updated event received', {
      userId: payload.userId,
      changes: payload.changes,
    });

    // Side-effects:
    // 1. Invalidar cache
    // await cacheService.invalidate(`user:${payload.userId}`);

    // 2. Audit log
    // await auditService.log('user_updated', payload);

    // 3. Notificar usuário se email mudou
    // if (payload.changes.email) {
    //   await emailService.sendEmailChangeNotification(payload.changes.email);
    // }
  }

  /**
   * Handler para UserDeletedEvent
   */
  private async handleUserDeleted(event: UserDeletedEvent): Promise<void> {
    const payload = event.getPayload();
    
    this.logger.info('User deleted event received', {
      userId: payload.userId,
    });

    // Side-effects:
    // 1. Limpar dados relacionados
    // await cleanupService.cleanupUserData(payload.userId);

    // 2. Audit log
    // await auditService.log('user_deleted', payload);

    // 3. Enviar email de confirmação
    // await emailService.sendAccountDeletedEmail(payload.email);
  }
}
