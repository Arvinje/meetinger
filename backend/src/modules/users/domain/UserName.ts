import Joi from 'joi';
import { Result, Ok, Err } from '@hqoss/monads';
import { ValidationError, InternalError } from '@src/utils/errors';
import { ValueObject } from '@src/shared/domain/valueObject';

interface UserNameProps {
  username: string;
}

type Response = Result<UserName, ValidationError>;

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
      if (error instanceof Joi.ValidationError) return Err(new ValidationError(error.message));
      return Err(new InternalError('unknown error detected', error));
    }
  }
}
