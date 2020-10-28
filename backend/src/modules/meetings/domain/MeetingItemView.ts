import { Result, Ok } from '@hqoss/monads';
import { ValueObject } from '@src/shared/domain/valueObject';

export interface MeetingItemViewProps {
  id: string;
  title: string;
  category: string;
  startsAt: Date;
  remainingSeats: number;
  availableSeats: number;
}

export class MeetingItemView extends ValueObject<MeetingItemViewProps> {
  get id(): string {
    return this.props.id;
  }

  get title(): string {
    return this.props.title;
  }

  get category(): string {
    return this.props.category;
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

  // eslint-disable-next-line no-useless-constructor
  private constructor(props: MeetingItemViewProps) {
    super(props);
  }

  public static create(props: MeetingItemViewProps): Result<MeetingItemView, void> {
    const meeting = new MeetingItemView(props);
    return Ok(meeting);
  }
}
