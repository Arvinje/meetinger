import 'source-map-support/register';
import DDBConfig from '@src/shared/infra/dynamodb/dynamodb';
import { DynamoDBMeetingRepo } from '@meetings/repos/implementations/DynamoDBMeetingRepo';
import { APIGatewayWithAuthorizerHandler } from '@src/shared/infra/http/types';
import { OnAttendeeJoined } from '@meetings/listeners/OnAttendeeJoined';
import { OnMeetingCreated } from '@meetings/listeners/OnMeetingCreated';
import { SNSBroker, SNSConfig } from '@src/shared/infra/brokers/SNSBroker';
import { JoinMeetingUseCase } from './JoinMeetingUseCase';
import { JoinMeetingController } from './JoinMeetingController';

// Infra
const broker = new SNSBroker(SNSConfig);

// Repositories
const meetingRepo = new DynamoDBMeetingRepo(DDBConfig);

// Use Cases
const usecase = new JoinMeetingUseCase(meetingRepo);

// Subscriptions
new OnMeetingCreated(broker).subscribe();
new OnAttendeeJoined(broker).subscribe();

// Controller
const controller = new JoinMeetingController(usecase);

export const handler: APIGatewayWithAuthorizerHandler = async (event) => controller.execute(event);
