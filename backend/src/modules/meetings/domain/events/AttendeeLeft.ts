import { UserName } from '@users/domain/UserName';
import type { DomainEvent } from '@src/shared/domain/DomainEvent';
import type { Meeting } from '../Meeting';

export const AttendeeLeftEventName = 'AttendeeLeft';

export class AttendeeLeft implements DomainEvent {
  public readonly createdAt: Date;

  public readonly meeting: Meeting;

  public readonly username: UserName;

  constructor(meeting: Meeting, username: UserName) {
    this.createdAt = new Date();
    this.meeting = meeting;
    this.username = username;
  }

  // eslint-disable-next-line class-methods-use-this
  eventName(): string {
    return AttendeeLeftEventName;
  }
}
