import { EventListener } from '@src/shared/domain/EventListener';
import { EventPublisher } from '@src/shared/domain/EventPublisher';
import { MeetingChanged, MeetingChangedEventName } from '@meetings/domain/events/MeetingChanged';
import { UnexpectedError } from '@src/shared/core/AppError';
import { MessageBroker } from '@src/shared/infra/brokers/MessageBroker';
import { MeetingChangedEvent } from '@meetings/integrationEvents/MeetingChangedEvent';

export class OnMeetingChanged implements EventListener {
  private broker: MessageBroker;

  constructor(broker: MessageBroker) {
    this.broker = broker;
  }

  subscribe(): void {
    EventPublisher.registerHandler(this, MeetingChangedEventName);
  }

  async execute(event: MeetingChanged): Promise<void> {
    const message: MeetingChangedEvent = {
      id: event.meeting.id.id.toString(),
      title: event.meeting.title.value,
      description: event.meeting.description.value,
      category: event.meeting.category.value,
      startsAt: event.meeting.startsAt,
    };

    try {
      await this.broker.publish('MeetingChanged', message);
    } catch (error) {
      UnexpectedError.wrap(error, 'failed to publish message to topic(MeetingChanged)');
    }
  }
}
