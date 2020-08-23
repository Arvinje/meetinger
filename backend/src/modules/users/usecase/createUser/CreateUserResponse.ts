import { DynamoDBError, InternalError, ValidationError } from '@src/utils/errors';
import { Result } from '@hqoss/monads';

export type Response = Result<void, DynamoDBError | ValidationError | InternalError>;
