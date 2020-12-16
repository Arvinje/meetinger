import { MeetingCreatedEvent } from '@src/modules/meetings/integrationEvents/MeetingCreatedEvent';
import { AttendeeJoinedEvent } from '@src/modules/meetings/integrationEvents/AttendeeJoinedEvent';
import { AttendeeLeftEvent } from '@src/modules/meetings/integrationEvents/AttendeeLeftEvent';

export interface MessageBroker {
  publish(topic: 'MeetingCreated', message: MeetingCreatedEvent): Promise<void>;
  publish(topic: 'AttendeeJoined', message: AttendeeJoinedEvent): Promise<void>;
  publish(topic: 'AttendeeLeft', message: AttendeeLeftEvent): Promise<void>;
}
