import { EventListener } from '@src/shared/domain/EventListener';
import { EventPublisher } from '@src/shared/domain/EventPublisher';
import { AttendeeLeft, AttendeeLeftEventName } from '@meetings/domain/events/AttendeeLeft';
import { UnexpectedError } from '@src/shared/core/AppError';
import { MessageBroker } from '@src/shared/infra/brokers/MessageBroker';
import { AttendeeLeftEvent } from '@meetings/integrationEvents/AttendeeLeftEvent';

export class OnAttendeeLeft implements EventListener {
  private broker: MessageBroker;

  constructor(broker: MessageBroker) {
    this.broker = broker;
  }

  subscribe(): void {
    EventPublisher.registerHandler(this, AttendeeLeftEventName);
  }

  async execute(event: AttendeeLeft): Promise<void> {
    const payload: AttendeeLeftEvent = {
      username: event.username.value,
      meetingID: event.meeting.id.id.toString(),
    };

    try {
      await this.broker.publish('AttendeeLeft', payload);
    } catch (error) {
      UnexpectedError.wrap(error, 'failed to publish message to topic(AttendeeLeft)');
    }
  }
}
