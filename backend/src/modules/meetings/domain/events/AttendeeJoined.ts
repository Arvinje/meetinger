import { UserName } from '@users/domain/UserName';
import type { DomainEvent } from '@src/shared/domain/DomainEvent';
import type { Meeting } from '../Meeting';

export const AttendeeJoinedEventName = 'AttendeeJoined';

export class AttendeeJoined implements DomainEvent {
  public readonly createdAt: Date;

  public readonly meeting: Meeting;

  public readonly username: UserName;

  public readonly isOrganizer: boolean;

  constructor(meeting: Meeting, username: UserName, isOrganizer: boolean) {
    this.createdAt = new Date();
    this.meeting = meeting;
    this.username = username;
    this.isOrganizer = isOrganizer;
  }

  // eslint-disable-next-line class-methods-use-this
  eventName(): string {
    return AttendeeJoinedEventName;
  }
}
