import 'source-map-support/register';
import { CognitoUserPoolTriggerHandler } from 'aws-lambda';
import DDBConfig from '@src/shared/infra/dynamodb/dynamodb';
import { CreateUserRequest } from '@users/usecase/createUser/CreateUserRequest';
import { DynamoDBUserRepo } from '@src/modules/users/repos/implementations/DynamoDBUserRepo';
import { CreateUserUseCase } from '@src/modules/users/usecase/createUser/CreateUserUseCase';
import { InternalError } from '@src/utils/errors';

const userRepo = new DynamoDBUserRepo(DDBConfig);
const userUseCase = new CreateUserUseCase(userRepo);

export const handle: CognitoUserPoolTriggerHandler = async (event) => {
  const userDTO: CreateUserRequest = {
    username: event.userName,
    email: event.request.userAttributes.email,
  };

  const result = await userUseCase.execute(userDTO);
  if (result.isErr()) {
    const error = result.unwrapErr();
    // eslint-disable-next-line no-console
    console.error(error);
    return new InternalError('failed to sign up');
  }
  return event;
};
