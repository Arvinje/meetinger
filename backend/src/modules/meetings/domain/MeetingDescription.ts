import Joi from 'joi';
import { ValueObject } from '@src/shared/domain/valueObject';
import { ValidationError, InternalError } from '@src/utils/errors';
import { Result, Ok, Err } from '@hqoss/monads';

interface MeetingDescriptionProps {
  description: string;
}

type Response = Result<MeetingDescription, ValidationError>;

const schema = Joi.string().required().min(3).max(2000);

export class MeetingDescription extends ValueObject<MeetingDescriptionProps> {
  get value(): string {
    return this.props.description;
  }

  // eslint-disable-next-line no-useless-constructor
  private constructor(props: MeetingDescriptionProps) {
    super(props);
  }

  public static async create(description: string): Promise<Response> {
    try {
      await schema.validateAsync(description);
      return Ok(new MeetingDescription({ description }));
    } catch (error) {
      if (error instanceof Joi.ValidationError) return Err(new ValidationError(error.message));
      return Err(new InternalError('unknown error detected', error));
    }
  }
}
