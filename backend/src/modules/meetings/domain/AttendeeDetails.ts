import { Result, Ok } from '@hqoss/monads';
import { ValueObject } from '@src/shared/domain/valueObject';

export interface AttendeeDetailsProps {
  username: string;
  fullName: string;
  isOrganizer: boolean;
}

export class AttendeeDetails extends ValueObject<AttendeeDetailsProps> {
  get username(): string {
    return this.props.username;
  }

  get fullName(): string {
    return this.props.fullName;
  }

  get isOrganizer(): boolean {
    return this.props.isOrganizer;
  }

  // eslint-disable-next-line no-useless-constructor
  private constructor(props: AttendeeDetailsProps) {
    super(props);
  }

  public static create(props: AttendeeDetailsProps): Result<AttendeeDetails, void> {
    const defaultProps: AttendeeDetailsProps = {
      ...props,
      isOrganizer: props.isOrganizer || false,
    };
    const meeting = new AttendeeDetails(defaultProps);
    return Ok(meeting);
  }
}
