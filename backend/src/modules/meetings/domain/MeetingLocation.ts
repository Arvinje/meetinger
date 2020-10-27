import Joi from 'joi';
import { ValueObject } from '@src/shared/domain/valueObject';
import { Result, Ok, Err } from '@hqoss/monads';
import { UnexpectedError, ValidationError } from '@src/shared/core/AppError';

interface MeetingLocationProps {
  location: string;
}

type Response = Result<MeetingLocation, ValidationError | UnexpectedError>;

const supportedLocations = ['Finland, Tampere', 'Finland, Helsinki'];

const schema = Joi.string()
  .required()
  .valid(...supportedLocations);

export class MeetingLocation extends ValueObject<MeetingLocationProps> {
  get value(): string {
    return this.props.location;
  }

  // eslint-disable-next-line no-useless-constructor
  private constructor(props: MeetingLocationProps) {
    super(props);
  }

  public static async create(location: string): Promise<Response> {
    try {
      await schema.validateAsync(location);
      return Ok(new MeetingLocation({ location }));
    } catch (error) {
      if (error instanceof Joi.ValidationError)
        return Err(ValidationError.wrap(error, error.message));
      return Err(
        UnexpectedError.wrap(error, 'Unexpected error when creating an instance of MeetingLocation')
      );
    }
  }
}
