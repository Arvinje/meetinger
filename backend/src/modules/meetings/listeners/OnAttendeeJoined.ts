import { EventListener } from '@src/shared/domain/EventListener';
import { EventPublisher } from '@src/shared/domain/EventPublisher';
import { AttendeeJoined, AttendeeJoinedEventName } from '@meetings/domain/events/AttendeeJoined';
import { UnexpectedError } from '@src/shared/core/AppError';
import { MessageBroker } from '@src/shared/infra/brokers/MessageBroker';
import { AttendeeJoinedEvent } from '../integrationEvents/AttendeeJoinedEvent';

export class OnAttendeeJoined implements EventListener {
  private broker: MessageBroker;

  constructor(broker: MessageBroker) {
    this.broker = broker;
  }

  subscribe(): void {
    EventPublisher.registerHandler(this, AttendeeJoinedEventName);
  }

  async execute(event: AttendeeJoined): Promise<void> {
    const payload: AttendeeJoinedEvent = {
      username: event.username.value,
      meetingID: event.meeting.id.id.toString(),
      joinedMeetingOn: event.createdAt,
      isOrganizer: event.isOrganizer,
    };

    try {
      await this.broker.publish('AttendeeJoined', payload);
    } catch (error) {
      UnexpectedError.wrap(error, 'failed to publish message to topic(AttendeeJoined)');
    }
  }
}
