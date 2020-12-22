import Joi from 'joi';
import { ValueObject } from '@src/shared/domain/valueObject';
import { Result, Ok, Err } from '@hqoss/monads';
import { UnexpectedError, ValidationError } from '@src/shared/core/AppError';

interface MeetingAddressProps {
  address: string;
}

type Response = Result<MeetingAddress, ValidationError | UnexpectedError>;

const schema = Joi.string().required().max(400);

export class MeetingAddress extends ValueObject<MeetingAddressProps> {
  get value(): string {
    return this.props.address;
  }

  // eslint-disable-next-line no-useless-constructor
  private constructor(props: MeetingAddressProps) {
    super(props);
  }

  public static async create(address: string): Promise<Response> {
    try {
      await schema.validateAsync(address);
      return Ok(new MeetingAddress({ address }));
    } catch (error) {
      if (error instanceof Joi.ValidationError)
        return Err(ValidationError.wrap(error, error.message));
      return Err(
        UnexpectedError.wrap(error, 'Unexpected error when creating an instance of MeetingAddress')
      );
    }
  }
}
