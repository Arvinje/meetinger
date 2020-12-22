import { MeetingCreatedEvent } from '@meetings/integrationEvents/MeetingCreatedEvent';
import { AttendeeJoinedEvent } from '@meetings/integrationEvents/AttendeeJoinedEvent';
import { AttendeeLeftEvent } from '@meetings/integrationEvents/AttendeeLeftEvent';
import { MeetingChangedEvent } from '@meetings/integrationEvents/MeetingChangedEvent';

export interface MessageBroker {
  publish(topic: 'MeetingCreated', message: MeetingCreatedEvent): Promise<void>;
  publish(topic: 'AttendeeJoined', message: AttendeeJoinedEvent): Promise<void>;
  publish(topic: 'AttendeeLeft', message: AttendeeLeftEvent): Promise<void>;
  publish(topic: 'MeetingChanged', message: MeetingChangedEvent): Promise<void>;
}
