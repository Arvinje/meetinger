import 'source-map-support/register';
import DDBConfig from '@src/shared/infra/dynamodb/dynamodb';
import { APIGatewayWithAuthorizerHandler } from '@src/shared/infra/http/types';
import { DynamoDBAttendeeRepo } from '@meetings/repos/implementations/DynamoDBAttendeeRepo';
import { GetAttendanceUseCase } from './GetAttendanceUseCase';
import { GetAttendanceController } from './GetAttendanceController';

const attendeeRepo = new DynamoDBAttendeeRepo(DDBConfig);
const usecase = new GetAttendanceUseCase(attendeeRepo);
const controller = new GetAttendanceController(usecase);

export const handler: APIGatewayWithAuthorizerHandler = async (event) => controller.execute(event);
