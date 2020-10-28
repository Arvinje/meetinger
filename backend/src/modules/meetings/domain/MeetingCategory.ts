import Joi from 'joi';
import { Result, Ok, Err } from '@hqoss/monads';
import { ValueObject } from '@src/shared/domain/valueObject';
import { UnexpectedError, ValidationError } from '@src/shared/core/AppError';

interface MeetingCategoryProps {
  category: string;
}

type Response = Result<MeetingCategory, ValidationError | UnexpectedError>;

const supportedCategories = ['Social', 'Technology'];

const schema = Joi.string()
  .required()
  .valid(...supportedCategories);

export class MeetingCategory extends ValueObject<MeetingCategoryProps> {
  get value(): string {
    return this.props.category;
  }

  // eslint-disable-next-line no-useless-constructor
  private constructor(props: MeetingCategoryProps) {
    super(props);
  }

  public static async create(category: string): Promise<Response> {
    try {
      await schema.validateAsync(category);
      return Ok(new MeetingCategory({ category }));
    } catch (error) {
      if (error instanceof Joi.ValidationError)
        return Err(ValidationError.wrap(error, error.message));
      return Err(
        UnexpectedError.wrap(error, 'Unexpected error when creating an instance of MeetingCategory')
      );
    }
  }
}
