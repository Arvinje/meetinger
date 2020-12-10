import 'source-map-support/register';
import DDBConfig from '@src/shared/infra/dynamodb/dynamodb';
import { APIGatewayWithAuthorizerHandler } from '@src/shared/infra/http/types';
import { DynamoDBMeetingRepo } from '@meetings/repos/implementations/DynamoDBMeetingRepo';
import { DynamoDBAttendeeRepo } from '@meetings/repos/implementations/DynamoDBAttendeeRepo';
import { LeaveMeetingUseCase } from './LeaveMeetingUseCase';
import { LeaveMeetingController } from './LeaveMeetingController';

const meetingRepo = new DynamoDBMeetingRepo(DDBConfig);
const attendeeRepo = new DynamoDBAttendeeRepo(DDBConfig);
const usecase = new LeaveMeetingUseCase(meetingRepo, attendeeRepo);
const controller = new LeaveMeetingController(usecase);

export const handler: APIGatewayWithAuthorizerHandler = async (event) => controller.execute(event);
