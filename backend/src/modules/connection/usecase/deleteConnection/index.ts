import 'source-map-support/register';
import DDBConfig from '@src/shared/infra/dynamodb/dynamodb';
import { APIGatewayWithAuthorizerHandler } from '@src/shared/infra/http/types';
import { DynamoDBConnectionRepo } from '@connection/repos/implementations/dynamoDBConnectionRepo';
import { DeleteConnectionUseCase } from './DeleteConnectionUseCase';
import { DeleteConnectionController } from './DeleteConnectionController';

const connectionRepo = new DynamoDBConnectionRepo(DDBConfig);
const usecase = new DeleteConnectionUseCase(connectionRepo);
const controller = new DeleteConnectionController(usecase);

export const handler: APIGatewayWithAuthorizerHandler = async (event) => controller.execute(event);
