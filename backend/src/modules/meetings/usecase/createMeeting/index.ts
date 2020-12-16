/* eslint-disable no-new */
import 'source-map-support/register';
import DDBConfig from '@src/shared/infra/dynamodb/dynamodb';
import { DynamoDBMeetingRepo } from '@meetings/repos/implementations/DynamoDBMeetingRepo';
import { APIGatewayWithAuthorizerHandler } from '@src/shared/infra/http/types';
import { OnMeetingCreated } from '@meetings/listeners/OnMeetingCreated';
import { OnAttendeeJoined } from '@meetings/listeners/OnAttendeeJoined';
import { SNSBroker, SNSConfig } from '@src/shared/infra/brokers/SNSBroker';
import { CreateMeetingUseCase } from './CreateMeetingUseCase';
import { CreateMeetingController } from './CreateMeetingController';

// Infra
const broker = new SNSBroker(SNSConfig);

// Repositories
const meetingRepo = new DynamoDBMeetingRepo(DDBConfig);

// Use Cases
const createMeetingUseCase = new CreateMeetingUseCase(meetingRepo);

// Subscriptions
new OnMeetingCreated(broker).subscribe();
new OnAttendeeJoined(broker).subscribe();

// Controller
const controller = new CreateMeetingController(createMeetingUseCase);

export const handler: APIGatewayWithAuthorizerHandler = async (event) => controller.execute(event);
