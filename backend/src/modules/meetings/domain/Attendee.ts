import { Result, Ok } from '@hqoss/monads';
import { UniqueID } from '@src/shared/domain/uniqueId';
import { UserName } from '@users/domain/UserName';
import { UserFullName } from '@users/domain/UserFullName';
import { AggregateRoot } from '@src/shared/domain/AggregateRoot';
import { UserEmail } from '@src/modules/users/domain/UserEmail';
import { MeetingID } from './MeetingID';
import { MeetingTitle } from './MeetingTitle';

export interface AttendeeProps {
  username: UserName;
  email: UserEmail;
  fullName: UserFullName;
  meetingID: MeetingID;
  joinedMeetingOn: Date;
  meetingStartsAt: Date;
  meetingTitle: MeetingTitle;
  isOrganizer?: boolean;
}

export class Attendee extends AggregateRoot<AttendeeProps> {
  get username(): UserName {
    return this.props.username;
  }

  get email(): UserEmail {
    return this.props.email;
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

  get meetingStartsAt(): Date {
    return this.props.meetingStartsAt;
  }

  get meetingTitle(): MeetingTitle {
    return this.props.meetingTitle;
  }

  get isOrganizer(): boolean {
    return this.props.isOrganizer;
  }

  // eslint-disable-next-line no-useless-constructor
  private constructor(props: AttendeeProps, id?: UniqueID) {
    super(props, id);
  }

  public static create(props: AttendeeProps, id?: UniqueID): Result<Attendee, void> {
    const defaultProps: AttendeeProps = {
      ...props,
      isOrganizer: props.isOrganizer || false,
    };
    const attendee = new Attendee(defaultProps, id);
    return Ok(attendee);
  }

  public setMeetingStartsAt(startsAt: Date): Result<void, void> {
    this.props.meetingStartsAt = startsAt;
    return Ok(undefined);
  }

  public setMeetingTitle(title: MeetingTitle): Result<void, void> {
    this.props.meetingTitle = title;
    return Ok(undefined);
  }
}
