import { ValueObject } from '@src/shared/domain/valueObject';

export interface RegisteredMeetingViewProps {
  id: string;
  title: string;
  startsAt: Date;
  organizedByMe: boolean;
}

export class RegisteredMeetingView extends ValueObject<RegisteredMeetingViewProps> {
  get id(): string {
    return this.props.id;
  }

  get title(): string {
    return this.props.title;
  }

  get startsAt(): Date {
    return this.props.startsAt;
  }

  get organizedByMe(): boolean {
    return this.props.organizedByMe;
  }

  // eslint-disable-next-line no-useless-constructor
  private constructor(props: RegisteredMeetingViewProps) {
    super(props);
  }

  public static create(props: RegisteredMeetingViewProps): RegisteredMeetingView {
    return new RegisteredMeetingView(props);
  }
}
