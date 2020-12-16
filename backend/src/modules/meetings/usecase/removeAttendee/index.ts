import 'source-map-support/register';
import DDBConfig from '@src/shared/infra/dynamodb/dynamodb';
import { DynamoDBAttendeeRepo } from '@meetings/repos/implementations/DynamoDBAttendeeRepo';
import { SNSHandler } from 'aws-lambda';
import { RemoveAttendeeUseCase } from './RemoveAttendeeUseCase';
import { RemoveAttendeeController } from './RemoveAttendeeController';

// Repositories
const attendeeRepo = new DynamoDBAttendeeRepo(DDBConfig);

// Use Cases
const usecase = new RemoveAttendeeUseCase(attendeeRepo);

// Controller
const controller = new RemoveAttendeeController(usecase);

export const handler: SNSHandler = async (event) => controller.execute(event);
