import { UniqueID } from '@src/shared/domain/uniqueId';
import { Result, Ok, Err } from '@hqoss/monads';
import { UserName } from '@users/domain/UserName';
import { AggregateRoot } from '@src/shared/domain/AggregateRoot';
import {
  MeetingAlreadyStarted,
  MeetingFullyBooked,
  MeetingStartingDateInvalid,
  OrganizerCannotLeaveError,
  RemoteMeetingCannotHaveAddress,
} from '@meetings/errors/MeetingErrors';
import { UnexpectedError, ValidationError } from '@src/shared/core/AppError';
import { MeetingID } from './MeetingID';
import { MeetingTitle } from './MeetingTitle';
import { MeetingDescription } from './MeetingDescription';
import { MeetingRemainingSeats } from './MeetingRemainingSeats';
import { MeetingAvailableSeats } from './MeetingAvailableSeats';
import { MeetingAddress } from './MeetingAddress';
import { MeetingCategory } from './MeetingCategory';
import { MeetingCreated } from './events/MeetingCreated';
import { AttendeeJoined } from './events/AttendeeJoined';
import { AttendeeLeft } from './events/AttendeeLeft';
import { Attendees } from './Attendees';
import { MeetingPlace } from './MeetingPlace';
import { MeetingChanged } from './events/MeetingChanged';

export interface MeetingProps {
  title: MeetingTitle;
  description: MeetingDescription;
  category: MeetingCategory;
  startsAt: Date;
  place: MeetingPlace;
  address?: MeetingAddress;
  attendees?: Attendees;
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

  get place(): MeetingPlace {
    return this.props.place;
  }

  get isRemote(): boolean {
    return this.props.place.isRemote;
  }

  get isPhysical(): boolean {
    return this.props.place.isPhysical;
  }

  get address(): MeetingAddress {
    return this.props.address;
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

  public static async create(
    props: MeetingProps,
    id?: UniqueID
  ): Promise<
    Result<Meeting, MeetingStartingDateInvalid | RemoteMeetingCannotHaveAddress | ValidationError>
  > {
    const isNewMeeting = !!id === false;
    const defaultProps: MeetingProps = {
      ...props,
      createdAt: props.createdAt || new Date(),
      attendees: props.attendees || Attendees.create([props.createdBy]).unwrap(),
      remainingSeats:
        props.remainingSeats ||
        (await MeetingRemainingSeats.create(props.availableSeats.value - 1)).unwrap(),
    };

    if (props.place.isPhysical && !props.address)
      return Err(ValidationError.create('A venue address has to be provided for the meeting'));

    if (props.place.isRemote && props.address) return Err(RemoteMeetingCannotHaveAddress.create());

    // Constraints for new meetings
    if (isNewMeeting) {
      if (props.startsAt <= new Date()) return Err(MeetingStartingDateInvalid.create());
    }

    if (
      defaultProps.attendees.count !==
      defaultProps.availableSeats.value - defaultProps.remainingSeats.value
    )
      return Err(ValidationError.create('number of attendees and the taken seats do not match'));

    const meeting = new Meeting(defaultProps, id);

    if (isNewMeeting) {
      meeting.registerEvent(new MeetingCreated(meeting));
      meeting.registerEvent(new AttendeeJoined(meeting, defaultProps.createdBy, true));
    }

    return Ok(meeting);
  }

  public async addAttendee(
    username: UserName
  ): Promise<
    Result<void, MeetingFullyBooked | MeetingAlreadyStarted | ValidationError | UnexpectedError>
  > {
    if (this.props.startsAt <= new Date()) return Err(MeetingAlreadyStarted.create());

    if (this.remainingSeats.value === 0) return Err(MeetingFullyBooked.create());

    const attendeesOrError = this.props.attendees.add(username);
    if (attendeesOrError.isErr()) return Err(attendeesOrError.unwrapErr());
    this.props.attendees = attendeesOrError.unwrap();

    const remainingSeatsRes = await this.calculateRemainingSeats();
    if (remainingSeatsRes.isErr()) return Err(remainingSeatsRes.unwrapErr());

    this.registerEvent(new AttendeeJoined(this, username, false));
    return Ok(undefined);
  }

  public async removeAttendee(
    username: UserName
  ): Promise<
    Result<
      void,
      MeetingAlreadyStarted | OrganizerCannotLeaveError | ValidationError | UnexpectedError
    >
  > {
    if (this.props.startsAt <= new Date()) return Err(MeetingAlreadyStarted.create());

    if (this.remainingSeats.value === this.availableSeats.value)
      return Err(ValidationError.create('cannot remove a non-existing attendee'));

    if (this.createdBy.equals(username)) return Err(OrganizerCannotLeaveError.create());

    const attendeesOrError = this.props.attendees.remove(username);
    if (attendeesOrError.isErr()) return Err(attendeesOrError.unwrapErr());
    this.props.attendees = attendeesOrError.unwrap();

    const remainingSeatsRes = await this.calculateRemainingSeats();
    if (remainingSeatsRes.isErr()) return Err(remainingSeatsRes.unwrapErr());

    this.registerEvent(new AttendeeLeft(this, username));
    return Ok(undefined);
  }

  public setTitle(newTitle: MeetingTitle): Result<void, MeetingAlreadyStarted> {
    if (this.props.startsAt <= new Date()) return Err(MeetingAlreadyStarted.create());
    this.props.title = newTitle;
    this.registerIdempotentEvent(new MeetingChanged(this));
    return Ok(undefined);
  }

  public setDescription(newDesc: MeetingDescription): Result<void, MeetingAlreadyStarted> {
    if (this.props.startsAt <= new Date()) return Err(MeetingAlreadyStarted.create());
    this.props.description = newDesc;
    this.registerIdempotentEvent(new MeetingChanged(this));
    return Ok(undefined);
  }

  public setCategory(newCategory: MeetingCategory): Result<void, MeetingAlreadyStarted> {
    if (this.props.startsAt <= new Date()) return Err(MeetingAlreadyStarted.create());
    this.props.category = newCategory;
    this.registerIdempotentEvent(new MeetingChanged(this));
    return Ok(undefined);
  }

  public setStartsAt(
    newStartsAt: Date
  ): Result<void, MeetingAlreadyStarted | MeetingStartingDateInvalid> {
    if (this.props.startsAt <= new Date()) return Err(MeetingAlreadyStarted.create());
    if (newStartsAt <= new Date()) return Err(MeetingStartingDateInvalid.create());
    this.props.startsAt = newStartsAt;
    this.registerIdempotentEvent(new MeetingChanged(this));
    return Ok(undefined);
  }

  public setAddress(
    newAddress: MeetingAddress
  ): Result<void, MeetingAlreadyStarted | RemoteMeetingCannotHaveAddress> {
    if (this.props.startsAt <= new Date()) return Err(MeetingAlreadyStarted.create());
    if (this.isRemote) return Err(RemoteMeetingCannotHaveAddress.create());
    this.props.address = newAddress;
    this.registerIdempotentEvent(new MeetingChanged(this));
    return Ok(undefined);
  }

  private async calculateRemainingSeats(): Promise<
    Result<void, ValidationError | UnexpectedError>
  > {
    const remainingOrError = await MeetingRemainingSeats.create(
      this.availableSeats.value - this.attendees.count
    );
    if (remainingOrError.isErr()) return Err(remainingOrError.unwrapErr());
    this.props.remainingSeats = remainingOrError.unwrap();
    return Ok(undefined);
  }
}
