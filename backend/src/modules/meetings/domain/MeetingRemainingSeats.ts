import Joi from 'joi';
import { ValueObject } from '@src/shared/domain/valueObject';
import { Result, Ok, Err } from '@hqoss/monads';
import { UnexpectedError, ValidationError } from '@src/shared/core/AppError';

interface MeetingRemainingSeatsProps {
  remainingSeats: number;
}

type Response = Result<MeetingRemainingSeats, ValidationError | UnexpectedError>;

const schema = Joi.number().required().integer().min(0);

export class MeetingRemainingSeats extends ValueObject<MeetingRemainingSeatsProps> {
  get value(): number {
    return this.props.remainingSeats;
  }

  // eslint-disable-next-line no-useless-constructor
  private constructor(props: MeetingRemainingSeatsProps) {
    super(props);
  }

  public static async create(remainingSeats: number): Promise<Response> {
    try {
      await schema.validateAsync(remainingSeats);
      return Ok(new MeetingRemainingSeats({ remainingSeats }));
    } catch (error) {
      if (error instanceof Joi.ValidationError)
        return Err(ValidationError.wrap(error, error.message));
      return Err(
        UnexpectedError.wrap(
          error,
          'Unexpected error when creating an instance of MeetingRemainingSeats'
        )
      );
    }
  }

  public async add(count: number): Promise<Response> {
    return MeetingRemainingSeats.create(this.props.remainingSeats + count);
  }

  public async subtract(count: number): Promise<Response> {
    return MeetingRemainingSeats.create(this.props.remainingSeats - count);
  }
}
