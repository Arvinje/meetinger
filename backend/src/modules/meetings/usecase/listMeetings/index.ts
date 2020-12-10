import 'source-map-support/register';
import DDBConfig from '@src/shared/infra/dynamodb/dynamodb';
import { APIGatewayWithAuthorizerHandler } from '@src/shared/infra/http/types';
import { DynamoDBMeetingRepo } from '@meetings/repos/implementations/DynamoDBMeetingRepo';
import { ListMeetingsUseCase } from './ListMeetingsUseCase';
import { ListMeetingsController } from './GetMeetingController';

const meetingRepo = new DynamoDBMeetingRepo(DDBConfig);
const usecase = new ListMeetingsUseCase(meetingRepo);
const controller = new ListMeetingsController(usecase);

export const handler: APIGatewayWithAuthorizerHandler = async (event) => controller.execute(event);
