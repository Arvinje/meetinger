import Joi from 'joi';
import { ValueObject } from '@src/shared/domain/valueObject';
import { ValidationError, InternalError } from '@src/utils/errors';
import { Result, Ok, Err } from '@hqoss/monads';

interface MeetingTitleProps {
  title: string;
}

type Response = Result<MeetingTitle, ValidationError>;

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
      if (error instanceof Joi.ValidationError) return Err(new ValidationError(error.message));
      return Err(new InternalError('unknown error detected', error));
    }
  }
}
