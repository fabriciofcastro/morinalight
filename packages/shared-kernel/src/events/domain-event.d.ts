export type DomainEventMetadata = {
  eventId: string;
  orgId: string;
  actorId: string;
  timestamp: Date;
};
export interface DomainEvent<TPayload = unknown> {
  name: string;
  version: string;
  metadata: DomainEventMetadata;
  payload: TPayload;
}
export interface DomainEventBus {
  publish<TPayload>(event: DomainEvent<TPayload>): Promise<void>;
}
