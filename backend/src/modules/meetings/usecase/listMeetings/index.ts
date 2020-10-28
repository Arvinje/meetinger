import 'source-map-support/register';
import DDBConfig from '@src/shared/infra/dynamodb/dynamodb';
import { DynamoDBMeetingRepo } from '@src/modules/meetings/repos/implementations/DynamoDBMeetingRepo';
import { APIGatewayWithAuthorizerHandler } from '@src/shared/infra/http/types';
import { ListMeetingsUseCase } from './ListMeetingsUseCase';
import { ListMeetingsController } from './GetMeetingController';

const meetingRepo = new DynamoDBMeetingRepo(DDBConfig);
const usecase = new ListMeetingsUseCase(meetingRepo);
const controller = new ListMeetingsController(usecase);

export const handler: APIGatewayWithAuthorizerHandler = async (event) => controller.execute(event);
