import 'source-map-support/register';
import DDBConfig from '@src/shared/infra/dynamodb/dynamodb';
import { APIGatewayWithAuthorizerHandler } from '@src/shared/infra/http/types';
import { DynamoDBConnectionRepo } from '@connection/repos/implementations/dynamoDBConnectionRepo';
import { CreateConnectionUseCase } from './CreateConnectionUseCase';
import { CreateConnectionController } from './CreateConnectionController';

const connectionRepo = new DynamoDBConnectionRepo(DDBConfig);
const usecase = new CreateConnectionUseCase(connectionRepo);
const controller = new CreateConnectionController(usecase);

export const handler: APIGatewayWithAuthorizerHandler = async (event) => controller.execute(event);
