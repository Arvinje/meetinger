import type { AggregateRoot } from './AggregateRoot';
import { DomainEvent } from './DomainEvent';
import { EventListener } from './EventListener';

export class EventPublisher {
  private static handlers: {
    [key: string]: EventListener[];
  } = {};

  public static registerHandler(handler: EventListener, eventName: string): void {
    if (!(eventName in this.handlers)) {
      this.handlers[eventName] = [];
    }
    this.handlers[eventName].push(handler);
  }

  public static async dispatchAggregateEvents(aggregate: AggregateRoot<unknown>): Promise<void> {
    const promises = aggregate.domainEvents.flatMap((event: DomainEvent) => this.dispatch(event));
    await Promise.all(promises);
  }

  private static dispatch(event: DomainEvent): Promise<void>[] {
    const eventName = event.eventName();
    if (eventName in this.handlers) {
      const handlers = this.handlers[eventName];
      return handlers.map(async (handler) => handler.execute(event));
    }
    return [];
  }
}
