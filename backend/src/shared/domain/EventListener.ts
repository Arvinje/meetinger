import { DomainEvent } from './DomainEvent';

export interface EventListener {
  subscribe(): void;
  execute(event: DomainEvent): void;
}
