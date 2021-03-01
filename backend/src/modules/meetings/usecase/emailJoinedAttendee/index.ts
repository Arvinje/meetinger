import 'source-map-support/register';
import DDBConfig from '@src/shared/infra/dynamodb/dynamodb';
import { SNSHandler } from 'aws-lambda';
import { DynamoDBUserRepo } from '@users/repos/implementations/DynamoDBUserRepo';
import { SQSConfig, SQSJobQueue } from '@src/shared/infra/queues/SQS';
import { EmailJoinedAttendeeUseCase } from './EmailJoinedAttendeeUseCase';
import { EmailJoinedAttendeeController } from './EmailJoinedAttendeeController';

// JobQueue
const sqsService = new SQSJobQueue(SQSConfig);

// Repositories
const userRepo = new DynamoDBUserRepo(DDBConfig);

// Use Cases
const usecase = new EmailJoinedAttendeeUseCase(sqsService, userRepo);

// Controller
const controller = new EmailJoinedAttendeeController(usecase);

export const handler: SNSHandler = async (event) => controller.execute(event);
