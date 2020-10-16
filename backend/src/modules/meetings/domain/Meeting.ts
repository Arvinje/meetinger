import { Entity } from '@src/shared/domain/entity';
import { UniqueID } from '@src/shared/domain/uniqueId';
import { Result, Ok } from '@hqoss/monads';
import { UserName } from '@src/modules/users/domain/UserName';
import { MeetingID } from './MeetingID';
import { MeetingTitle } from './MeetingTitle';
import { MeetingDescription } from './MeetingDescription';
import { Attendee } from './Attendee';
import { Attendees } from './Attendees';
import { MeetingRemainingSeats } from './MeetingRemainingSeats';
import { MeetingAvailableSeats } from './MeetingAvailableSeats';

export interface MeetingProps {
  title: MeetingTitle;
  description: MeetingDescription;
  startsAt: Date;
  attendees?: Attendees;
  remainingSeats?: MeetingRemainingSeats;
  availableSeats: MeetingAvailableSeats;
  createdBy: UserName;
  createdAt?: Date;
}

export class Meeting extends Entity<MeetingProps> {
  get id(): MeetingID {
    // eslint-disable-next-line no-underscore-dangle
    return MeetingID.create(this._id);
  }

  get title(): MeetingTitle {
    return this.props.title;
  }

  get description(): MeetingDescription {
    return this.props.description;
  }

  get startsAt(): Date {
    return this.props.startsAt;
  }

  get attendees(): Attendees {
    return this.props.attendees;
  }

  get remainingSeats(): MeetingRemainingSeats {
    return this.props.remainingSeats;
  }

  get availableSeats(): MeetingAvailableSeats {
    return this.props.availableSeats;
  }

  get createdBy(): UserName {
    return this.props.createdBy;
  }

  get createdAt(): UserName {
    return this.props.createdBy;
  }

  // eslint-disable-next-line no-useless-constructor
  private constructor(props: MeetingProps, id?: UniqueID) {
    super(props, id);
  }

  public static async create(props: MeetingProps, id?: UniqueID): Promise<Result<Meeting, void>> {
    const defaultProps: MeetingProps = {
      ...props,
      attendees: props.attendees || Attendees.create(),
      createdAt: props.createdAt || new Date(),
      remainingSeats:
        props.remainingSeats ||
        (await MeetingRemainingSeats.create(props.availableSeats.value)).unwrap(),
    };
    const meeting = new Meeting(defaultProps, id);
    return Ok(meeting);
  }

  public addAttendee(attendee: Attendee): void {
    this.props.attendees.add(attendee);
  }
}
