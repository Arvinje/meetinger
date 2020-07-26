import { DynamoDBError } from '@src/utils/errors';
import { Result } from '@hqoss/monads';

export type Response = Result<void, DynamoDBError>
