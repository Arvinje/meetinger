import { DynamoDBError, InternalError, ValidationError } from '@src/utils/errors';
import { Result } from '@hqoss/monads';

interface NewMeetingCreated {
  id: string;
}

export type Response = Result<NewMeetingCreated, DynamoDBError | ValidationError | InternalError>;
