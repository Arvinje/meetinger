import { Entity } from '@src/shared/domain/entity';
import { UserName } from '@users/domain/UserName';
import { UserFullName } from '@users/domain/UserFullName';
import { UniqueID } from '@src/shared/domain/uniqueId';
import { Result, Ok } from '@hqoss/monads';
import { MeetingID } from './MeetingID';

export interface AttendeeProps {
  username: UserName;
  fullName: UserFullName;
  meetingID: MeetingID;
  joinedMeetingOn?: Date;
}

export class Attendee extends Entity<AttendeeProps> {
  get username(): UserName {
    return this.props.username;
  }

  get fullName(): UserFullName {
    return this.props.fullName;
  }

  get meetingID(): MeetingID {
    return this.props.meetingID;
  }

  get joinedMeetingOn(): Date {
    return this.props.joinedMeetingOn;
  }

  // eslint-disable-next-line no-useless-constructor
  private constructor(props: AttendeeProps, id?: UniqueID) {
    super(props, id);
  }

  public static create(props: AttendeeProps, id?: UniqueID): Result<Attendee, void> {
    const attendee = new Attendee(props, id);
    return Ok(attendee);
  }
}
