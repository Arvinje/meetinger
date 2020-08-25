import { Entity } from '@src/shared/domain/entity';
import { UserName } from '@src/modules/users/domain/UserName';
import { UniqueID } from '@src/shared/domain/uniqueId';
import { Result, Ok } from '@hqoss/monads';
import { MeetingID } from './MeetingID';
import { MeetingTitle } from './MeetingTitle';
import { MeetingDescription } from './MeetingDescription';
import { Attendee } from './Attendee';

export interface MeetingProps {
  title: MeetingTitle;
  organizer: UserName;
  description: MeetingDescription;
  startsAt: Date;
  attendees?: Attendee[];
}

export class Meeting extends Entity<MeetingProps> {
  get id(): MeetingID {
    // eslint-disable-next-line no-underscore-dangle
    return MeetingID.create(this._id);
  }

  get title(): MeetingTitle {
    return this.props.title;
  }

  get organizer(): UserName {
    return this.props.organizer;
  }

  get description(): MeetingDescription {
    return this.props.description;
  }

  get startsAt(): Date {
    return this.props.startsAt;
  }

  get attendees(): Attendee[] {
    return this.props.attendees;
  }

  addAttendee(...attendees: Attendee[]): void {
    this.props.attendees.push(...attendees);
  }

  // eslint-disable-next-line no-useless-constructor
  private constructor(props: MeetingProps, id?: UniqueID) {
    super(props, id);
  }

  public static create(props: MeetingProps, id?: UniqueID): Result<Meeting, void> {
    const meeting = new Meeting(props, id);
    return Ok(meeting);
  }
}
