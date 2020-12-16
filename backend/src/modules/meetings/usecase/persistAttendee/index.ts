import 'source-map-support/register';
import DDBConfig from '@src/shared/infra/dynamodb/dynamodb';
import { DynamoDBMeetingRepo } from '@meetings/repos/implementations/DynamoDBMeetingRepo';
import { DynamoDBAttendeeRepo } from '@meetings/repos/implementations/DynamoDBAttendeeRepo';
import { SNSHandler } from 'aws-lambda';
import { DynamoDBUserRepo } from '@src/modules/users/repos/implementations/DynamoDBUserRepo';
import { PersistAttendeeUseCase } from './PersistAttendeeUseCase';
import { PersistAttendeeController } from './PersistAttendeeController';

// Repositories
const meetingRepo = new DynamoDBMeetingRepo(DDBConfig);
const userRepo = new DynamoDBUserRepo(DDBConfig);
const attendeeRepo = new DynamoDBAttendeeRepo(DDBConfig);

// Use Cases
const usecase = new PersistAttendeeUseCase(meetingRepo, userRepo, attendeeRepo);

// Controller
const controller = new PersistAttendeeController(usecase);

export const handler: SNSHandler = async (event) => controller.execute(event);
