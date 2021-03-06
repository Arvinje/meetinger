import Joi from 'joi';
import { Result, Ok, Err } from '@hqoss/monads';
import { ValueObject } from '@src/shared/domain/valueObject';
import { ValidationError, UnexpectedError } from '@src/shared/core/AppError';

interface UserNameProps {
  username: string;
}

type Response = Result<UserName, ValidationError | UnexpectedError>;

const schema = Joi.string().required().token().max(40).lowercase();

export class UserName extends ValueObject<UserNameProps> {
  get value(): string {
    return this.props.username;
  }

  // eslint-disable-next-line no-useless-constructor
  private constructor(props: UserNameProps) {
    super(props);
  }

  public static async create(username: string): Promise<Response> {
    try {
      const validUsername = await schema.validateAsync(username, { convert: true });
      return Ok(new UserName({ username: validUsername }));
    } catch (error) {
      if (error instanceof Joi.ValidationError)
        return Err(ValidationError.wrap(error, error.message));
      return Err(
        UnexpectedError.wrap(error, 'Unexpected error when creating an instance of UserName')
      );
    }
  }
}
