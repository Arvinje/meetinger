/* eslint-disable no-underscore-dangle */
import { DomainEvent } from './DomainEvent';
import { Entity } from './entity';

export abstract class AggregateRoot<T> extends Entity<T> {
  protected _events: DomainEvent[] = [];

  protected registerEvent(event: DomainEvent): void {
    this._events.push(event);
  }

  get domainEvents(): DomainEvent[] {
    return this._events;
  }

  public clearEvents(): void {
    this._events = [];
  }
}
