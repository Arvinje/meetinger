import { Entity } from '@src/shared/domain/entity';
import { UniqueID } from '@src/shared/domain/uniqueId';
import { Result, Ok, Err } from '@hqoss/monads';
import { UserName } from '@users/domain/UserName';
import { MeetingID } from './MeetingID';
import { MeetingTitle } from './MeetingTitle';
import { MeetingDescription } from './MeetingDescription';
import { MeetingRemainingSeats } from './MeetingRemainingSeats';
import { MeetingAvailableSeats } from './MeetingAvailableSeats';
import { MeetingLocation } from './MeetingLocation';
import { MeetingCategory } from './MeetingCategory';
import { MeetingFullyBooked } from '../errors/MeetingErrors';

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
    return Ok(meeting);
  }

  public updateRemainingSeats(rs: MeetingRemainingSeats): Result<void, MeetingFullyBooked> {
    if (rs.value > this.availableSeats.value) return Err(MeetingFullyBooked.create());
    this.props.remainingSeats = rs;
    return Ok(undefined);
  }
}
