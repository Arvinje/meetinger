import Joi from 'joi';
import { Result, Ok, Err } from '@hqoss/monads';
import { ValueObject } from '@src/shared/domain/valueObject';
import { UnexpectedError, ValidationError } from '@src/shared/core/AppError';

interface UserFullNameProps {
  fullName: string;
}

type Response = Result<UserFullName, ValidationError | UnexpectedError>;

const schema = Joi.string().required().min(0).max(300);

export class UserFullName extends ValueObject<UserFullNameProps> {
  get value(): string {
    return this.props.fullName;
  }

  // eslint-disable-next-line no-useless-constructor
  private constructor(props: UserFullNameProps) {
    super(props);
  }

  public static async create(fullName: string): Promise<Response> {
    try {
      await schema.validateAsync(fullName);
      return Ok(new UserFullName({ fullName }));
    } catch (error) {
      if (error instanceof Joi.ValidationError)
        return Err(ValidationError.wrap(error, error.message));
      return Err(
        UnexpectedError.wrap(error, 'Unexpected error when creating an instance of UserName')
      );
    }
  }
}
