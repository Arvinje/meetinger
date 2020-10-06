import 'source-map-support/register';
import DDBConfig from '@src/shared/infra/dynamodb/dynamodb';
import { DynamoDBUserRepo } from '@users/repos/implementations/DynamoDBUserRepo';
import { DynamoDBMeetingRepo } from '@src/modules/meetings/repos/implementations/DynamoDBMeetingRepo';
import { APIGatewayWithAuthorizerHandler } from '@src/shared/infra/http/types';
import { CreateMeetingUseCase } from './CreateMeetingUseCase';
import { CreateMeetingController } from './CreateMeetingController';

const userRepo = new DynamoDBUserRepo(DDBConfig);
const meetingRepo = new DynamoDBMeetingRepo(DDBConfig);
const createMeetingUseCase = new CreateMeetingUseCase(userRepo, meetingRepo);
const controller = new CreateMeetingController(createMeetingUseCase);

export const handler: APIGatewayWithAuthorizerHandler = async (event) => controller.execute(event);
