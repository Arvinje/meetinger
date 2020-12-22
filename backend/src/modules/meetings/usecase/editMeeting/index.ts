/* eslint-disable no-new */
import 'source-map-support/register';
import DDBConfig from '@src/shared/infra/dynamodb/dynamodb';
import { DynamoDBMeetingRepo } from '@meetings/repos/implementations/DynamoDBMeetingRepo';
import { APIGatewayWithAuthorizerHandler } from '@src/shared/infra/http/types';
import { SNSBroker, SNSConfig } from '@src/shared/infra/brokers/SNSBroker';
import { OnMeetingChanged } from '@meetings/listeners/OnMeetingChanged';
import { EditMeetingUseCase } from './EditMeetingUseCase';
import { EditMeetingController } from './EditMeetingController';

// Infra
const broker = new SNSBroker(SNSConfig);

// Repositories
const meetingRepo = new DynamoDBMeetingRepo(DDBConfig);

// Use Cases
const editMeetingUseCase = new EditMeetingUseCase(meetingRepo);

// Subscriptions
new OnMeetingChanged(broker).subscribe();

// Controller
const controller = new EditMeetingController(editMeetingUseCase);

export const handler: APIGatewayWithAuthorizerHandler = async (event) => controller.execute(event);
