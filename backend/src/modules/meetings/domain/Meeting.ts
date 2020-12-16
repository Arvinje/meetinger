import { UniqueID } from '@src/shared/domain/uniqueId';
import { Result, Ok, Err } from '@hqoss/monads';
import { UserName } from '@users/domain/UserName';
import { AggregateRoot } from '@src/shared/domain/AggregateRoot';
import { MeetingFullyBooked } from '@meetings/errors/MeetingErrors';
import { UnexpectedError, ValidationError } from '@src/shared/core/AppError';
import { MeetingID } from './MeetingID';
import { MeetingTitle } from './MeetingTitle';
import { MeetingDescription } from './MeetingDescription';
import { MeetingRemainingSeats } from './MeetingRemainingSeats';
import { MeetingAvailableSeats } from './MeetingAvailableSeats';
import { MeetingLocation } from './MeetingLocation';
import { MeetingCategory } from './MeetingCategory';
import { MeetingCreated } from './events/MeetingCreated';
import { AttendeeJoined } from './events/AttendeeJoined';
import { AttendeeLeft } from './events/AttendeeLeft';

export interface MeetingProps {
  title: MeetingTitle;
  description: MeetingDescription;
  category: MeetingCategory;
  startsAt: Date;
  location: MeetingLocation;
  remainingSeats?: MeetingRemainingSeats;
  availableSeats: MeetingAvailableSeats;
  createdBy: UserName;
  createdAt?: Date;
}

export class Meeting extends AggregateRoot<MeetingProps> {
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

  get category(): MeetingCategory {
    return this.props.category;
  }

  get startsAt(): Date {
    return this.props.startsAt;
  }

  get location(): MeetingLocation {
    return this.props.location;
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
      createdAt: props.createdAt || new Date(),
      remainingSeats:
        props.remainingSeats ||
        (await MeetingRemainingSeats.create(props.availableSeats.value - 1)).unwrap(),
    };
    const meeting = new Meeting(defaultProps, id);

    const isNewMeeting = !!id === false;
    if (isNewMeeting) {
      meeting.registerEvent(new MeetingCreated(meeting));
      meeting.registerEvent(new AttendeeJoined(meeting, defaultProps.createdBy, true));
    }

    return Ok(meeting);
  }

  public async addAttendee(
    username: UserName
  ): Promise<Result<void, MeetingFullyBooked | ValidationError | UnexpectedError>> {
    if (this.remainingSeats.value === 0) return Err(MeetingFullyBooked.create());

    const remainingOrError = await this.props.remainingSeats.subtract(1);
    if (remainingOrError.isErr()) return Err(remainingOrError.unwrapErr());
    this.props.remainingSeats = remainingOrError.unwrap();

    this.registerEvent(new AttendeeJoined(this, username, false));
    return Ok(undefined);
  }

  public async removeAttendee(
    username: UserName
  ): Promise<Result<void, ValidationError | UnexpectedError>> {
    if (this.remainingSeats.value === this.availableSeats.value)
      return Err(ValidationError.create('cannot remove a non-existing attendee'));

    const remainingOrError = await this.props.remainingSeats.add(1);
    if (remainingOrError.isErr()) return Err(remainingOrError.unwrapErr());
    this.props.remainingSeats = remainingOrError.unwrap();

    this.registerEvent(new AttendeeLeft(this, username));
    return Ok(undefined);
  }
}
