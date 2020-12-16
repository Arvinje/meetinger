export interface DomainEvent {
  readonly createdAt: Date;
  eventName(): string;
}
