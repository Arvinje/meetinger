import type { DomainEvent } from '@src/shared/domain/DomainEvent';
import type { Meeting } from '../Meeting';

export const MeetingChangedEventName = 'MeetingChanged';

export class MeetingChanged implements DomainEvent {
  public readonly createdAt: Date;

  public readonly meeting: Meeting;

  constructor(meeting: Meeting) {
    this.meeting = meeting;
    this.createdAt = new Date();
  }

  // eslint-disable-next-line class-methods-use-this
  eventName(): string {
    return MeetingChangedEventName;
  }
}
