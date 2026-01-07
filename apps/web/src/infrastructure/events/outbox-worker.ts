import { IEventBus, ILogger, IOutboxRepository } from '@/application/ports';

/**
 * OutboxWorker
 * 
 * Processa mensagens pendentes no Outbox e as publica no EventBus.
 * Garante que eventos sejam eventualmente entregues.
 */
export class OutboxWorker {
  private isProcessing = false;

  constructor(
    private readonly outboxRepository: IOutboxRepository,
    private readonly eventBus: IEventBus,
    private readonly logger: ILogger
  ) {}

  /**
   * Inicia o processamento periódico (ex: a cada 5 segundos)
   */
  start(intervalMs: number = 5000) {
    this.logger.info('OutboxWorker started');
    setInterval(() => this.process(), intervalMs);
  }

  /**
   * Processa uma leva de mensagens pendentes
   */
  async process() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const pendingMessages = await this.outboxRepository.findPending(20);
      
      if (pendingMessages.length === 0) {
        this.isProcessing = false;
        return;
      }

      this.logger.info(`Processing ${pendingMessages.length} outbox messages`);

      for (const message of pendingMessages) {
        try {
          const payload = JSON.parse(message.payload);
          
          await this.eventBus.publish({
            getEventName: () => message.type,
            getPayload: () => payload,
            occurredAt: message.occurredAt,
            eventId: message.id,
            correlationId: message.correlationId,
            causationId: message.causationId,
          } as any);

          await this.outboxRepository.save(message.markAsProcessed());
        } catch (error) {
          this.logger.error(`Failed to process outbox message ${message.id}`, error as Error);
          await this.outboxRepository.save(message.markAsFailed((error as Error).message));
        }
      }
    } catch (error) {
      this.logger.error('OutboxWorker encountered an error', error as Error);
    } finally {
      this.isProcessing = false;
    }
  }
}
