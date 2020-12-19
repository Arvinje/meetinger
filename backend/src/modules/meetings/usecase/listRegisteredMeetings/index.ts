import 'source-map-support/register';
import DDBConfig from '@src/shared/infra/dynamodb/dynamodb';
import { APIGatewayWithAuthorizerHandler } from '@src/shared/infra/http/types';
import { DynamoDBMeetingRepo } from '@meetings/repos/implementations/DynamoDBMeetingRepo';
import { ListRegisteredMeetingsUseCase } from './ListRegisteredMeetingsUseCase';
import { ListRegisteredMeetingsController } from './ListRegisteredMeetingsController';

// Repositories
const meetingRepo = new DynamoDBMeetingRepo(DDBConfig);

// Use Cases
const usecase = new ListRegisteredMeetingsUseCase(meetingRepo);

// Controller
const controller = new ListRegisteredMeetingsController(usecase);

export const handler: APIGatewayWithAuthorizerHandler = async (event) => controller.execute(event);
