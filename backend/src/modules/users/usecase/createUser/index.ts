import 'source-map-support/register';
import { CognitoUserPoolTriggerHandler } from 'aws-lambda';
import DDBConfig from '@src/shared/infra/dynamodb/dynamodb';
import { DynamoDBUserRepo } from '@users/repos/implementations/DynamoDBUserRepo';
import { CreateUserUseCase } from '@users/usecase/createUser/CreateUserUseCase';
import { CreateUserController } from './CreateUserController';

const userRepo = new DynamoDBUserRepo(DDBConfig);
const useCase = new CreateUserUseCase(userRepo);
const controller = new CreateUserController(useCase);

export const handler: CognitoUserPoolTriggerHandler = async (event) => controller.execute(event);
