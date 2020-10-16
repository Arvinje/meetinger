import Joi from 'joi';
import { ValueObject } from '@src/shared/domain/valueObject';
import { Result, Ok, Err } from '@hqoss/monads';
import { UnexpectedError, ValidationError } from '@src/shared/core/AppError';

interface MeetingAvailableSeatsProps {
  availableSeats: number;
}

type Response = Result<MeetingAvailableSeats, ValidationError | UnexpectedError>;

const schema = Joi.number().required().integer().min(1);

export class MeetingAvailableSeats extends ValueObject<MeetingAvailableSeatsProps> {
  get value(): number {
    return this.props.availableSeats;
  }

  // eslint-disable-next-line no-useless-constructor
  private constructor(props: MeetingAvailableSeatsProps) {
    super(props);
  }

  public static async create(availableSeats: number): Promise<Response> {
    try {
      await schema.validateAsync(availableSeats);
      return Ok(new MeetingAvailableSeats({ availableSeats }));
    } catch (error) {
      if (error instanceof Joi.ValidationError)
        return Err(ValidationError.wrap(error, error.message));
      return Err(
        UnexpectedError.wrap(
          error,
          'Unexpected error when creating an instance of MeetingAvailableSeats'
        )
      );
    }
  }
}
