import { EventListener } from '@src/shared/domain/EventListener';
import { EventPublisher } from '@src/shared/domain/EventPublisher';
import { MeetingCreated, MeetingCreatedEventName } from '@meetings/domain/events/MeetingCreated';
import { UnexpectedError } from '@src/shared/core/AppError';
import { MessageBroker } from '@src/shared/infra/brokers/MessageBroker';
import { MeetingCreatedEvent } from '@meetings/integrationEvents/MeetingCreatedEvent';

export class OnMeetingCreated implements EventListener {
  private broker: MessageBroker;

  constructor(broker: MessageBroker) {
    this.broker = broker;
  }

  subscribe(): void {
    EventPublisher.registerHandler(this, MeetingCreatedEventName);
  }

  async execute(event: MeetingCreated): Promise<void> {
    const message: MeetingCreatedEvent = {
      id: event.meeting.id.id.toString(),
      title: event.meeting.title.value,
      description: event.meeting.description.value,
      category: event.meeting.category.value,
      startsAt: event.meeting.startsAt,
      location: event.meeting.location.value,
      availableSeats: event.meeting.availableSeats.value,
      createdBy: event.meeting.createdBy.value,
    };

    try {
      await this.broker.publish('MeetingCreated', message);
    } catch (error) {
      UnexpectedError.wrap(error, 'failed to publish message to topic(MeetingCreated)');
    }
  }
}
