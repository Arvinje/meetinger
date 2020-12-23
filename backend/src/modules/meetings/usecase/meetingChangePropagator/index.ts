import 'source-map-support/register';
import DDBConfig from '@src/shared/infra/dynamodb/dynamodb';
import { DynamoDBMeetingRepo } from '@meetings/repos/implementations/DynamoDBMeetingRepo';
import { DynamoDBAttendeeRepo } from '@meetings/repos/implementations/DynamoDBAttendeeRepo';
import { SNSHandler } from 'aws-lambda';
import { MeetingChangePropagatorUseCase } from './MeetingChangePropagatorUseCase';
import { MeetingChangePropagatorController } from './MeetingChangePropagatorController';

// Repositories
const meetingRepo = new DynamoDBMeetingRepo(DDBConfig);
const attendeeRepo = new DynamoDBAttendeeRepo(DDBConfig);

// Use Cases
const usecase = new MeetingChangePropagatorUseCase(meetingRepo, attendeeRepo);

// Controller
const controller = new MeetingChangePropagatorController(usecase);

export const handler: SNSHandler = async (event) => controller.execute(event);
