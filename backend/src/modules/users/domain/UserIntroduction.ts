import Joi from 'joi';
import { Result, Ok, Err } from '@hqoss/monads';
import { ValidationError, InternalError } from '@src/utils/errors';
import { ValueObject } from '@src/shared/domain/valueObject';

interface UserIntroductionProps {
  introduction: string;
}

type Response = Result<UserIntroduction, ValidationError>;

const schema = Joi.string().required().min(0).max(300);

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
      if (error instanceof Joi.ValidationError) return Err(new ValidationError(error.message));
      return Err(new InternalError('unknown error detected', error));
    }
  }
}
