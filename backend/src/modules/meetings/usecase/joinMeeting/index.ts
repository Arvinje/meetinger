import 'source-map-support/register';
import DDBConfig from '@src/shared/infra/dynamodb/dynamodb';
import { DynamoDBUserRepo } from '@users/repos/implementations/DynamoDBUserRepo';
import { DynamoDBMeetingRepo } from '@src/modules/meetings/repos/implementations/DynamoDBMeetingRepo';
import { APIGatewayWithAuthorizerHandler } from '@src/shared/infra/http/types';
import { DynamoDBAttendeeRepo } from '@meetings/repos/implementations/DynamoDBAttendeeRepo';
import { JoinMeetingUseCase } from './JoinMeetingUseCase';
import { JoinMeetingController } from './JoinMeetingController';

const meetingRepo = new DynamoDBMeetingRepo(DDBConfig);
const attendeeRepo = new DynamoDBAttendeeRepo(DDBConfig);
const userRepo = new DynamoDBUserRepo(DDBConfig);
const usecase = new JoinMeetingUseCase(meetingRepo, attendeeRepo, userRepo);
const controller = new JoinMeetingController(usecase);

export const handler: APIGatewayWithAuthorizerHandler = async (event) => controller.execute(event);
