import { Result, Ok } from '@hqoss/monads';
import { ValueObject } from '@src/shared/domain/valueObject';
import { AttendeeDetails } from './AttendeeDetails';

export interface MeetingViewProps {
  id: string;
  title: string;
  description: string;
  startsAt: Date;
  remainingSeats: number;
  availableSeats: number;
  createdBy: string;
  attendees?: AttendeeDetails[];
}

export class MeetingView extends ValueObject<MeetingViewProps> {
  get id(): string {
    return this.props.id;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string {
    return this.props.description;
  }

  get startsAt(): Date {
    return this.props.startsAt;
  }

  get remainingSeats(): number {
    return this.props.remainingSeats;
  }

  get availableSeats(): number {
    return this.props.availableSeats;
  }

  get createdBy(): string {
    return this.props.createdBy;
  }

  get attendees(): AttendeeDetails[] {
    return this.props.attendees;
  }

  // eslint-disable-next-line no-useless-constructor
  private constructor(props: MeetingViewProps) {
    super(props);
  }

  public static create(props: MeetingViewProps): Result<MeetingView, void> {
    const defaultProps: MeetingViewProps = {
      ...props,
      attendees: props.attendees || [],
    };
    const meeting = new MeetingView(defaultProps);
    return Ok(meeting);
  }
}
