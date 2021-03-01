import { SQSEvent, SQSRecord } from 'aws-lambda';
import { EmailMessage } from '@src/shared/infra/emailService/EmailMessage';
import { EmailSenderUseCase } from './EmailSenderUseCase';

export class EmailSenderController {
  private useCase: EmailSenderUseCase;

  constructor(useCase: EmailSenderUseCase) {
    this.useCase = useCase;
  }

  async execute(event: SQSEvent): Promise<void> {
    const messages = event.Records.map((r: SQSRecord) =>
      this.useCase.execute(JSON.parse(r.body) as EmailMessage)
    );
    await Promise.allSettled(messages);
  }
}
