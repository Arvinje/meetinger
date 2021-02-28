import 'source-map-support/register';
import DDBConfig from '@src/shared/infra/dynamodb/dynamodb';
import { SNSHandler } from 'aws-lambda';
import { DynamoDBUserRepo } from '@users/repos/implementations/DynamoDBUserRepo';
import { SESConfig, SESService } from '@src/shared/infra/emailService/SESService';
import { EmailJoinedAttendeeUseCase } from './EmailJoinedAttendeeUseCase';
import { EmailJoinedAttendeeController } from './EmailJoinedAttendeeController';

// EmailService
const sesService = new SESService(SESConfig);

// Repositories
const userRepo = new DynamoDBUserRepo(DDBConfig);

// Use Cases
const usecase = new EmailJoinedAttendeeUseCase(sesService, userRepo);

// Controller
const controller = new EmailJoinedAttendeeController(usecase);

export const handler: SNSHandler = async (event) => controller.execute(event);
