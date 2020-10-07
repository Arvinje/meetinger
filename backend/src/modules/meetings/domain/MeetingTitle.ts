import Joi from 'joi';
import { ValueObject } from '@src/shared/domain/valueObject';
import { Result, Ok, Err } from '@hqoss/monads';
import { UnexpectedError, ValidationError } from '@src/shared/core/AppError';

interface MeetingTitleProps {
  title: string;
}

type Response = Result<MeetingTitle, ValidationError | UnexpectedError>;

const schema = Joi.string().required().min(3).max(50);

export class MeetingTitle extends ValueObject<MeetingTitleProps> {
  get value(): string {
    return this.props.title;
  }

  // eslint-disable-next-line no-useless-constructor
  private constructor(props: MeetingTitleProps) {
    super(props);
  }

  public static async create(title: string): Promise<Response> {
    try {
      await schema.validateAsync(title);
      return Ok(new MeetingTitle({ title }));
    } catch (error) {
      if (error instanceof Joi.ValidationError)
        return Err(ValidationError.wrap(error, error.message));
      return Err(
        UnexpectedError.wrap(error, 'Unexpected error when creating an instance of MeetingTitle')
      );
    }
  }
}
