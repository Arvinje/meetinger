import Joi from 'joi';
import { Result, Ok, Err } from '@hqoss/monads';
import { ValueObject } from '@src/shared/domain/valueObject';
import { UnexpectedError, ValidationError } from '@src/shared/core/AppError';

interface UserEmailProps {
  email: string;
}

type Response = Result<UserEmail, ValidationError | UnexpectedError>;

const schema = Joi.string().required().email().lowercase();

export class UserEmail extends ValueObject<UserEmailProps> {
  get value(): string {
    return this.props.email;
  }

  // eslint-disable-next-line no-useless-constructor
  private constructor(props: UserEmailProps) {
    super(props);
  }

  public static async create(email: string): Promise<Response> {
    try {
      const validEmail = await schema.validateAsync(email, { convert: true });
      return Ok(new UserEmail({ email: validEmail }));
    } catch (error) {
      if (error instanceof Joi.ValidationError)
        return Err(ValidationError.wrap(error, error.message));
      return Err(
        UnexpectedError.wrap(error, 'Unexpected error when creating an instance of UserEmail')
      );
    }
  }
}
