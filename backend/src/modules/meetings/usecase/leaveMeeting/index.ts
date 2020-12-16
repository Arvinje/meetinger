import 'source-map-support/register';
import DDBConfig from '@src/shared/infra/dynamodb/dynamodb';
import { APIGatewayWithAuthorizerHandler } from '@src/shared/infra/http/types';
import { DynamoDBMeetingRepo } from '@meetings/repos/implementations/DynamoDBMeetingRepo';
import { DynamoDBAttendeeRepo } from '@meetings/repos/implementations/DynamoDBAttendeeRepo';
import { OnMeetingCreated } from '@meetings/listeners/OnMeetingCreated';
import { SNSBroker, SNSConfig } from '@src/shared/infra/brokers/SNSBroker';
import { OnAttendeeLeft } from '@meetings/listeners/OnAttendeeLeft';
import { LeaveMeetingUseCase } from './LeaveMeetingUseCase';
import { LeaveMeetingController } from './LeaveMeetingController';

// Infra
const broker = new SNSBroker(SNSConfig);

// Repositories
const meetingRepo = new DynamoDBMeetingRepo(DDBConfig);
const attendeeRepo = new DynamoDBAttendeeRepo(DDBConfig);

// Use Cases
const usecase = new LeaveMeetingUseCase(meetingRepo, attendeeRepo);

// Subscriptions
new OnMeetingCreated(broker).subscribe();
new OnAttendeeLeft(broker).subscribe();

// Controller
const controller = new LeaveMeetingController(usecase);

export const handler: APIGatewayWithAuthorizerHandler = async (event) => controller.execute(event);
