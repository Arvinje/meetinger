import Joi from 'joi';
import { ValueObject } from '@src/shared/domain/valueObject';
import { Result, Ok, Err } from '@hqoss/monads';
import { UnexpectedError, ValidationError } from '@src/shared/core/AppError';

export interface MeetingPlaceProps {
  place: string;
}

type Response = Result<MeetingPlace, ValidationError | UnexpectedError>;

export const RemoteMeetingPlace = 'Remote';
const supportedPlaces = [RemoteMeetingPlace, 'Finland, Tampere', 'Finland, Helsinki'];

const schema = Joi.string()
  .required()
  .valid(...supportedPlaces);

export class MeetingPlace extends ValueObject<MeetingPlaceProps> {
  get value(): string {
    return this.props.place;
  }

  get isRemote(): boolean {
    return this.props.place === RemoteMeetingPlace;
  }

  get isPhysical(): boolean {
    return this.props.place !== RemoteMeetingPlace;
  }

  // eslint-disable-next-line no-useless-constructor
  private constructor(props: MeetingPlaceProps) {
    super(props);
  }

  public static async create(place: string): Promise<Response> {
    try {
      await schema.validateAsync(place);
      return Ok(new MeetingPlace({ place }));
    } catch (error) {
      if (error instanceof Joi.ValidationError)
        return Err(ValidationError.wrap(error, error.message));
      return Err(
        UnexpectedError.wrap(error, 'Unexpected error when creating an instance of MeetingPlace')
      );
    }
  }
}
