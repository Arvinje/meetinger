import 'source-map-support/register';
import DDBConfig from '@src/shared/infra/dynamodb/dynamodb';
import { DynamoDBMeetingRepo } from '@meetings/repos/implementations/DynamoDBMeetingRepo';
import { APIGatewayWithAuthorizerHandler } from '@src/shared/infra/http/types';
import { DynamoDBAttendeeRepo } from '@meetings/repos/implementations/DynamoDBAttendeeRepo';
import { GetMeetingUseCase } from './GetMeetingUseCase';
import { GetMeetingController } from './GetMeetingController';

const meetingRepo = new DynamoDBMeetingRepo(DDBConfig);
const attendeeRepo = new DynamoDBAttendeeRepo(DDBConfig);
const usecase = new GetMeetingUseCase(meetingRepo, attendeeRepo);
const controller = new GetMeetingController(usecase);

export const handler: APIGatewayWithAuthorizerHandler = async (event) => controller.execute(event);
