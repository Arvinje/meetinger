import Joi from 'joi';
import { Result, Ok, Err } from '@hqoss/monads';
import { ValueObject } from '@src/shared/domain/valueObject';
import { UnexpectedError, ValidationError } from '@src/shared/core/AppError';

interface UserIntroductionProps {
  introduction: string;
}

type Response = Result<UserIntroduction, ValidationError | UnexpectedError>;

const schema = Joi.string().allow('').min(0).max(300);

export class UserIntroduction extends ValueObject<UserIntroductionProps> {
  get value(): string {
    return this.props.introduction;
  }

  // eslint-disable-next-line no-useless-constructor
  private constructor(props: UserIntroductionProps) {
    super(props);
  }

  public static async create(introduction: string): Promise<Response> {
    try {
      await schema.validateAsync(introduction);
      return Ok(new UserIntroduction({ introduction }));
    } catch (error) {
      if (error instanceof Joi.ValidationError)
        return Err(ValidationError.wrap(error, error.message));
      return Err(
        UnexpectedError.wrap(
          error,
          'Unexpected error when creating an instance of UserIntroduction'
        )
      );
    }
  }
}
