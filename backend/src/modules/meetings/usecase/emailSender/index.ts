import 'source-map-support/register';
import { SQSHandler } from 'aws-lambda';
import { SESConfig, SESService } from '@src/shared/infra/emailService/SESService';
import { EmailSenderUseCase } from './EmailSenderUseCase';
import { EmailSenderController } from './EmailSenderController';

// Email Service
const sesService = new SESService(SESConfig);

// Use Cases
const usecase = new EmailSenderUseCase(sesService);

// Controller
const controller = new EmailSenderController(usecase);

export const handler: SQSHandler = async (event) => controller.execute(event);
