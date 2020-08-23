import Joi from 'joi';
import { Result, Ok, Err } from '@hqoss/monads';
import { ValidationError, InternalError } from '@src/utils/errors';
import { ValueObject } from '@src/shared/domain/valueObject';

interface UserFullNameProps {
  fullName: string;
}

type Response = Result<UserFullName, ValidationError>;

const schema = Joi.string().required().min(0).max(300);

export class UserFullName extends ValueObject<UserFullNameProps> {
  get value(): string {
    return this.props.fullName;
  }

  // eslint-disable-next-line no-useless-constructor
  private constructor(props: UserFullNameProps) {
    super(props);
  }

  public static async create(props: UserFullNameProps): Promise<Response> {
    try {
      await schema.validateAsync(props.fullName);
      return Ok(new UserFullName(props));
    } catch (error) {
      if (error instanceof Joi.ValidationError) return Err(new ValidationError(error.message));
      return Err(new InternalError('unknown error detected', error));
    }
  }
}
