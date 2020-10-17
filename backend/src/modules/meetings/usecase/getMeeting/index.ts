import 'source-map-support/register';
import DDBConfig from '@src/shared/infra/dynamodb/dynamodb';
import { DynamoDBMeetingRepo } from '@src/modules/meetings/repos/implementations/DynamoDBMeetingRepo';
import { APIGatewayWithAuthorizerHandler } from '@src/shared/infra/http/types';
import { GetMeetingUseCase } from './GetMeetingUseCase';
import { GetMeetingController } from './GetMeetingController';

const meetingRepo = new DynamoDBMeetingRepo(DDBConfig);
const usecase = new GetMeetingUseCase(meetingRepo);
const controller = new GetMeetingController(usecase);

export const handler: APIGatewayWithAuthorizerHandler = async (event) => controller.execute(event);
